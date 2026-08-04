(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
    root.BrantFight = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const defaultConfig = {
        bossAbilityNames: ['Ground Slam', 'Arcane Pulse', 'Shadow Burst'],
        bossAbilityInterval: 2,
        bossAoeInterval: 3,
        bossVampInterval: 2,
        healerRepeatTargetPenalty: 0.75,
        healerRepeatTargetPenaltyBias: 0.08,
        bossEnrageThreshold: 0.3,
        bossEnrageDamageMultiplier: 1.5,
        bossBasicTargetTankChance: 0.70,
        bossBasicTargetNonTankChance: 0.30
    };

    const createFightSession = ({ boss, party, config = {} }) => {
        const mergedConfig = { ...defaultConfig, ...config };
        const partyCount = Math.max(1, Array.isArray(party) ? party.length : 0);
        const hpMultiplier = 1 + (partyCount - 1) * 0.24;
        const atkMultiplier = 1 + (partyCount - 1) * 0.2;
        const defMultiplier = 1 + (partyCount - 1) * 0.1;
        const scaledBoss = {
            ...boss,
            hpMax: Math.max(1, Math.round((boss.hpMax ?? boss.currentHp ?? 1000) * hpMultiplier)),
            atk: Math.max(1, Math.round((boss.atk ?? 100) * atkMultiplier)),
            def: Math.max(1, Math.round((boss.def ?? 50) * defMultiplier))
        };
        scaledBoss.currentHp = scaledBoss.hpMax;

        const session = {
            config: mergedConfig,
            boss: scaledBoss,
            party: (Array.isArray(party) ? party : []).map(member => ({
                ...member,
                currentHp: member.currentHp ?? member.hpMax,
                inventory: Array.isArray(member.inventory) ? [...member.inventory] : []
            })),
            turnNumber: 0,
            log: [],
            status: 'ready',
            winner: null,
            round: 1,
            phase: 'setup',
            currentActor: null,
            raiderIndex: 0,
            actions: [],
            lastAction: null,
            lastPreview: null,
            bossAbilityCooldown: 0,
            bossAoeCooldown: 0,
            bossVampCooldown: 0,
            bossSelectedAbility: 'basic',
            bossAbilityTargetName: null,
            bossTurnTargetName: null,
            bossTargetCursor: 0,
            bossTargetPreference: null,
            lastHealedTargetName: null,
            lastHealedTurnNumber: null,
            healerCycleTurn: 0,
            highlightUntil: 0
        };
        return session;
    };

    const calculateBaseDamage = (attacker, defender, session = null) => {
        const base = attacker.atk * (attacker.atk / (attacker.atk + defender.def * 1.25)) * 0.72;
        let multiplier = 1;
        if (attacker.name === 'Boss' && attacker.currentHp > 0 && attacker.hpMax > 0 && session?.config) {
            const hpRatio = attacker.currentHp / attacker.hpMax;
            const threshold = session.config.bossEnrageThreshold ?? 0.2;
            const damageMultiplier = session.config.bossEnrageDamageMultiplier ?? 1.5;
            if (hpRatio <= threshold) {
                multiplier = damageMultiplier;
            }
        }
        return Math.max(1, Math.round(base * multiplier));
    };

    const calculateDamageBounds = (attacker, defender, session = null) => {
        const baseDamage = calculateBaseDamage(attacker, defender, session);
        return {
            min: Math.max(1, Math.round(baseDamage * 0.9)),
            max: Math.max(1, Math.round(baseDamage * 1.1)),
            base: baseDamage
        };
    };

    const calculateDamageResult = (attacker, defender, session = null) => {
        const baseDamage = calculateBaseDamage(attacker, defender, session);
        const variation = 0.9 + Math.random() * 0.2;
        let damage = Math.round(baseDamage * variation);
        let crit = false;
        if (attacker.rage) {
            damage = Math.round(damage * (1 + attacker.rage / 100));
        }
        if (Math.random() * 100 < attacker.critRate) {
            crit = true;
            damage = Math.round(damage * (1 + (attacker.critDmg / 100) * 0.6));
        }
        return { damage: Math.max(1, damage), crit };
    };

    const calculateDamage = (attacker, defender, session = null) => calculateDamageResult(attacker, defender, session).damage;

    const calculatePredictedDamage = (attacker, defender, session = null) => calculateBaseDamage(attacker, defender, session);

    const getAliveRaiders = (session) => session.party.filter(member => member.currentHp > 0);

    const selectTarget = (session, actor) => {
        if (!actor) {
            return null;
        }
        const aliveParty = getAliveRaiders(session);
        if (actor.playerClass === 'healer') {
            return aliveParty.reduce((best, candidate) => {
                if (!best) {
                    return candidate;
                }
                const bestRatio = best.currentHp / best.hpMax;
                const candRatio = candidate.currentHp / candidate.hpMax;
                return candRatio < bestRatio ? candidate : best;
            }, null);
        }
        return session.boss;
    };

    const selectHealerTarget = (session, actor) => {
        if (!actor) {
            return null;
        }
        const aliveParty = getAliveRaiders(session);
        if (aliveParty.length === 0) {
            return null;
        }
        const previousTargetName = session.lastHealedTargetName;
        const previousTurnNumber = session.lastHealedTurnNumber;
        const currentTurnNumber = session.turnNumber || 0;
        const sameTargetLastTurn = previousTargetName && previousTurnNumber === currentTurnNumber - 1;
        const bias = session.config?.healerRepeatTargetPenaltyBias ?? 0.08;
        return aliveParty.reduce((best, candidate) => {
            if (!best) {
                return candidate;
            }
            const bestRatio = best.currentHp / best.hpMax;
            const candidateRatio = candidate.currentHp / candidate.hpMax;
            const isSameTarget = candidate.name === previousTargetName && sameTargetLastTurn;
            const bestScore = isSameTarget ? bestRatio + bias : bestRatio;
            const candidateScore = isSameTarget ? candidateRatio + bias : candidateRatio;
            return candidateScore < bestScore ? candidate : best;
        }, null);
    };

    const getBossTargetPreference = (session) => {
        if (session.bossTargetPreference !== null) {
            return session.bossTargetPreference;
        }
        const tankChance = session.config?.bossBasicTargetTankChance ?? defaultConfig.bossBasicTargetTankChance ?? 0.75;
        const roll = Math.random();
        session.bossTargetPreference = roll <= tankChance ? 'tank' : 'other';
        return session.bossTargetPreference;
    };

    const getBossTurnTarget = (session) => {
        const aliveParty = getAliveRaiders(session);
        if (aliveParty.length === 0) {
            return null;
        }
        const savedTarget = session.bossTurnTargetName
            ? aliveParty.find(member => member.name === session.bossTurnTargetName)
            : null;
        if (savedTarget) {
            return savedTarget;
        }
        const target = getBossTarget(session, 'basic');
        session.bossTurnTargetName = target?.name || null;
        session.bossAbilityTargetName = target?.name || null;
        return target;
    };

    const getBossTarget = (session, abilityType = 'basic') => {
        const aliveParty = getAliveRaiders(session);
        if (aliveParty.length === 0) {
            return null;
        }
        if (abilityType === 'targeted') {
            const cursor = Number.isInteger(session.bossTargetCursor) ? session.bossTargetCursor : 0;
            const partyLength = Math.max(1, Array.isArray(session.party) ? session.party.length : 0);
            const startIndex = cursor % partyLength;
            let target = null;
            for (let offset = 0; offset < partyLength; offset += 1) {
                const candidateIndex = (startIndex + offset) % partyLength;
                const candidate = session.party[candidateIndex];
                if (candidate && candidate.currentHp > 0) {
                    target = candidate;
                    session.bossTargetCursor = (candidateIndex + 1) % partyLength;
                    session.bossAbilityTargetName = target.name;
                    break;
                }
            }
            return target || aliveParty[0] || null;
        }
        const preference = getBossTargetPreference(session);
        const tanks = aliveParty.filter(member => member.playerClass === 'tank');
        if (preference === 'tank' && tanks.length > 0) {
            const target = tanks[Math.floor(Math.random() * tanks.length)];
            session.bossAbilityTargetName = target.name;
            return target;
        }
        const fallbackCandidates = aliveParty.filter(member => member.playerClass !== 'tank');
        const candidates = fallbackCandidates.length > 0 ? fallbackCandidates : aliveParty;
        const target = candidates[Math.floor(Math.random() * candidates.length)];
        session.bossAbilityTargetName = target.name;
        return target;
    };

    const applyThornsRetaliation = (session, attacker, defender) => {
        if (!session || !attacker || !defender || attacker.name === defender.name) {
            return;
        }
        if (!defender.thorns || defender.thorns <= 0 || attacker.currentHp <= 0) {
            return;
        }
        const thornDamage = Math.max(1, Math.round(defender.thorns));
        const previousHp = attacker.currentHp;
        attacker.currentHp = Math.max(0, attacker.currentHp - thornDamage);
        session.log.push(`${defender.name}'s thorns deal ${thornDamage} damage to ${attacker.name}.`);
        session.actions.push({ type: 'thorns', actor: defender.name, target: attacker.name, amount: thornDamage, previousHp, currentHp: attacker.currentHp });
    };

    const applyRegen = (session, actor) => {
        if (!session || !actor || actor.currentHp <= 0 || !actor.regen || actor.regen <= 0) {
            return false;
        }
        const previousHp = actor.currentHp;
        const healAmount = Math.max(1, Math.round(actor.regen));
        actor.currentHp = Math.min(actor.hpMax, actor.currentHp + healAmount);
        session.log.push(`${actor.name} regenerates +${healAmount} HP.`);
        session.actions.push({ type: 'regen', actor: actor.name, target: actor.name, amount: healAmount, previousHp, currentHp: actor.currentHp });
        session.lastAction = { type: 'regen', actor: actor.name, target: actor.name, amount: healAmount, previousHp, currentHp: actor.currentHp, detail: 'Regen' };
        session.highlightUntil = Date.now() + 1200;
        return true;
    };

    const finalizeFight = (session) => {
        if (session.boss.currentHp <= 0) {
            session.status = 'victory';
            session.winner = 'party';
            session.log.push('The boss is defeated.');
            session.phase = 'finished';
            session.currentActor = null;
            return true;
        }
        if (getAliveRaiders(session).length === 0) {
            session.status = 'defeat';
            session.winner = 'boss';
            session.log.push('The party has fallen.');
            session.phase = 'finished';
            session.currentActor = null;
            return true;
        }
        return false;
    };

    const getBossAbilityChoice = (session, preferred) => {
        const requested = preferred || session.bossSelectedAbility || 'basic';
        if (requested === 'targeted' && session.bossAbilityCooldown <= 0) {
            return 'targeted';
        }
        if (requested === 'aoe' && session.bossAoeCooldown <= 0) {
            return 'aoe';
        }
        if (requested === 'vamp' && session.bossVampCooldown <= 0) {
            return 'vamp';
        }
        if (requested === 'basic') {
            return 'basic';
        }
        return 'basic';
    };

    const buildPreview = (session) => {
        const previewTurn = (session.turnNumber || 0) + 1;
        const abilityToUse = getBossAbilityChoice(session, session.bossSelectedAbility);
        const previewKey = `${previewTurn}:${session.boss.name}:${abilityToUse}:${session.bossSelectedAbility || 'basic'}`;
        const shouldReusePreview = session.lastPreview
            && session.lastPreview.turn === previewTurn
            && session.lastPreview.actor === session.boss.name
            && session.lastPreview.previewKey === previewKey
            && abilityToUse !== 'targeted';
        if (shouldReusePreview) {
            return session.lastPreview;
        }

        const target = abilityToUse === 'targeted'
            ? getBossTarget(session, 'targeted')
            : getBossTurnTarget(session);
        if (!target) {
            return null;
        }
        const aliveRaiders = getAliveRaiders(session);
        const partySize = Math.max(1, aliveRaiders.length);
        const baseDamageBounds = calculateDamageBounds(session.boss, target, session);
        let preview = {
            type: 'basic',
            actor: session.boss.name,
            target: target.name,
            resolvedTargetName: target.name,
            amount: Math.round((baseDamageBounds.min + baseDamageBounds.max) / 2),
            amountRange: { min: baseDamageBounds.min, max: baseDamageBounds.max },
            abilityName: 'Basic Attack',
            bossAbilityReady: session.bossAbilityCooldown <= 0,
            turn: previewTurn,
            previewKey
        };
        if (abilityToUse === 'targeted') {
            const targetedBounds = {
                min: Math.max(1, Math.round(baseDamageBounds.min * 1.2)),
                max: Math.max(1, Math.round(baseDamageBounds.max * 1.2))
            };
            preview = {
                type: 'targeted',
                actor: session.boss.name,
                target: target.name,
                resolvedTargetName: target.name,
                amount: Math.round((targetedBounds.min + targetedBounds.max) / 2),
                amountRange: targetedBounds,
                abilityName: 'Targeted Attack',
                bossAbilityReady: true,
                turn: previewTurn,
                previewKey
            };
        } else if (abilityToUse === 'aoe') {
            const aoeRanges = aliveRaiders.map(raider => calculateDamageBounds(session.boss, raider, session));
            const minDamage = Math.max(1, Math.min(...aoeRanges.map(entry => entry.min)));
            const maxDamage = Math.max(...aoeRanges.map(entry => entry.max));
            preview = {
                type: 'aoe',
                actor: session.boss.name,
                target: 'All Raiders',
                resolvedTargetName: null,
                amount: Math.round((minDamage + maxDamage) / 2),
                amountRange: { min: minDamage, max: maxDamage },
                abilityName: 'AoE Attack',
                bossAbilityReady: false,
                turn: previewTurn,
                previewKey
            };
        } else if (abilityToUse === 'vamp') {
            const vampBounds = {
                min: Math.max(1, Math.round(baseDamageBounds.min * 0.85)),
                max: Math.max(1, Math.round(baseDamageBounds.max * 0.85))
            };
            preview = {
                type: 'vamp',
                actor: session.boss.name,
                target: target.name,
                resolvedTargetName: target.name,
                amount: Math.round((vampBounds.min + vampBounds.max) / 2),
                amountRange: vampBounds,
                abilityName: 'Vamp Attack',
                bossAbilityReady: false,
                turn: previewTurn,
                previewKey
            };
        }
        session.lastPreview = preview;
        return preview;
    };

    const applyBossAbility = (session, preview) => {
        const aliveParty = getAliveRaiders(session);
        if (aliveParty.length === 0) {
            return;
        }

        const abilityToUse = getBossAbilityChoice(session, preview?.type);
        const target = abilityToUse === 'targeted'
            ? (preview?.resolvedTargetName
                ? aliveParty.find(member => member.name === preview.resolvedTargetName)
                : null)
            : (preview?.resolvedTargetName && preview?.type !== 'aoe'
                ? aliveParty.find(member => member.name === preview.resolvedTargetName)
                : (session.bossTurnTargetName
                    ? aliveParty.find(member => member.name === session.bossTurnTargetName)
                    : null));
        if (!target && abilityToUse !== 'aoe') {
            return;
        }

        let damage = 0;
        let detail = 'Basic Attack';
        let healAmount = 0;
        let crit = false;

        if (abilityToUse === 'targeted') {
            const baseDamage = calculatePredictedDamage(session.boss, target, session);
            const result = calculateDamageResult(session.boss, target, session);
            damage = result.damage;
            crit = result.crit;
            detail = 'Targeted Attack';
            session.bossAbilityTargetName = target.name;
        } else if (abilityToUse === 'aoe') {
            detail = 'AoE Attack';
            const targets = aliveParty;
            targets.forEach(raider => {
                const result = calculateDamageResult(session.boss, raider, session);
                const hitDamage = result.damage;
                const previousHp = raider.currentHp;
                raider.currentHp = Math.max(0, raider.currentHp - hitDamage);
                const critSuffix = result.crit ? ' (critical)' : '';
                session.log.push(`${session.boss.name} uses ${detail} on ${raider.name} for ${hitDamage} damage${critSuffix}.`);
                session.actions.push({ type: 'boss', actor: session.boss.name, target: raider.name, amount: hitDamage, detail, previousHp, currentHp: raider.currentHp });
                applyThornsRetaliation(session, session.boss, raider);
            });
            session.lastAction = { type: 'boss', actor: session.boss.name, target: 'All Raiders', amount: 0, detail, previousHp: null, currentHp: null };
            session.highlightUntil = Date.now() + 1200;
            session.bossAoeCooldown = session.config.bossAoeInterval;
            session.bossAbilityCooldown = Math.max(0, session.bossAbilityCooldown - 1);
            session.bossVampCooldown = Math.max(0, session.bossVampCooldown - 1);
            return;
        } else if (abilityToUse === 'vamp') {
            const result = calculateDamageResult(session.boss, target, session);
            damage = Math.max(1, Math.round(result.damage * 0.85));
            crit = result.crit;
            detail = 'Vamp Attack';
            healAmount = Math.max(1, Math.round(damage * 0.4));
            const previousHp = target.currentHp;
            target.currentHp = Math.max(0, target.currentHp - damage);
            const critSuffix = crit ? ' (critical)' : '';
            session.log.push(`${session.boss.name} uses ${detail} on ${target.name} for ${damage} damage${critSuffix}.`);
            session.actions.push({ type: 'boss', actor: session.boss.name, target: target.name, amount: damage, detail, previousHp, currentHp: target.currentHp });
            session.lastAction = { type: 'boss', actor: session.boss.name, target: target.name, amount: damage, detail, previousHp, currentHp: target.currentHp, healAmount };
            session.highlightUntil = Date.now() + 1200;
            session.boss.currentHp = Math.min(session.boss.hpMax, session.boss.currentHp + healAmount);
            session.log.push(`${session.boss.name} heals ${healAmount} HP from ${detail}.`);
            session.bossVampCooldown = session.config.bossVampInterval;
            session.bossAbilityCooldown = Math.max(0, session.bossAbilityCooldown - 1);
            session.bossAoeCooldown = Math.max(0, session.bossAoeCooldown - 1);
            return;
        } else {
            const result = calculateDamageResult(session.boss, target, session);
            damage = result.damage;
            crit = result.crit;
            detail = session.config.bossAbilityNames[Math.floor(Math.random() * session.config.bossAbilityNames.length)];
        }

        const previousHp = target.currentHp;
        target.currentHp = Math.max(0, target.currentHp - damage);
        const critSuffix = crit ? ' (critical)' : '';
        session.log.push(`${session.boss.name} uses ${detail} on ${target.name} for ${damage} damage${critSuffix}.`);
        session.actions.push({ type: 'boss', actor: session.boss.name, target: target.name, amount: damage, detail, previousHp, currentHp: target.currentHp });
        session.lastAction = {
            type: 'boss',
            actor: session.boss.name,
            target: target.name,
            amount: damage,
            detail,
            previousHp,
            currentHp: target.currentHp,
            predictedAmount: calculatePredictedDamage(session.boss, target, session),
            abilityReady: abilityToUse === 'targeted'
        };
        session.highlightUntil = Date.now() + 1200;
        applyThornsRetaliation(session, session.boss, target);
        session.bossAbilityTargetName = target.name;
        if (abilityToUse === 'targeted') {
            session.bossAbilityCooldown = session.config.bossAbilityInterval;
        } else {
            session.bossAbilityCooldown = Math.max(0, session.bossAbilityCooldown - 1);
        }
        if (abilityToUse === 'aoe') {
            session.bossAoeCooldown = session.config.bossAoeInterval;
        } else {
            session.bossAoeCooldown = Math.max(0, session.bossAoeCooldown - 1);
        }
        if (abilityToUse === 'vamp') {
            session.bossVampCooldown = session.config.bossVampInterval;
        } else {
            session.bossVampCooldown = Math.max(0, session.bossVampCooldown - 1);
        }
    };

    const applyActorAction = (session, actor) => {
        if (!actor) {
            return;
        }
        if (actor.playerClass === 'healer') {
            const boss = session.boss;
            const shouldHeal = session.healerCycleTurn === 1;
            const attackResult = calculateDamageResult(actor, boss, session);
            const damage = attackResult.damage;
            const previousBossHp = boss.currentHp;
            boss.currentHp = Math.max(0, boss.currentHp - damage);
            const critSuffix = attackResult.crit ? ' (critical)' : '';
            session.log.push(`${actor.name} strikes ${boss.name} for ${damage} damage${critSuffix}.`);
            session.actions.push({ type: 'heal-attack', actor: actor.name, target: boss.name, amount: damage, previousHp: previousBossHp, currentHp: boss.currentHp });
            if (shouldHeal) {
                const healTarget = selectHealerTarget(session, actor);
                if (healTarget) {
                    const sameTargetLastTurn = session.lastHealedTargetName && session.lastHealedTurnNumber === session.turnNumber - 1 && healTarget.name === session.lastHealedTargetName;
                    const penalty = session.config?.healerRepeatTargetPenalty ?? 0.75;
                    const effectiveHealOutput = sameTargetLastTurn ? Math.round((actor.healingOutput || 40) * penalty) : (actor.healingOutput || 40);
                    const healAmount = Math.max(0, Math.min(effectiveHealOutput, healTarget.hpMax - healTarget.currentHp));
                    if (healAmount > 0) {
                        const previousHp = healTarget.currentHp;
                        healTarget.currentHp += healAmount;
                        session.log.push(`${actor.name} heals ${healTarget.name} for ${healAmount} HP.`);
                        session.actions.push({ type: 'heal', actor: actor.name, target: healTarget.name, amount: healAmount, previousHp, currentHp: healTarget.currentHp });
                        session.lastAction = { type: 'heal', actor: actor.name, target: healTarget.name, amount: healAmount, previousHp, currentHp: healTarget.currentHp, detail: 'Heal' };
                        session.lastHealedTargetName = healTarget.name;
                        session.lastHealedTurnNumber = session.turnNumber || 0;
                    }
                }
            }
            session.healerCycleTurn = shouldHeal ? 0 : 1;
            session.highlightUntil = Date.now() + 1200;
            return;
        }

        const target = selectTarget(session, actor);
        if (!target) {
            return;
        }
        const attackResult = calculateDamageResult(actor, target, session);
        const damage = attackResult.damage;
        const previousHp = target.currentHp;
        target.currentHp = Math.max(0, target.currentHp - damage);
        const critSuffix = attackResult.crit ? ' (critical)' : '';
        session.log.push(`${actor.name} attacks ${target.name} for ${damage} damage${critSuffix}.`);
        session.actions.push({ type: 'attack', actor: actor.name, target: target.name, amount: damage, previousHp, currentHp: target.currentHp });
        session.lastAction = { type: 'attack', actor: actor.name, target: target.name, amount: damage, previousHp, currentHp: target.currentHp };
        session.highlightUntil = Date.now() + 1200;
        applyThornsRetaliation(session, actor, target);
    };

    const advanceTurn = (session) => {
        if (session.status !== 'ready') {
            return session;
        }

        if (session.phase === 'setup') {
            session.phase = 'boss';
            session.currentActor = { name: session.boss.name, kind: 'boss', unit: session.boss };
            session.lastPreview = buildPreview(session);
            session.log.push(`${session.boss.name} is ready to act.`);
            session.lastAction = { type: 'setup', actor: session.boss.name, target: null, amount: 0, detail: 'Ready' };
            return session;
        }

        if (finalizeFight(session)) {
            return session;
        }

        session.turnNumber += 1;

        if (session.phase === 'boss') {
            session.bossTargetPreference = null;
            const previewForTurn = session.lastPreview?.turn === session.turnNumber
                ? session.lastPreview
                : buildPreview(session);
            session.lastPreview = previewForTurn;
            applyBossAbility(session, previewForTurn);
            session.phase = 'raider';
            session.raiderIndex = 0;
            const nextRaider = getAliveRaiders(session)[0];
            session.currentActor = nextRaider ? { name: nextRaider.name, kind: 'raider', unit: nextRaider } : null;
            if (finalizeFight(session)) {
                return session;
            }
            return session;
        }

        const aliveRaiders = getAliveRaiders(session);
        const currentName = session.currentActor?.name;
        const raider = aliveRaiders.find(member => member.name === currentName) || aliveRaiders[session.raiderIndex];
        if (!raider) {
            session.phase = 'boss';
            session.round += 1;
            session.raiderIndex = 0;
            session.currentActor = { name: session.boss.name, kind: 'boss', unit: session.boss };
            session.lastPreview = buildPreview(session);
            return session;
        }

        applyActorAction(session, raider);
        applyRegen(session, raider);
        const raiderIndex = aliveRaiders.findIndex(member => member.name === raider.name);
        const nextRaider = aliveRaiders[raiderIndex + 1] || null;
        session.raiderIndex = Math.max(0, raiderIndex + 1);
        session.currentActor = nextRaider ? { name: nextRaider.name, kind: 'raider', unit: nextRaider } : null;
        if (!nextRaider) {
            session.phase = 'boss';
            session.round += 1;
            session.currentActor = { name: session.boss.name, kind: 'boss', unit: session.boss };
            session.lastPreview = buildPreview(session);
        }
        finalizeFight(session);
        return session;
    };

    const getFightSummary = (session) => {
        if (session.status === 'victory') {
            return 'Victory! The party survived the encounter.';
        }
        if (session.status === 'defeat') {
            return 'Defeat! The boss remains standing.';
        }
        if (session.phase === 'setup') {
            return 'The arena is ready. Press start to begin the first turn.';
        }
        if (session.phase === 'boss') {
            return `Round ${session.round} • ${session.boss.name} is about to act.`;
        }
        if (session.phase === 'raider') {
            const activeName = session.currentActor?.name || 'Raiders';
            return `Round ${session.round} • ${activeName} is taking a turn.`;
        }
        return `Round ${session.round} • Waiting for the next action.`;
    };

    return {
        createFightSession,
        advanceTurn,
        getFightSummary,
        calculateDamage,
        getBossPreview: buildPreview
    };
}));
