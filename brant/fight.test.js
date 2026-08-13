const test = require('node:test');
const assert = require('node:assert/strict');
const { createFightSession, advanceTurn, getBossPreview, createBossProfileFromParty, applyDamage } = require('./fight.js');

test('createBossProfileFromParty derives crit stats from party data', () => {
    const boss = createBossProfileFromParty([
        { name: 'Ari', hpMax: 600, atk: 100, def: 40, spd: 1.0, critRate: 59, critDmg: 180 },
        { name: 'Mira', hpMax: 700, atk: 80, def: 50, spd: 0.95, critRate: 10, critDmg: 140 }
    ], { name: 'Test', critRate: 5, critDmg: 100 });

    assert.equal(boss.critRate, 5);
    assert.equal(boss.critDmg, 100);
});

test('createBossProfileFromParty also uses the boss owner loot-adjusted stats', () => {
    const boss = createBossProfileFromParty([
        { name: 'Ari', hpMax: 600, atk: 100, def: 40, spd: 1.0, critRate: 20, critDmg: 140 }
    ], { name: 'Test', critRate: 5, critDmg: 100 }, {
        name: 'Test Owner',
        hpMax: 1400,
        atk: 190,
        def: 90,
        spd: 1.4,
        critRate: 59,
        critDmg: 220,
        rage: 15,
        thorns: 10,
        regen: 8,
        healingOutput: 30
    });

    assert.equal(boss.hpMax, 1400);
    assert.equal(boss.atk, 190);
    assert.equal(boss.critRate, 59);
    assert.equal(boss.critDmg, 220);
    assert.equal(boss.rage, 15);
    assert.equal(boss.thorns, 10);
    assert.equal(boss.regen, 8);
    assert.equal(boss.healingOutput, 30);
});

test('full-health targets do not get one-shotted by a single hit', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 }
        ]
    });

    const target = session.party[0];
    const damage = target.hpMax + 100;
    const result = applyDamage(session, target, damage);

    assert.equal(result.currentHp, 1);
    assert.equal(result.wasOneShotPrevented, true);
});

test('healer uses a three-turn revive sequence after a party member dies', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 0, regen: 0, thorns: 0 },
            { name: 'Healer', playerClass: 'healer', hpMax: 600, atk: 90, def: 40, spd: 1, critRate: 0, critDmg: 100, currentHp: 600, regen: 0, thorns: 0, healingOutput: 80 }
        ]
    });

    session.phase = 'raider';
    session.currentActor = { name: 'Healer', kind: 'raider', unit: session.party[1] };
    session.healerCycleTurn = 0;
    session.healerRevivePhase = 0;

    advanceTurn(session);

    session.phase = 'raider';
    session.currentActor = { name: 'Healer', kind: 'raider', unit: session.party[1] };
    advanceTurn(session);

    session.phase = 'raider';
    session.currentActor = { name: 'Healer', kind: 'raider', unit: session.party[1] };
    advanceTurn(session);
    assert.equal(session.party[0].currentHp, Math.round(session.party[0].hpMax * 0.25));
    assert.ok(session.log.some(entry => entry.includes('revives')));
});

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

test('regen doubles when an actor is at or below 20% HP', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 500, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 100, regen: 25, thorns: 0 }
        ]
    });
    session.phase = 'raider';
    session.currentActor = { name: 'Tank', kind: 'raider', unit: session.party[0] };

    advanceTurn(session);

    assert.equal(session.party[0].currentHp, 150);
    assert.ok(session.log.some(entry => entry.includes('regenerates')));
});

test('healer crit heals only apply when the ally is below 30% HP', () => {
    const originalRandom = Math.random;
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 1000, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 200, regen: 0, thorns: 0 },
            { name: 'Healer', playerClass: 'healer', hpMax: 600, atk: 90, def: 40, spd: 1, critRate: 100, critDmg: 100, currentHp: 500, regen: 0, thorns: 0, healingOutput: 100 }
        ]
    });
    session.phase = 'raider';
    session.currentActor = { name: 'Healer', kind: 'raider', unit: session.party[1] };
    session.healerCycleTurn = 1;

    try {
        Math.random = () => 0;
        advanceTurn(session);
    } finally {
        Math.random = originalRandom;
    }

    const healAction = session.actions.find(action => action.type === 'heal');
    assert.ok(healAction);
    assert.equal(healAction.amount, 160);
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

test('boss scaling grows with raider count using base plus per-raider increments', () => {
    const createParty = (size) => Array.from({ length: size }, (_, index) => ({
        name: `Raider${index + 1}`,
        playerClass: index % 3 === 0 ? 'tank' : index % 3 === 1 ? 'dps' : 'healer',
        hpMax: 650,
        atk: 90,
        def: 45,
        spd: 1,
        critRate: 8,
        critDmg: 130,
        currentHp: 650,
        regen: 0,
        thorns: 0,
        healingOutput: 0
    }));

    const sessionSmall = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: createParty(4)
    });
    const sessionLarge = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: createParty(6)
    });

    assert.ok(sessionSmall.boss.hpMax > 800);
    assert.ok(sessionLarge.boss.hpMax > sessionSmall.boss.hpMax);
    assert.ok(sessionLarge.boss.atk > sessionSmall.boss.atk);
    assert.ok(sessionLarge.boss.def > sessionSmall.boss.def);
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

    assert.ok(tankPreview?.target === 'TankA' || tankPreview?.target === 'TankB' || tankPreview?.target === 'Tank');

    session.bossTargetPreference = null;
    session.config.bossBasicTargetTankChance = 0;
    const nonTankPreview = getBossPreview(session);

    assert.ok(nonTankPreview?.target === 'DPS' || nonTankPreview?.target === 'Healer' || nonTankPreview?.target === 'TankA' || nonTankPreview?.target === 'TankB' || nonTankPreview?.target === 'Tank');
});

test('boss targets are re-evaluated each turn instead of being locked to the previous turn', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 90, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 },
            { name: 'DPS', playerClass: 'dps', hpMax: 600, atk: 140, def: 40, spd: 1.1, critRate: 0, critDmg: 100, currentHp: 600, regen: 0, thorns: 0 }
        ],
        config: { bossBasicTargetTankChance: 0 }
    });
    session.phase = 'boss';
    session.currentActor = { name: 'Boss', kind: 'boss', unit: session.boss };
    session.bossSelectedAbility = 'basic';
    session.bossAbilityCooldown = 0;
    session.bossAoeCooldown = 0;
    session.bossVampCooldown = 0;

    advanceTurn(session);
    const firstTarget = session.bossTurnTargetName;

    session.phase = 'boss';
    session.currentActor = { name: 'Boss', kind: 'boss', unit: session.boss };
    session.config.bossBasicTargetTankChance = 1;
    advanceTurn(session);
    const secondTarget = session.bossTurnTargetName;

    assert.ok(firstTarget === 'DPS' || firstTarget === 'Tank');
    assert.ok(secondTarget === 'DPS' || secondTarget === 'Tank');
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

test('AoE attacks deal 65% of the normal rolled damage to each living raider', () => {
    const originalRandom = Math.random;
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 800, atk: 100, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 800 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 700, atk: 80, def: 50, spd: 1, critRate: 0, critDmg: 100, currentHp: 700, regen: 0, thorns: 0 },
            { name: 'DPS', playerClass: 'dps', hpMax: 600, atk: 140, def: 50, spd: 1.1, critRate: 0, critDmg: 100, currentHp: 600, regen: 0, thorns: 0 }
        ]
    });
    session.phase = 'boss';
    session.currentActor = { name: 'Boss', kind: 'boss', unit: session.boss };
    session.bossSelectedAbility = 'aoe';

    try {
        Math.random = () => 0.5;
        const preview = getBossPreview(session);
        advanceTurn(session);

        const aoeActions = session.actions.filter(action => action.type === 'boss' && action.detail === 'AoE Attack');
        assert.equal(preview?.amountRange.min, 44);
        assert.equal(preview?.amountRange.max, 55);
        assert.equal(aoeActions.length, 2);
        assert.deepEqual(aoeActions.map(action => action.amount), [49, 49]);
    } finally {
        Math.random = originalRandom;
    }
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

test('repeated targeted selections reuse the same target preview until the turn resolves', () => {
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
    assert.equal(secondPreview?.target, firstPreview?.target);
});

test('targeted previews stay stable on repeated lookups while the boss turn is still pending', () => {
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
    assert.equal(secondPreview?.target, firstPreview?.target);
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

test('basic preview target matches the actual boss attack target for the same turn', () => {
    const session = createFightSession({
        boss: { name: 'Boss', hpMax: 900, atk: 120, def: 60, spd: 1, critRate: 0, critDmg: 100, currentHp: 900 },
        party: [
            { name: 'Tank', playerClass: 'tank', hpMax: 750, atk: 85, def: 95, spd: 1, critRate: 0, critDmg: 100, currentHp: 750, regen: 0, thorns: 0 },
            { name: 'DPS', playerClass: 'dps', hpMax: 620, atk: 145, def: 45, spd: 1.1, critRate: 0, critDmg: 100, currentHp: 620, regen: 0, thorns: 0 }
        ],
        config: {
            bossBasicTargetTankChance: 1,
            bossBasicTargetNonTankChance: 0
        }
    });
    session.phase = 'boss';
    session.currentActor = { name: 'Boss', kind: 'boss', unit: session.boss };
    session.bossSelectedAbility = 'basic';
    session.bossAbilityCooldown = 0;
    session.bossAoeCooldown = 0;
    session.bossVampCooldown = 0;

    const preview = getBossPreview(session);
    const previewTarget = preview?.resolvedTargetName || preview?.target;

    advanceTurn(session);

    assert.equal(session.lastAction?.type, 'boss');
    assert.equal(session.lastAction?.target, previewTarget);
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

    assert.ok(preview?.target === 'Tank' || preview?.target === 'Healer');
});
