const dungeonActivity = document.querySelector("#dungeonActivity");
const dungeonAction = document.querySelector("#dungeonAction");
const dungeonTime = document.querySelector("#dungeonTime");
const floorCount = document.querySelector("#floorCount");
const roomCount = document.querySelector("#roomCount");

let dungeon = {
    rating: 500,
    grade: "E",
    progress: {
        floor: 1,
        room: 1,
        floorLimit: 100,
        roomLimit: 5,
    },
    settings: {
        enemyBaseLvl: 1,
        enemyLvlGap: 5,
        enemyBaseStats: 1,
        enemyScaling: 1.1,
    },
    status: {
        exploring: false,
        paused: true,
        event: false,
    },
    statistics: {
        kills: 0,
        runtime: 0,
    },
    backlog: [],
    action: 0,
};

// ===== Dungeon Setup =====
// Enables start and pause on button click
dungeonActivity.addEventListener('click', function () {
    dungeonStartPause();
});

// Sets up the initial dungeon
const initialDungeonLoad = () => {
    if (localStorage.getItem("dungeonData") !== null) {
        dungeon = JSON.parse(localStorage.getItem("dungeonData"));
        dungeon.status = {
            exploring: false,
            paused: true,
            event: false,
        };
        updateDungeonLog();
    }
    loadDungeonProgress();
    dungeonTime.innerHTML = new Date(dungeon.statistics.runtime * 1000).toISOString().slice(11, 19);
    dungeonAction.innerHTML = "Atpūšas...";
    dungeonActivity.innerHTML = "Meklēt uzdevumus";
    dungeonTime.innerHTML = "00:00:00";
    dungeonTimer = setInterval(dungeonEvent, 1000);
    playTimer = setInterval(dungeonCounter, 1000);
}

// Start and Pause Functionality
const dungeonStartPause = () => {
    if (!dungeon.status.paused) {
        sfxPause.play();

        dungeonAction.innerHTML = "Atpūšas...";
        dungeonActivity.innerHTML = "Meklēt uzdevumus";
        dungeon.status.exploring = false;
        dungeon.status.paused = true;
    } else {
        sfxUnpause.play();

        dungeonAction.innerHTML = "Meklē...";
        dungeonActivity.innerHTML = "Pauzēt";
        dungeon.status.exploring = true;
        dungeon.status.paused = false;
    }
}

// Counts the total time for the current run and total playtime
const dungeonCounter = () => {
    player.playtime++;
    dungeon.statistics.runtime++;
    dungeonTime.innerHTML = new Date(dungeon.statistics.runtime * 1000).toISOString().slice(11, 19);
    saveData();
}

// Loads the floor and room count
const loadDungeonProgress = () => {
    if (dungeon.progress.room > dungeon.progress.roomLimit) {
        dungeon.progress.room = 1;
        dungeon.progress.floor++;
    }
    floorCount.innerHTML = `Stāvs ${dungeon.progress.floor}`;
    roomCount.innerHTML = `Istaba ${dungeon.progress.room}`;
}

// ========== Events in the Dungeon ==========
const dungeonEvent = () => {
    if (dungeon.status.exploring && !dungeon.status.event) {
        dungeon.action++;
        let choices;
        let eventRoll;
        let eventTypes = ["blessing", "curse", "treasure", "enemy", "enemy", "nothing", "nothing", "nothing", "nothing", "monarch"];
        if (dungeon.action > 2 && dungeon.action < 6) {
            eventTypes.push("nextroom");
        } else if (dungeon.action > 5) {
            eventTypes = ["nextroom"];
        }
        const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];

        switch (event) {
            case "nextroom":
                dungeon.status.event = true;
                choices = `
                    <div class="decision-panel">
                        <button id="choice1">Ieiet</button>
                        <button id="choice2">Ignorēt</button>
                    </div>`;
                if (dungeon.progress.room == dungeon.progress.roomLimit) {
                    addDungeonLog(`<span class="Mantots">Tu atradi durvis uz Konventa zāli.</span>`, choices);
                } else {
                    addDungeonLog("Tu atradi durvis.", choices);
                }
                document.querySelector("#choice1").onclick = function () {
                    sfxConfirm.play();
                    if (dungeon.progress.room == dungeon.progress.roomLimit) {
                        guardianBattle();
                    } else {
                        eventRoll = randomizeNum(1, 3);
                        if (eventRoll == 1) {
                            incrementRoom();
                            mimicBattle("door");
                            addDungeonLog("Tu nonāci nākamajā stāvā.");
                        } else if (eventRoll == 2) {
                            incrementRoom();
                            choices = `
                                <div class="decision-panel">
                                    <button id="choice1">Atvērt lādi</button>
                                    <button id="choice2">Ignorēt</button>
                                </div>`;
                            addDungeonLog(`Tu iegāji nākamajā istabā un atradi regāliju kambari. Tajā ir <i class="fa fa-toolbox"></i>lāde.`, choices);
                            document.querySelector("#choice1").onclick = function () {
                                chestEvent();
                            }
                            document.querySelector("#choice2").onclick = function () {
                                dungeon.action = 0;
                                ignoreEvent();
                            };
                        } else {
                            dungeon.status.event = false;
                            incrementRoom();
                            addDungeonLog("Tu nonāci nākamajā istabā.");
                        }
                    }
                };
                document.querySelector("#choice2").onclick = function () {
                    dungeon.action = 0;
                    ignoreEvent();
                };
                break;
            case "treasure":
                dungeon.status.event = true;
                choices = `
                    <div class="decision-panel">
                        <button id="choice1">Atvērt lādi</button>
                        <button id="choice2">Ignorēt</button>
                    </div>`;
                addDungeonLog(`Tu atradi regāliju kambari. Tajā ir <i class="fa fa-toolbox"></i>lāde.`, choices);
                document.querySelector("#choice1").onclick = function () {
                    chestEvent();
                }
                document.querySelector("#choice2").onclick = function () {
                    ignoreEvent();
                };
                break;
            case "nothing":
                nothingEvent();
                break;
            case "enemy":
                dungeon.status.event = true;
                choices = `
                    <div class="decision-panel">
                        <button id="choice1">Pildīt uzdevumu</button>
                        <button id="choice2">Bēgt</button>
                    </div>`;
                generateRandomEnemy();
                addDungeonLog(`Tu sastapi ${enemy.name}.`, choices);
                player.inCombat = true;
                document.querySelector("#choice1").onclick = function () {
                    engageBattle();
                }
                document.querySelector("#choice2").onclick = function () {
                    fleeBattle();
                }
                break;
            case "blessing":
                eventRoll = randomizeNum(1, 2);
                if (eventRoll == 1) {
                    dungeon.status.event = true;
                    blessingValidation();
                    let cost = player.blessing * (500 * (player.blessing * 0.5)) + 750;
                    choices = `
                        <div class="decision-panel">
                            <button id="choice1">Ziedot</button>
                            <button id="choice2">Ignorēt</button>
                        </div>`;
                    addDungeonLog(`<span class="Leģendārs">Tu atradi konfuksi, kurš prasa aizdot naudu burgai. Vai vēlies viņam ziedot <i class="fas fa-coins" style="color: #FFD700;"></i><span class="Lietots">${nFormatter(cost)}</span>, lai saņemtu viņa svētību? (Svētības Līmenis.${player.blessing})</span>`, choices);
                    document.querySelector("#choice1").onclick = function () {
                        if (player.gold < cost) {
                            sfxDeny.play();
                            addDungeonLog("Tev nepietiek latu.");
                        } else {
                            player.gold -= cost;
                            sfxConfirm.play();
                            statBlessing();
                        }
                        dungeon.status.event = false;
                    }
                    document.querySelector("#choice2").onclick = function () {
                        ignoreEvent();
                    };
                } else {
                    nothingEvent();
                }
                break;
            case "curse":
                eventRoll = randomizeNum(1, 3);
                if (eventRoll == 1) {
                    dungeon.status.event = true;
                    let curseLvl = Math.round((dungeon.settings.enemyScaling - 1) * 10);
                    let cost = curseLvl * (10000 * (curseLvl * 0.5)) + 5000;
                    choices = `
                            <div class="decision-panel">
                                <button id="choice1">Ziedot</button>
                                <button id="choice2">Ignorēt</button>
                            </div>`;
                    addDungeonLog(`<span class="Mantots">Tu vari uzrīkot Bēgšanu. Vai tērēsi rīkošanai <i class="fas fa-coins" style="color: #FFD700;"></i><span class="Lietots">${nFormatter(cost)}</span> latus? Tas padarīs uzdevumus grūtākus, bet arī uzlabos atrastā ekipējuma kvalitāti (Bēgšanas Līmenis.${curseLvl})</span>`, choices);
                    document.querySelector("#choice1").onclick = function () {
                        if (player.gold < cost) {
                            sfxDeny.play();
                            addDungeonLog("Melnajā kasē nepietiek latu.");
                        } else {
                            player.gold -= cost;
                            sfxConfirm.play();
                            cursedTotem(curseLvl);
                        }
                        dungeon.status.event = false;
                    }
                    document.querySelector("#choice2").onclick = function () {
                        ignoreEvent();
                    };
                } else {
                    nothingEvent();
                }
                break;
            case "monarch":
                eventRoll = randomizeNum(1, 7);
                if (eventRoll == 1) {
                    dungeon.status.event = true;
                    choices = `
                            <div class="decision-panel">
                                <button id="choice1">Ieiet</button>
                                <button id="choice2">Ignorēt</button>
                            </div>`;
                    addDungeonLog(`<span class="Mantots">Tu atradi mistērisku kambari. Šķiet, ka tajā kāds guļ.</span>`, choices);
                    document.querySelector("#choice1").onclick = function () {
                        specialBossBattle();
                    }
                    document.querySelector("#choice2").onclick = function () {
                        ignoreEvent();
                    };
                } else {
                    nothingEvent();
                }
        }
    }
}

// ========= Dungeon Choice Events ==========
// Starts the battle
const engageBattle = () => {
    showCombatInfo();
    startCombat(bgmBattleMain);
    addCombatLog(`Tev priekšā ${enemy.name}.`);
    updateDungeonLog();
}

// Mimic encounter
const mimicBattle = (type) => {
    generateRandomEnemy(type);
    showCombatInfo();
    startCombat(bgmBattleMain);
    addCombatLog(`Tev priekšā ${enemy.name}.`);
    addDungeonLog(`Tev priekšā ${enemy.name}.`);
}

// Guardian boss fight
const guardianBattle = () => {
    incrementRoom();
    generateRandomEnemy("guardian");
    showCombatInfo();
    startCombat(bgmBattleGuardian);
    addCombatLog(`Tev priekšā ir ${enemy.name}.`);
    addDungeonLog("Tu nonāc nākamajā stāvā.");
}

// Guardian boss fight
const specialBossBattle = () => {
    generateRandomEnemy("sboss");
    showCombatInfo();
    startCombat(bgmBattleBoss);
    addCombatLog(`Tev priekšā ir ${enemy.name}.`);
    addDungeonLog(`Tev priekšā ir ${enemy.name}.`);
}

// Flee from the monster
const fleeBattle = () => {
    let eventRoll = randomizeNum(1, 2);
    if (eventRoll == 1) {
        sfxConfirm.play();
        addDungeonLog(`Tev izdodas bēgšana.`);
        player.inCombat = false;
        dungeon.status.event = false;
    } else {
        addDungeonLog(`Bēgšana netiek ieskaitīta!`);
        showCombatInfo();
        startCombat(bgmBattleMain);
        addCombatLog(`Tev priekšā ${enemy.name}.`);
        addCombatLog(`Bēgšana netiek ieskaitīta!`);
    }
}

// Chest event randomizer
const chestEvent = () => {
    sfxConfirm.play();
    let eventRoll = randomizeNum(1, 4);
    if (eventRoll == 1) {
        mimicBattle("chest");
    } else if (eventRoll == 2) {
        if (dungeon.progress.floor == 1) {
            goldDrop();
        } else {
            createEquipmentPrint("dungeon");
        }
        dungeon.status.event = false;
    } else if (eventRoll == 3) {
        goldDrop();
        dungeon.status.event = false;
    } else {
        addDungeonLog("Lāde ir tukša.");
        dungeon.status.event = false;
    }
}

// Calculates Gold Drop
const goldDrop = () => {
    sfxSell.play();
    let goldValue = randomizeNum(50, 500) * dungeon.progress.floor;
    addDungeonLog(`Tu atradi <i class="fas fa-coins" style="color: #FFD700;"></i>${nFormatter(goldValue)}.`);
    player.gold += goldValue;
    playerLoadStats();
}

// Non choices dungeon event messages
const nothingEvent = () => {
    let eventRoll = randomizeNum(1, 5);
    if (eventRoll == 1) {
        addDungeonLog("Tu meklēji, bet neko neatradi.");
    } else if (eventRoll == 2) {
        addDungeonLog("Tu uzgāji tukšu lādi.");
    } else if (eventRoll == 3) {
        addDungeonLog("Tu uzgāji guļošu krustdēlu.");
    } else if (eventRoll == 4) {
        addDungeonLog("Tu atradi krāsnesi.");
    } else if (eventRoll == 5) {
        addDungeonLog("Šajā lokācijā viss jau ir sakopts.");
    }
}

// Random stat buff
const statBlessing = () => {
    sfxBuff.play();
    let stats = ["hp", "atk", "def", "atkSpd", "vamp", "critRate", "critDmg"];
    let buff = stats[Math.floor(Math.random() * stats.length)];
    let value;
    switch (buff) {
        case "hp":
            value = 10;
            player.bonusStats.hp += value;
            break;
        case "atk":
            value = 8;
            player.bonusStats.atk += value;
            break;
        case "def":
            value = 8;
            player.bonusStats.def += value;
            break;
        case "atkSpd":
            value = 3;
            player.bonusStats.atkSpd += value;
            break;
        case "vamp":
            value = 0.5;
            player.bonusStats.vamp += value;
            break;
        case "critRate":
            value = 1;
            player.bonusStats.critRate += value;
            break;
        case "critDmg":
            value = 6;
            player.bonusStats.critDmg += value;
            break;
    }
    addDungeonLog(`Tu ieguvi ${value}% bonusu ${buff.replace(/([A-Z])/g, ".$1").replace(/crit/g, "c").toUpperCase()} no svētības. (Svētības Līmenis.${player.blessing} > Svētības Līmenis.${player.blessing + 1})`);
    blessingUp();
    playerLoadStats();
    saveData();
}

// Cursed totem offering
const cursedTotem = (curseLvl) => {
    sfxBuff.play();
    dungeon.settings.enemyScaling += 0.1;
    addDungeonLog(`Uzdevumi tavā dzīvē ir kļuvuši grūtaki, taču materiālie labumi tevi sagaida uz katra soļa. (Bēgšanas Līmenis.${curseLvl} > Bēgšanas Līmenis.${curseLvl + 1})`);
    saveData();
}

// Ignore event and proceed exploring
const ignoreEvent = () => {
    sfxConfirm.play();
    dungeon.status.event = false;
    addDungeonLog("Tu to ignorē un dodies tālāk.");
}

// Increase room or floor accordingly
const incrementRoom = () => {
    dungeon.progress.room++;
    dungeon.action = 0;
    loadDungeonProgress();
}

// Increases player total blessing
const blessingUp = () => {
    blessingValidation();
    player.blessing++;
}

// Validates whether blessing exists or not
const blessingValidation = () => {
    if (player.blessing == undefined) {
        player.blessing = 1;
    }
}

// ========= Dungeon Backlog ==========
// Displays every dungeon activity
const updateDungeonLog = (choices) => {
    let dungeonLog = document.querySelector("#dungeonLog");
    dungeonLog.innerHTML = "";

    // Display the recent 50 dungeon logs
    for (let message of dungeon.backlog.slice(-50)) {
        let logElement = document.createElement("p");
        logElement.innerHTML = message;
        dungeonLog.appendChild(logElement);
    }

    // If the event has choices, display it
    if (typeof choices !== 'undefined') {
        let eventChoices = document.createElement("div");
        eventChoices.innerHTML = choices;
        dungeonLog.appendChild(eventChoices);
    }

    dungeonLog.scrollTop = dungeonLog.scrollHeight;
}

// Add a log to the dungeon backlog
const addDungeonLog = (message, choices) => {
    dungeon.backlog.push(message);
    updateDungeonLog(choices);
}

// Evaluate a dungeon difficulty
const evaluateDungeon = () => {
    let base = 500;
    // Work in Progress
}