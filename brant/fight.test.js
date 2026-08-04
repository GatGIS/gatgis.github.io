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

    advanceTurn(session);

    assert.ok(session.boss.currentHp < initialBossHp);
    assert.ok(session.party[0].currentHp > 400);
    assert.ok(session.log.some(entry => entry.includes('heals')));
});

test('targeted previews use the same target as the actual attack and cycle through alive raiders', () => {
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
    assert.equal(firstPreview?.type, 'targeted');
    const firstTargetName = firstPreview?.target;

    advanceTurn(session);

    assert.equal(session.bossAbilityTargetName, firstTargetName);

    const nextPreview = getBossPreview(session);
    assert.ok(nextPreview?.target);
    assert.notEqual(nextPreview.target, firstTargetName);
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

    const preview = require('./fight.js').getBossPreview(session);

    assert.equal(preview?.target, 'Tank');
});
