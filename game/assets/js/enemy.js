// Enemy
let enemy = {
    name: null,
    type: null,
    lvl: null,
    stats: {
        hp: null,
        hpMax: null,
        atk: 0,
        def: 0,
        atkSpd: 0,
        vamp: 0,
        critRate: 0,
        critDmg: 0
    },
    image: {
        name: null,
        type: null,
        size: null
    },
    rewards: {
        exp: null,
        gold: null,
        drop: null
    }
};

const generateRandomEnemy = (condition) => {
    // List of possible enemy names
    const enemyNames = [
        // Goblin
        'Kantu stunda', 'Pauku stunda', 'Deju nodarbība', 'Melnais komeršs',
        // Wolf
        'Netīra glāze', 'Knēpgalda gatavošana', 'Trīs līķi',
        // Slime
        '5-minūšu referāts', 'Kanta vadīšana', 'Krāsu apgūšana', 'Burgas kārtošana',
        // Orc
        'Bēgšanas organizēšana', 'Valpurģa nakts', 'Pauku turnīrs', 'Krāsu referāts',
        // Spider
        'C!Q! sakopšana', 'C!Q! talka', 'Alus vakars',
        // Skeleton
        'Literārais vakars', 'Viesu vakars', 'Dibināšanas komeršs', 'Krāsu atsegšanas komeršs', '18.novembra gājiens', 'Aristoteļa svētki', 'Muciņas nodošana',
        // Bosses
        'B!T!K!', 'Krāsu eksāmens', 'Bēgšana', 'Nodziedāšana', 'Gaudeamus Igitur', 'Filistru apzvanīšana', 'Vecais bargais Pīkols', 'Korporāciju teātra festivāls', 'Iepaukošana', 'Sausā ruka', 'Goda tiesa', 'Konventa tiesa', 'Kūriš', 'Nakts C!Q! dīvānā', 'Kaut kas smako C!Q! virtuvē',
        // Monarch
        'Korporācijas Velobrauciens', 'Tukša Burga', 'Burgas parāds', 'Animēts Filistrs', 'Polonēze Kalpaka ballē', 'C!Q! sakopšana pēc komerša', 'Alus menzūra', 'AntiBurshius', 'Deja ar meiteni'
    ];
    const enemyTypes = ['Offensive', 'Defensive', 'Balanced', 'Quick', 'Lethal'];
    let selectedEnemies = null;

    // Generate enemy type
    enemy.type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

    // Calculate enemy level
    const maxLvl = dungeon.progress.floor * dungeon.settings.enemyLvlGap + (dungeon.settings.enemyBaseLvl - 1);
    const minLvl = maxLvl - (dungeon.settings.enemyLvlGap - 1);
    if (condition == "guardian") {
        enemy.lvl = minLvl;
    } else if (condition == "sboss") {
        enemy.lvl = maxLvl;
    } else {
        enemy.lvl = randomizeNum(minLvl, maxLvl);
    }

    // Generate proper enemy info
    switch (enemy.type) {
        case "Offensive":
            // Select name and apply stats for Offensive enemies
            if (condition == "guardian") {
                selectedEnemies = enemyNames.filter(name => [
                    'B!T!K!', 'Krāsu eksāmens', 'Bēgšana', 'Filistru apzvanīšana'
                ].includes(name));
            } else if (condition == "sboss") {
                selectedEnemies = enemyNames.filter(name => [
                    'Polonēze Kalpaka ballē', 'Deja ar meiteni'
                ].includes(name));
            } else {
                selectedEnemies = enemyNames.filter(name => [
                    'Deju nodarbība', 'Melnais komeršs',
                    'Netīra glāze', 'Knēpgalda gatavošana', 'Trīs līķi',
                    'Krāsu apgūšana',
                    'Bēgšanas organizēšana', 'Valpurģa nakts', 'Pauku turnīrs', 'Krāsu referāts',
                    'C!Q! talka',
                    'Literārais vakars', 'Viesu vakars', 'Krāsu atsegšanas komeršs', '18.novembra gājiens', 'Aristoteļa svētki',
                ].includes(name));
            }
            enemy.name = selectedEnemies[Math.floor(Math.random() * selectedEnemies.length)];
            setEnemyStats(enemy.type, condition);
            break;
        case "Defensive":
            // Select name and apply stats for Defensive enemies
            if (condition == "guardian") {
                selectedEnemies = enemyNames.filter(name => [
                    'Vecais bargais Pīkols', 'Korporāciju teātra festivāls', 'Iepaukošana'
                ].includes(name));
            } else if (condition == "sboss") {
                selectedEnemies = enemyNames.filter(name => [
                    'Tukša Burga',
                ].includes(name));
            } else {
                selectedEnemies = enemyNames.filter(name => [
                    'Kanta vadīšana', 'Krāsu apgūšana', 'Burgas kārtošana',
                    'Alus vakars',
                    'Dibināšanas komeršs', 'Muciņas nodošana'
                ].includes(name));
            }
            enemy.name = selectedEnemies[Math.floor(Math.random() * selectedEnemies.length)];
            setEnemyStats(enemy.type, condition);
            break;
        case "Balanced":
            // Select name and apply stats for Balanced enemies
            if (condition == "guardian") {
                selectedEnemies = enemyNames.filter(name => [
                    'Sausā ruka', 'Konventa tiesa', 'Goda tiesa'
                ].includes(name));
            } else if (condition == "sboss") {
                selectedEnemies = enemyNames.filter(name => [
                    'Burgas parāds', 'Animēts Filistrs', 'Alus menzūra'
                ].includes(name));
            } else {
                selectedEnemies = enemyNames.filter(name => [
                    'Kantu stunda',
                    '5-minūšu referāts', 'Kanta vadīšana', 'Krāsu apgūšana',
                    'Bēgšanas organizēšana', 'Valpurģa nakts', 'Pauku turnīrs', 'Krāsu referāts',
                    'C!Q! sakopšana',
                    'Dibināšanas komeršs', 'Muciņas nodošana'
                ].includes(name));
            }
            enemy.name = selectedEnemies[Math.floor(Math.random() * selectedEnemies.length)];
            setEnemyStats(enemy.type, condition);
            break;
        case "Quick":
            // Select name and apply stats for Quick enemies
            if (condition == "guardian") {
                selectedEnemies = enemyNames.filter(name => [
                    'Kūriš', 'Nakts C!Q! dīvānā'
                ].includes(name));
            } else if (condition == "sboss") {
                selectedEnemies = enemyNames.filter(name => [
                    'AntiBurshius', 'Korporācijas Velobrauciens'
                ].includes(name));
            } else {
                selectedEnemies = enemyNames.filter(name => [
                    'Kantu stunda', 'Pauku stunda', 'Melnais komeršs',
                    'Netīra glāze', 'Knēpgalda gatavošana', 'Trīs līķi',
                    'Bēgšanas organizēšana',
                    'C!Q! sakopšana', 'C!Q! talka', 'Alus vakars',
                    'Viesu vakars', '18.novembra gājiens', 'Aristoteļa svētki'
                ].includes(name));
            }
            enemy.name = selectedEnemies[Math.floor(Math.random() * selectedEnemies.length)];
            setEnemyStats(enemy.type, condition);
            break;
        case "Lethal":
            // Select name and apply stats for Lethal enemies
            if (condition == "guardian") {
                selectedEnemies = enemyNames.filter(name => [
                    'Kaut kas smako C!Q! virtuvē', 'Nodziedāšana', 'Gaudeamus Igitur'
                ].includes(name));
            } else if (condition == "sboss") {
                selectedEnemies = enemyNames.filter(name => [
                    'C!Q! sakopšana pēc komerša'
                ].includes(name));
            } else {
                selectedEnemies = enemyNames.filter(name => [
                    'Pauku stunda',
                    'Netīra glāze', 'Knēpgalda gatavošana', 'Trīs līķi',
                    'Bēgšanas organizēšana', 'Valpurģa nakts',
                    'C!Q! talka',
                    'Viesu vakars', 'Aristoteļa svētki'
                ].includes(name));
            }
            enemy.name = selectedEnemies[Math.floor(Math.random() * selectedEnemies.length)];
            setEnemyStats(enemy.type, condition);
            break;
    }
    if (condition == "chest") {
        enemy.name = "Viltus lāde";
    } else if (condition == "door") {
        enemy.name = "Viltus durvis";
    }
    setEnemyImg();
}

// Set a randomly generated stat for the enemy
const setEnemyStats = (type, condition) => {
    if (type == "Offensive") {
        enemy.stats = {
            hp: 0,
            hpMax: randomizeNum(300, 370),
            atk: randomizeNum(70, 100),
            def: randomizeNum(20, 50),
            atkSpd: randomizeDecimal(0.2, 0.4),
            vamp: 0,
            critRate: randomizeDecimal(1, 4),
            critDmg: randomizeDecimal(6.5, 7.5)
        };
    } else if (type == "Defensive") {
        enemy.stats = {
            hp: 0,
            hpMax: randomizeNum(400, 500),
            atk: randomizeNum(40, 70),
            def: randomizeNum(40, 70),
            atkSpd: randomizeDecimal(0.1, 0.3),
            vamp: 0,
            critRate: 0,
            critDmg: 0
        };
    } else if (type == "Balanced") {
        enemy.stats = {
            hp: 0,
            hpMax: randomizeNum(320, 420),
            atk: randomizeNum(50, 80),
            def: randomizeNum(30, 60),
            atkSpd: randomizeDecimal(0.15, 0.35),
            vamp: 0,
            critRate: randomizeDecimal(0.5, 1.5),
            critDmg: randomizeDecimal(1, 3)
        };
    } else if (type == "Quick") {
        enemy.stats = {
            hp: 0,
            hpMax: randomizeNum(300, 370),
            atk: randomizeNum(50, 80),
            def: randomizeNum(30, 60),
            atkSpd: randomizeDecimal(0.35, 0.45),
            vamp: 0,
            critRate: randomizeDecimal(1, 4),
            critDmg: randomizeDecimal(3, 6)
        };
    } else if (type == "Lethal") {
        enemy.stats = {
            hp: 0,
            hpMax: randomizeNum(300, 370),
            atk: randomizeNum(70, 100),
            def: randomizeNum(20, 50),
            atkSpd: randomizeDecimal(0.15, 0.35),
            vamp: 0,
            critRate: randomizeDecimal(4, 8),
            critDmg: randomizeDecimal(6, 9)
        };
    }

    if (dungeon.enemyMultipliers == undefined) {
        dungeon.enemyMultipliers = {
            hp: 1,
            atk: 1,
            def: 1,
            atkSpd: 1,
            vamp: 1,
            critRate: 1,
            critDmg: 1
        }
    }

    // Apply stat scaling for enemies each level
    for (const stat in enemy.stats) {
        if (["hpMax", "atk", "def"].includes(stat)) {
            enemy.stats[stat] += Math.round(enemy.stats[stat] * ((dungeon.settings.enemyScaling - 1) * enemy.lvl));
        } else if (["atkSpd"].includes(stat)) {
            enemy.stats[stat] = 0.4;
            enemy.stats[stat] += enemy.stats[stat] * (((dungeon.settings.enemyScaling - 1) / 4) * enemy.lvl);
        } else if (["critRate"].includes(stat)) {
            enemy.stats[stat] += enemy.stats[stat] * (((dungeon.settings.enemyScaling - 1) / 4) * enemy.lvl);
        } else if (["critDmg"].includes(stat)) {
            enemy.stats[stat] = 50;
            enemy.stats[stat] += enemy.stats[stat] * (((dungeon.settings.enemyScaling - 1) / 4) * enemy.lvl);
        }
    }

    // Stat multiplier for floor guardians
    if (condition == "guardian") {
        enemy.stats.hpMax = enemy.stats.hpMax * 1.5;
        enemy.stats.atk = enemy.stats.atk * 1.3;
        enemy.stats.def = enemy.stats.def * 1.3;
        enemy.stats.critRate = enemy.stats.critRate * 1.1;
        enemy.stats.critDmg = enemy.stats.critDmg * 1.2;
    }

    // Stat multiplier for monarchs
    if (condition == "sboss") {
        enemy.stats.hpMax = enemy.stats.hpMax * 6;
        enemy.stats.atk = enemy.stats.atk * 2;
        enemy.stats.def = enemy.stats.def * 2;
        enemy.stats.critRate = enemy.stats.critRate * 1.1;
        enemy.stats.critDmg = enemy.stats.critDmg * 1.3;
    }

    // Apply stat multipliers for every stat
    let floorMultiplier = (dungeon.progress.floor / 3);
    if (floorMultiplier < 1) {
        floorMultiplier = 1;
    }
    enemy.stats.hpMax = Math.round((enemy.stats.hpMax * floorMultiplier) * dungeon.enemyMultipliers.hp);
    enemy.stats.atk = Math.round(enemy.stats.atk * dungeon.enemyMultipliers.atk);
    enemy.stats.def = Math.round(enemy.stats.def * dungeon.enemyMultipliers.def);
    enemy.stats.atkSpd = enemy.stats.atkSpd * dungeon.enemyMultipliers.atkSpd;
    enemy.stats.vamp = enemy.stats.vamp * dungeon.enemyMultipliers.vamp;
    enemy.stats.critRate = enemy.stats.critRate * dungeon.enemyMultipliers.critRate;
    enemy.stats.critDmg = enemy.stats.critDmg * dungeon.enemyMultipliers.critDmg;

    // Calculate exp and gold that the monster gives
    const expYield = [];

    for (const stat in enemy.stats) {
        let statExp;
        if (["hpMax", "atk", "def"].includes(stat)) {
            statExp = enemy.stats[stat] + enemy.stats[stat] * 0.5;
        } else if (["atkSpd", "critRate", "critDmg"].includes(stat)) {
            statExp = enemy.stats[stat] + enemy.stats[stat] * 2;
        } else if (["vamp", "hp"].includes(stat)) {
            statExp = enemy.stats[stat] + enemy.stats[stat] * 1;
        }
        expYield.push(statExp);
    }

    let expCalculation = (expYield.reduce((acc, cur) => acc + cur, 0)) / 20;
    enemy.rewards.exp = Math.round(expCalculation + expCalculation * (enemy.lvl * 0.1));
    if (enemy.rewards.exp > 1000000) {
        enemy.rewards.exp = 1000000 * randomizeDecimal(0.9, 1.1);
    }
    enemy.rewards.gold = Math.round((enemy.rewards.exp * randomizeDecimal(0.9, 1.1)) * 1.5);
    enemy.rewards.drop = randomizeNum(1, 3);
    if (enemy.rewards.drop == 1) {
        enemy.rewards.drop = true;
    } else {
        enemy.rewards.drop = false;
    }

    enemy.stats.hp = enemy.stats.hpMax;
    enemy.stats.hpPercent = 100;

    // Caps attack speed to 2.5
    if (enemy.stats.atkSpd > 2.5) {
        enemy.stats.atkSpd = 2.5;
    }
}

const setEnemyImg = () => {
    // Apply monster image
    enemy.image.type = '.png';
    switch (enemy.name) {
        // Goblins
        case 'Kantu stunda':
            enemy.image.name = 'xgoblin';
            enemy.image.size = '50%';
            break;
        case 'Pauku stunda':
            enemy.image.name = 'xgoblin_rogue';
            enemy.image.size = '50%';
            break;
        case 'Melnais komeršs':
            enemy.image.name = 'xgoblin_archer';
            enemy.image.size = '50%';
            break;
        case 'Deju nodarbība':
            enemy.image.name = 'xgoblin_mage';
            enemy.image.size = '50%';
            break;

        // Wolf
        case 'Netīra glāze':
            enemy.image.name = 'xwolf';
            enemy.image.size = '50%';
            break;
        case 'Knēpgalda gatavošana':
            enemy.image.name = 'xwolf_black';
            enemy.image.size = '50%';
            break;
        case 'Trīs līķi':
            enemy.image.name = 'xwolf_winter';
            enemy.image.size = '50%';
            break;

        // Slime
        case '5-minūšu referāts':
            enemy.image.name = 'xslime';
            enemy.image.size = '50%';
            break;
        case 'Kanta vadīšana':
            enemy.image.name = 'xslime_angel';
            enemy.image.size = '50%';
            break;
        case 'Krāsu apgūšana':
            enemy.image.name = 'xslime_knight';
            enemy.image.size = '50%';
            break;
        case 'Burgas kārtošana':
            enemy.image.name = 'xslime_crusader';
            enemy.image.size = '50%';
            break;

        // Orc
        case 'Bēgšanas organizēšana':
            enemy.image.name = 'xorc_swordsmaster';
            enemy.image.size = '50%';
            break;
        case 'Valpurģa nakts':
            enemy.image.name = 'xorc_axe';
            enemy.image.size = '50%';
            break;
        case 'Pauku turnīrs':
            enemy.image.name = 'xorc_archer';
            enemy.image.size = '50%';
            break;
        case 'Krāsu referāts':
            enemy.image.name = 'xorc_mage';
            enemy.image.size = '50%';
            break;

        // Spider
        case 'C!Q! sakopšana':
            enemy.image.name = 'xspider';
            enemy.image.size = '50%';
            break;
        case 'C!Q! talka':
            enemy.image.name = 'xspider_red';
            enemy.image.size = '50%';
            break;
        case 'Alus vakars':
            enemy.image.name = 'xspider_green';
            enemy.image.size = '50%';
            break;

        // Skeleton
        case 'Literārais vakars':
            enemy.image.name = 'xskeleton_archer';
            enemy.image.size = '50%';
            break;
        case 'Viesu vakars':
            enemy.image.name = 'xskeleton_swordsmaster';
            enemy.image.size = '50%';
            break;
        case 'Dibināšanas komeršs':
            enemy.image.name = 'xskeleton_knight';
            enemy.image.size = '50%';
            break;
        case 'Krāsu atsegšanas komeršs':
            if (randomizeNum(1, 2) == 1) {
                enemy.image.name = 'xskeleton_mage1';
            } else {
                enemy.image.name = 'xskeleton_mage2';
            }
            enemy.image.size = '50%';
            break;
        case '18.novembra gājiens':
            enemy.image.name = 'xskeleton_pirate';
            enemy.image.size = '50%';
            break;
        case 'Aristoteļa svētki':
            enemy.image.name = 'xskeleton_samurai';
            enemy.image.size = '50%';
            break;
        case 'Muciņas nodošana':
            enemy.image.name = 'xskeleton_warrior';
            enemy.image.size = '50%';
            break;

        // Mimic
        case 'Viltus lāde':
            enemy.image.name = 'mimic';
            enemy.image.size = '50%';
            break;
        case 'Viltus durvis':
            enemy.image.name = 'mimic_door';
            enemy.image.size = '50%';
            break;

        // Bosses
        case 'B!T!K!':
            enemy.image.name = 'xgoblin_boss';
            enemy.image.size = '70%';
            break;
        case 'Krāsu eksāmens':
            enemy.image.name = 'xskeleton_boss';
            enemy.image.size = '50%';
            break;
        case 'Bēgšana':
            enemy.image.name = 'xspider_fire';
            enemy.image.size = '50%';
            break;
        case 'Nodziedāšana':
            enemy.image.name = 'xcerberus_ptolemaios';
            enemy.image.size = '50%';
            break;
        case 'Gaudeamus Igitur':
            enemy.image.name = 'xhellhound';
            enemy.image.size = '50%';
            break;
        case 'Filistru apzvanīšana':
            enemy.image.name = 'xberthelot';
            enemy.image.size = '50%';
            break;
        case 'Vecais bargais Pīkols':
            enemy.image.name = 'xslime_boss';
            enemy.image.size = '50%';
            break;
        case 'Korporāciju teātra festivāls':
            enemy.image.name = 'xzodiac_cancer';
            enemy.image.size = '50%';
            break;
        case 'Iepaukošana':
            enemy.image.name = 'xalfadriel';
            enemy.image.size = '50%';
            break;
        case 'Sausā ruka':
            enemy.image.name = 'xtiamat';
            enemy.image.size = '50%';
            break;
        case 'Konventa tiesa':
            enemy.image.name = 'xfallen_king';
            enemy.image.size = '50%';
            break;
        case 'Goda tiesa':
            enemy.image.name = 'xzodiac_aries';
            enemy.image.size = '50%';
            break;
        case 'Nakts C!Q! dīvānā':
            enemy.image.name = 'xspider_boss';
            enemy.image.size = '50%';
            break;
        case 'Kūriš':
            enemy.image.name = 'xant_queen';
            enemy.image.size = '50%';
            break;
        case 'Kaut kas smako C!Q! virtuvē':
            enemy.image.name = 'xwolf_boss';
            enemy.image.size = '50%';
            break;

        // Special Boss
        case 'Korporācijas Velobrauciens':
            enemy.image.name = 'xspider_dragon';
            enemy.image.size = '70%';
            break;
        case 'Tukša Burga':
            enemy.image.name = 'xskeleton_dragon';
            enemy.image.size = '70%';
            break;
        case 'Burgas parāds':
            enemy.image.name = 'xfirelord';
            enemy.image.size = '70%';
            break;
        case 'Animēts Filistrs':
            enemy.image.name = 'xicemaiden';
            enemy.image.size = '70%';
            break;
        case 'Polonēze Kalpaka ballē':
            enemy.image.name = 'xbehemoth';
            enemy.image.size = '70%';
            break;
        case 'C!Q! sakopšana pēc komerša':
            enemy.image.name = 'xbm-feral';
            enemy.image.size = '70%';
            break;
        case 'Alus menzūra':
            enemy.image.name = 'xthanatos';
            enemy.image.size = '70%';
            break;
        case 'AntiBurshius':
            enemy.image.name = 'xda-reaper';
            enemy.image.size = '70%';
            break;
        case 'Deja ar meiteni':
            enemy.image.name = 'xzalaras';
            enemy.image.size = '70%';
            break;
    };
}

const enemyLoadStats = () => {
    // Shows proper percentage for respective stats
    let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    if (enemy.stats.hp > enemy.stats.hpMax) {
        enemy.stats.hp = enemy.stats.hpMax;
    }
    enemy.stats.hpPercent = ((enemy.stats.hp / enemy.stats.hpMax) * 100).toFixed(2).replace(rx, "$1");

    const enemyHpElement = document.querySelector('#enemy-hp-battle');
    const enemyHpDamageElement = document.querySelector('#enemy-hp-dmg');
    enemyHpElement.innerHTML = `&nbsp${nFormatter(enemy.stats.hp)}/${nFormatter(enemy.stats.hpMax)}<br>(${enemy.stats.hpPercent}%)`;
    enemyHpElement.style.width = `${enemy.stats.hpPercent}%`;
    enemyHpDamageElement.style.width = `${enemy.stats.hpPercent}%`;
}