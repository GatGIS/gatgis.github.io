const test = require('node:test');
const assert = require('node:assert/strict');
const { createFightSession, advanceTurn, getBossPreview } = require('./fight.js');

test('advanceTurn progresses the fight and records an action', () => {
    const session = createFightSession({
        boss: {
            name: 'Boss',
            hpMax: 800,
            atk: 120,
            def: 40,
            spd: 1.0,
            critRate: 10,
            critDmg: 150,
            currentHp: 800
        },
        party: [
            { name: 'Ari', playerClass: 'dps', hpMax: 600, atk: 110, def: 35, spd: 1.2, critRate: 12, critDmg: 150, rage: 20, currentHp: 600 },
            { name: 'Mira', playerClass: 'healer', hpMax: 550, atk: 70, def: 30, spd: 0.95, critRate: 8, critDmg: 140, healingOutput: 50, currentHp: 550 }
        ]
    });
    session.phase = 'boss';
    session.currentActor = { name: 'Boss', kind: 'boss', unit: session.boss };

    advanceTurn(session);

    assert.equal(session.turnNumber, 1);
    assert.ok(session.currentActor?.name === 'Ari' || session.currentActor?.name === 'Mira' || session.currentActor?.name === 'Boss');
    assert.ok(session.log.some(entry => entry.includes('uses')) || session.log.some(entry => entry.includes('heals')) || session.log.some(entry => entry.includes('attacks')));
    assert.ok(session.phase === 'raider' || session.phase === 'boss');
});

test('regen heals the acting raider at the end of their turn', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 650, regen: 25, thorns: 20 }
        ]
    });
    session.phase = 'raider';
    session.currentActor = { name: 'Tank', kind: 'raider', unit: session.party[0] };

    advanceTurn(session);

    assert.ok(session.party[0].currentHp > 650);
    assert.ok(session.log.some(entry => entry.includes('regenerates')));
});

test('thorns retaliate against the attacker after a hit', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 35 },
            { name: 'DPS', playerClass: 'dps', hpMax: 600, atk: 140, def: 40, spd: 1.1, critRate: 0, critDmg: 100, currentHp: 600, regen: 0, thorns: 0 }
        ]
    });
    session.phase = 'boss';
    session.currentActor = { name: 'Boss', kind: 'boss', unit: session.boss };
    session.bossAbilityCooldown = 0;
    session.bossAoeCooldown = 0;
    session.bossVampCooldown = 0;
    session.config.bossBasicTargetTankChance = 1;

    advanceTurn(session);

    assert.ok(session.boss.currentHp < session.boss.hpMax);
    assert.ok(session.log.some(entry => entry.includes('thorns')));
});

test('the healer damages the boss before healing the lowest-health ally', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 },
            { name: 'Healer', playerClass: 'healer', hpMax: 600, atk: 90, def: 40, spd: 1, critRate: 0, critDmg: 100, currentHp: 600, regen: 0, thorns: 0, healingOutput: 70 }
        ]
    });
    const initialBossHp = session.boss.currentHp;
    session.party[0].currentHp = 400;
    session.phase = 'raider';
    session.currentActor = { name: 'Healer', kind: 'raider', unit: session.party[1] };
    session.healerCycleTurn = 1;

    advanceTurn(session);

    assert.ok(session.boss.currentHp < initialBossHp);
    assert.ok(session.party[0].currentHp > 400);
    assert.ok(session.log.some(entry => entry.includes('heals')));
});

test('healer healing is reduced when the same ally is targeted on consecutive turns', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 400, regen: 0, thorns: 0 },
            { name: 'Healer', playerClass: 'healer', hpMax: 600, atk: 90, def: 40, spd: 1, critRate: 0, critDmg: 100, currentHp: 500, regen: 0, thorns: 0, healingOutput: 80 }
        ]
    });
    session.phase = 'raider';
    session.currentActor = { name: 'Healer', kind: 'raider', unit: session.party[1] };
    session.turnNumber = 1;
    session.healerCycleTurn = 1;
    session.lastHealedTargetName = 'Tank';
    session.lastHealedTurnNumber = 1;

    advanceTurn(session);

    const healAction = session.actions.find(action => action.type === 'heal');
    assert.ok(healAction);
    assert.equal(healAction.amount, 60);
});

test('boss enrage increases basic attack damage once the boss is below 20% HP', () => {
    const fullHpSession = createFightSession({
        boss: { name: 'Boss', hpMax: 100, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 100 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 }
        ]
    });
    const lowHpSession = createFightSession({
        boss: { name: 'Boss', hpMax: 100, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 100 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 }
        ]
    });
    lowHpSession.boss.currentHp = 15;

    const fullPreview = getBossPreview(fullHpSession);
    const lowPreview = getBossPreview(lowHpSession);

    assert.equal(lowPreview?.type, 'basic');
    assert.ok(lowPreview?.amount > fullPreview?.amount);
});

test('healer alternates attack and heal turns instead of doing both each time', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 400, regen: 0, thorns: 0 },
            { name: 'Healer', playerClass: 'healer', hpMax: 600, atk: 90, def: 40, spd: 1, critRate: 0, critDmg: 100, currentHp: 500, regen: 0, thorns: 0, healingOutput: 80 }
        ]
    });
    session.phase = 'raider';
    session.currentActor = { name: 'Healer', kind: 'raider', unit: session.party[1] };
    session.turnNumber = 0;
    session.healerCycleTurn = 0;

    advanceTurn(session);
    const firstTurnHealActions = session.actions.filter(action => action.type === 'heal');
    assert.equal(firstTurnHealActions.length, 0);

    session.phase = 'raider';
    session.currentActor = { name: 'Healer', kind: 'raider', unit: session.party[1] };
    session.turnNumber = 2;
    session.healerCycleTurn = 1;
    session.lastHealedTargetName = null;
    session.lastHealedTurnNumber = null;

    advanceTurn(session);
    const secondTurnHealActions = session.actions.filter(action => action.type === 'heal');
    assert.ok(secondTurnHealActions.length >= 1);
});

test('boss hp and damage scale more aggressively with more raiders', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 },
            { name: 'DPS', playerClass: 'dps', hpMax: 600, atk: 140, def: 40, spd: 1.1, critRate: 0, critDmg: 100, currentHp: 600, regen: 0, thorns: 0 },
            { name: 'Healer', playerClass: 'healer', hpMax: 550, atk: 90, def: 35, spd: 1, critRate: 0, critDmg: 100, currentHp: 550, regen: 0, thorns: 0, healingOutput: 60 },
            { name: 'Support', playerClass: 'dps', hpMax: 500, atk: 100, def: 35, spd: 1, critRate: 0, critDmg: 100, currentHp: 500, regen: 0, thorns: 0 }
        ]
    });

    assert.ok(session.boss.hpMax >= 1200);
    assert.ok(session.boss.atk >= 120);
});

test('basic attack target preference uses configurable tank and non-tank pools', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'TankA', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 },
            { name: 'TankB', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 },
            { name: 'DPS', playerClass: 'dps', hpMax: 600, atk: 140, def: 40, spd: 1.1, critRate: 0, critDmg: 100, currentHp: 600, regen: 0, thorns: 0 },
            { name: 'Healer', playerClass: 'healer', hpMax: 550, atk: 90, def: 35, spd: 1, critRate: 0, critDmg: 100, currentHp: 550, regen: 0, thorns: 0, healingOutput: 60 }
        ],
        config: { bossBasicTargetTankChance: 1 }
    });
    session.phase = 'boss';
    session.currentActor = { name: 'Boss', kind: 'boss', unit: session.boss };
    session.bossSelectedAbility = 'basic';
    session.bossAbilityCooldown = 0;
    session.bossAoeCooldown = 0;
    session.bossVampCooldown = 0;

    const tankPreview = getBossPreview(session);

    assert.ok(tankPreview?.target === 'TankA' || tankPreview?.target === 'TankB');

    session.bossTargetPreference = null;
    session.config.bossBasicTargetTankChance = 0;
    const nonTankPreview = getBossPreview(session);

    assert.ok(nonTankPreview?.target === 'DPS' || nonTankPreview?.target === 'Healer' || nonTankPreview?.target === 'TankA' || nonTankPreview?.target === 'TankB');
});

test('boss previews expose a deterministic min-max damage range based on defender defense', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 },
            { name: 'DPS', playerClass: 'dps', hpMax: 600, atk: 140, def: 40, spd: 1.1, critRate: 0, critDmg: 100, currentHp: 600, regen: 0, thorns: 0 },
            { name: 'Healer', playerClass: 'healer', hpMax: 550, atk: 90, def: 35, spd: 1, critRate: 0, critDmg: 100, currentHp: 550, regen: 0, thorns: 0, healingOutput: 60 },
            { name: 'Support', playerClass: 'dps', hpMax: 500, atk: 100, def: 35, spd: 1, critRate: 0, critDmg: 100, currentHp: 500, regen: 0, thorns: 0 }
        ]
    });
    session.phase = 'boss';
    session.currentActor = { name: 'Boss', kind: 'boss', unit: session.boss };
    session.bossSelectedAbility = 'basic';
    session.bossAbilityCooldown = 0;
    session.bossAoeCooldown = 0;
    session.bossVampCooldown = 0;

    const preview = getBossPreview(session);

    assert.ok(preview?.amountRange);
    assert.ok(preview.amountRange.min <= preview.amount && preview.amount <= preview.amountRange.max);
});

test('changing the selected boss ability rebuilds the preview instead of reusing the old one', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 },
            { name: 'DPS', playerClass: 'dps', hpMax: 600, atk: 140, def: 40, spd: 1.1, critRate: 0, critDmg: 100, currentHp: 600, regen: 0, thorns: 0 }
        ]
    });
    session.phase = 'boss';
    session.currentActor = { name: 'Boss', kind: 'boss', unit: session.boss };
    session.bossSelectedAbility = 'basic';
    session.bossAbilityCooldown = 0;
    session.bossAoeCooldown = 0;
    session.bossVampCooldown = 0;

    const firstPreview = getBossPreview(session);
    session.bossSelectedAbility = 'targeted';
    const secondPreview = getBossPreview(session);

    assert.equal(firstPreview?.type, 'basic');
    assert.equal(secondPreview?.type, 'targeted');
});

test('repeated targeted selections advance the target instead of reusing the same preview', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 },
            { name: 'DPS', playerClass: 'dps', hpMax: 600, atk: 140, def: 40, spd: 1.1, critRate: 0, critDmg: 100, currentHp: 600, regen: 0, thorns: 0 },
            { name: 'Healer', playerClass: 'healer', hpMax: 550, atk: 90, def: 35, spd: 1, critRate: 0, critDmg: 100, currentHp: 550, regen: 0, thorns: 0, healingOutput: 60 }
        ]
    });
    session.phase = 'boss';
    session.currentActor = { name: 'Boss', kind: 'boss', unit: session.boss };
    session.bossSelectedAbility = 'targeted';
    session.bossAbilityCooldown = 0;
    session.bossAoeCooldown = 0;
    session.bossVampCooldown = 0;

    const firstPreview = getBossPreview(session);
    const secondPreview = getBossPreview(session);

    assert.equal(firstPreview?.type, 'targeted');
    assert.equal(secondPreview?.type, 'targeted');
    assert.notEqual(secondPreview?.target, firstPreview?.target);
});

test('targeted previews advance the target on repeated lookups while the boss turn is still pending', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 },
            { name: 'DPS', playerClass: 'dps', hpMax: 600, atk: 140, def: 40, spd: 1.1, critRate: 0, critDmg: 100, currentHp: 600, regen: 0, thorns: 0 },
            { name: 'Healer', playerClass: 'healer', hpMax: 550, atk: 90, def: 35, spd: 1, critRate: 0, critDmg: 100, currentHp: 550, regen: 0, thorns: 0, healingOutput: 60 },
            { name: 'Support', playerClass: 'dps', hpMax: 500, atk: 100, def: 35, spd: 1, critRate: 0, critDmg: 100, currentHp: 500, regen: 0, thorns: 0 }
        ]
    });
    session.phase = 'boss';
    session.currentActor = { name: 'Boss', kind: 'boss', unit: session.boss };
    session.bossSelectedAbility = 'targeted';
    session.bossAbilityCooldown = 0;
    session.bossAoeCooldown = 0;
    session.bossVampCooldown = 0;

    const firstPreview = getBossPreview(session);
    const secondPreview = getBossPreview(session);

    assert.equal(firstPreview?.type, 'targeted');
    assert.equal(secondPreview?.type, 'targeted');
    assert.notEqual(secondPreview?.target, firstPreview?.target);
});

test('targeted previews skip dead raiders and continue in party order after a death', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 },
            { name: 'DeadDPS', playerClass: 'dps', hpMax: 600, atk: 140, def: 40, spd: 1.1, critRate: 0, critDmg: 100, currentHp: 0, regen: 0, thorns: 0 },
            { name: 'DPS2', playerClass: 'dps', hpMax: 600, atk: 140, def: 40, spd: 1.1, critRate: 0, critDmg: 100, currentHp: 600, regen: 0, thorns: 0 },
            { name: 'DPS3', playerClass: 'dps', hpMax: 600, atk: 140, def: 40, spd: 1.1, critRate: 0, critDmg: 100, currentHp: 600, regen: 0, thorns: 0 },
            { name: 'Healer', playerClass: 'healer', hpMax: 550, atk: 90, def: 35, spd: 1, critRate: 0, critDmg: 100, currentHp: 550, regen: 0, thorns: 0, healingOutput: 60 }
        ]
    });
    session.phase = 'boss';
    session.currentActor = { name: 'Boss', kind: 'boss', unit: session.boss };
    session.bossSelectedAbility = 'targeted';
    session.bossAbilityCooldown = 0;
    session.bossAoeCooldown = 0;
    session.bossVampCooldown = 0;
    session.bossTargetCursor = 3;

    const preview = getBossPreview(session);

    assert.equal(preview?.target, 'DPS3');
});

test('targeted previews use the same target as the actual attack and cycle through alive raiders', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 },
            { name: 'DPS', playerClass: 'dps', hpMax: 600, atk: 140, def: 40, spd: 1.1, critRate: 0, critDmg: 100, currentHp: 600, regen: 0, thorns: 0 },
            { name: 'Healer', playerClass: 'healer', hpMax: 550, atk: 90, def: 35, spd: 1, critRate: 0, critDmg: 100, currentHp: 550, regen: 0, thorns: 0, healingOutput: 60 },
            { name: 'Support', playerClass: 'dps', hpMax: 500, atk: 100, def: 35, spd: 1, critRate: 0, critDmg: 100, currentHp: 500, regen: 0, thorns: 0 }
        ]
    });
    session.phase = 'boss';
    session.currentActor = { name: 'Boss', kind: 'boss', unit: session.boss };
    session.bossSelectedAbility = 'targeted';
    session.bossAbilityCooldown = 0;
    session.bossAoeCooldown = 0;
    session.bossVampCooldown = 0;

    const firstPreview = getBossPreview(session);
    assert.equal(firstPreview?.type, 'targeted');
    const firstTargetName = firstPreview?.resolvedTargetName || firstPreview?.target;

    advanceTurn(session);

    assert.equal(session.bossAbilityTargetName, firstTargetName);

    const nextPreview = getBossPreview(session);
    assert.ok(nextPreview?.target);
    assert.ok(nextPreview?.resolvedTargetName || nextPreview?.target);
});

test('the healer can fall back to self-healing when it is the most injured ally', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 },
            { name: 'Healer', playerClass: 'healer', hpMax: 600, atk: 90, def: 40, spd: 1, critRate: 0, critDmg: 100, currentHp: 300, regen: 0, thorns: 0, healingOutput: 80 }
        ]
    });
    session.phase = 'raider';
    session.currentActor = { name: 'Healer', kind: 'raider', unit: session.party[1] };
    session.healerCycleTurn = 1;

    advanceTurn(session);

    assert.ok(session.party[1].currentHp > 300);
    assert.ok(session.log.some(entry => entry.includes('heals Healer')) || session.log.some(entry => entry.includes('Healer heals Healer')));
});

test('normal boss attacks should not inherit the previous targeted target', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 },
            { name: 'Healer', playerClass: 'healer', hpMax: 600, atk: 90, def: 40, spd: 1, critRate: 0, critDmg: 100, currentHp: 600, regen: 0, thorns: 0, healingOutput: 60 }
        ]
    });
    session.bossSelectedAbility = 'basic';
    session.bossAbilityTargetName = 'Healer';
    session.config.bossBasicTargetTankChance = 1;

    const preview = require('./fight.js').getBossPreview(session);

    assert.equal(preview?.target, 'Tank');
});
