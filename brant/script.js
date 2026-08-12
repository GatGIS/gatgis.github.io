const screens = {
    welcome: document.querySelector('#screen-welcome'),
    setup: document.querySelector('#screen-setup'),
    player: document.querySelector('#screen-player'),
    locations: document.querySelector('#screen-locations'),
    question: document.querySelector('#screen-question'),
    loot: document.querySelector('#screen-loot'),
    qr: document.querySelector('#screen-qr'),
    scan: document.querySelector('#screen-scan'),
    fight: document.querySelector('#screen-fight')
};

const elements = {
    btnStartRaider: document.querySelector('#btn-start-raider'),
    btnStartBoss: document.querySelector('#btn-start-boss'),
    btnBackWelcome: document.querySelector('#btn-back-welcome'),
    setupForm: document.querySelector('#setup-form'),
    playerNameInput: document.querySelector('#player-name'),
    playerRoleInput: document.querySelector('#player-role'),
    playerClassInputs: document.querySelectorAll('input[name="player-class"]'),
    playerClassSelector: document.querySelector('.class-selector'),
    btnClassInfo: document.querySelector('#btn-class-info'),
    classInfoModal: document.querySelector('#class-info-modal'),
    btnClassInfoClose: document.querySelector('#btn-class-info-close'),
    avatarPreview: document.querySelector('#avatar-preview'),
    btnRandomAvatar: document.querySelector('#btn-random-avatar'),
    playerAvatarImg: document.querySelector('#player-avatar-img'),
    playerInventory: document.querySelector('#player-inventory'),
    bossOnlyHint: document.querySelector('#boss-only'),

    summaryName: document.querySelector('#player-summary-name'),
    summaryRole: document.querySelector('#player-summary-role'),
    summaryClass: document.querySelector('#player-summary-class'),
    statHp: document.querySelector('#stat-hp'),
    statAtk: document.querySelector('#stat-atk'),
    statDef: document.querySelector('#stat-def'),
    statSpd: document.querySelector('#stat-spd'),
    statCrit: document.querySelector('#stat-crit'),
    statCdmg: document.querySelector('#stat-cdmg'),
    statRage: document.querySelector('#stat-rage'),
    statThorns: document.querySelector('#stat-thorns'),
    statRegen: document.querySelector('#stat-regen'),
    statHeal: document.querySelector('#stat-heal'),
    profileMessage: document.querySelector('#profile-message'),
    raiderControls: document.querySelector('#raider-controls'),
    bossControls: document.querySelector('#boss-controls'),
    btnResetProfile: document.querySelector('#btn-reset-profile'),
    btnRefreshLocation: document.querySelector('#btn-refresh-location'),
    btnViewQr: document.querySelector('#btn-view-qr'),
    btnGoLocations: document.querySelector('#btn-go-locations'),
    btnGoLocationsBoss: document.querySelector('#btn-go-locations-boss'),
    btnScanQr: document.querySelector('#btn-scan-qr'),
    btnViewScanned: document.querySelector('#btn-view-scanned'),
    btnStartFight: document.querySelector('#btn-start-fight'),

    locationList: document.querySelector('#location-list'),
    locationStatus: document.querySelector('#location-status'),
    locationMap: document.querySelector('#location-map'),
    btnBackPlayer: document.querySelector('#btn-back-player'),
    btnToggleDebug: document.querySelector('#btn-toggle-debug'),
    btnClearStorage: document.querySelector('#btn-clear-storage'),

    questionText: document.querySelector('#question-text'),
    questionOptions: document.querySelector('#question-options'),
    questionFeedback: document.querySelector('#question-feedback'),
    answerResultFx: document.querySelector('#answer-result-fx'),
    answerResultIcon: document.querySelector('#answer-result-icon'),
    answerResultLabel: document.querySelector('#answer-result-label'),
    btnSubmitAnswer: document.querySelector('#btn-submit-answer'),
    btnBackLocations: document.querySelector('#btn-back-locations'),

    lootChoices: document.querySelector('#loot-choices'),
    lootMessage: document.querySelector('#loot-message'),
    btnBackLoot: document.querySelector('#btn-back-loot'),

    qrCard: document.querySelector('#qr-card'),
    qrText: document.querySelector('#qr-text'),
    btnBackPlayer2: document.querySelector('#btn-back-player2'),

    scanStatus: document.querySelector('#scan-status'),
    qrVideo: document.querySelector('#qr-video'),
    qrCanvas: document.querySelector('#qr-canvas'),
    scanInput: document.querySelector('#scan-input'),
    btnParseQr: document.querySelector('#btn-parse-qr'),
    scannedList: document.querySelector('#scanned-list'),
    btnBackPlayer3: document.querySelector('#btn-back-player3'),

    fightSummary: document.querySelector('#fight-summary'),
    fightTurnIndicator: document.querySelector('#fight-turn-indicator'),
    fightArena: document.querySelector('#fight-arena'),
    fightBoss: document.querySelector('#fight-boss'),
    fightParty: document.querySelector('#fight-party'),
    fightAbilityBar: document.querySelector('#fight-ability-bar'),
    fightLog: document.querySelector('#fight-log'),
    btnRunFight: document.querySelector('#btn-run-fight'),
    btnBackPlayer4: document.querySelector('#btn-back-player4')
};

let locations = [];
const FightModule = typeof window !== 'undefined' && window.BrantFight ? window.BrantFight : null;
const defaultLocations = [
    {
        id: 'loc1',
        name: 'Old City Checkpoint',
        lat: 56.9496,
        lng: 24.1052,
        question: 'What is the traditional Latvian drink served at celebrations?',
        answers: ['Kefir', 'Kvass', 'Aldis', 'Birch sap'],
        correct: 1,
        difficulty: 1,
        visited: false
    },
    {
        id: 'loc2',
        name: 'Riverside Marker',
        lat: 56.9509,
        lng: 24.1125,
        question: 'What does the word "Briviba" mean in English?',
        answers: ['Brown', 'Freedom', 'Brew', 'Bridge'],
        correct: 1,
        difficulty: 2,
        visited: false
    },
    {
        id: 'loc3',
        name: 'Market Gate',
        lat: 56.9489,
        lng: 24.1068,
        question: 'How many players should be in the raiding party?',
        answers: ['2', '4', '6', '8'],
        correct: 2,
        difficulty: 1,
        visited: false
    },
    {
        id: 'loc4',
        name: 'Pub Corner',
        lat: 56.9492,
        lng: 24.1085,
        question: 'A good loot roll should increase which stat the most?',
        answers: ['HP', 'ATK', 'DEF', 'SPD'],
        correct: 1,
        difficulty: 3,
        visited: false
    },
    {
        id: 'loc5',
        name: 'Statue Plaza',
        lat: 56.9500,
        lng: 24.1030,
        question: 'What is the boss role at the end of the day?',
        answers: ['Shopkeeper', 'Scanner', 'Boss', 'Raider'],
        correct: 2,
        difficulty: 2,
        visited: false
    }
];

const lootNames = [
    {category: 'Weapon', displayName: 'Weapon', prefix: 'Krusts', prefixes: ['Krusts', 'Asais', 'Dzelzs', 'Niknais']},
    {category: 'Armor', displayName: 'Armor', prefix: 'Vairogs', prefixes: ['Vairogs', 'Smagais', 'Sargs', 'Neatlaidigais']},
    {category: 'Cup', displayName: 'Cup', prefix: 'Kauss', prefixes: ['Kauss', 'Dzirkstoss', 'Pilnais', 'Vecais']},
    {category: 'Helmet', displayName: 'Helmet', prefix: 'Cepure', prefixes: ['Cepure', 'Sarga', 'Biezais', 'Drosmiga']}
];

const STORAGE_KEY = 'brant-save';
const ADMIN_PASSWORD = '123';
const AVATAR_STYLES = ['avataaars', 'adventurer', 'big-ears', 'croodles', 'lorelei', 'pixel-art'];
const AVATAR_API_BASE = 'https://api.dicebear.com/6.x';
const LOOT_CONFIG_FILE = 'loot-config.json';
let lootConfig = [];

const createAvatarSeed = () => Math.random().toString(36).substring(2, 10);
const pickRandomAvatarStyle = () => AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
const getAvatarUrl = (style, seed) => `${AVATAR_API_BASE}/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`;

const loadLocations = async () => {
    try {
        const response = await fetch('locations.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        locations = Array.isArray(data)
            ? data.map(loc => ({ ...loc, visited: Boolean(loc.visited) }))
            : defaultLocations.map(loc => ({ ...loc }));
    } catch (error) {
        console.warn('Unable to load locations.json, using fallback default locations.', error);
        locations = defaultLocations.map(loc => ({ ...loc }));
    }
};

const loadLootConfig = async () => {
    try {
        const response = await fetch(LOOT_CONFIG_FILE);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        lootConfig = Array.isArray(data) ? data : [];
    } catch (error) {
        console.warn('Unable to load loot-config.json, using fallback loot definitions.', error);
        lootConfig = [];
    }
};

const RARITY_TIERS = [
    { name: 'Common', className: 'rarity-common', multiplier: 1.0, min: 1, max: 3 },
    { name: 'Uncommon', className: 'rarity-uncommon', multiplier: 1.1, min: 4, max: 5 },
    { name: 'Rare', className: 'rarity-rare', multiplier: 1.25, min: 6, max: 7 },
    { name: 'Epic', className: 'rarity-epic', multiplier: 1.45, min: 8, max: 9 },
    { name: 'Legendary', className: 'rarity-legendary', multiplier: 1.7, min: 10, max: 99 }
];

const MAX_SINGLE_ITEM_CRIT_RATE = 10;
const MIN_HP_BONUS_PER_ITEM = 10;
const MAX_TOTAL_CRIT_RATE = 65;
const MAX_TOTAL_CRIT_DMG = 300;
const MAX_TOTAL_THORNS = 120;
const MAX_TOTAL_REGEN = 60;
const MAX_TOTAL_SPD = 2.5;
const LOOT_REWARD_MULTIPLIERS = {
    boss: { correct: 1.35, wrong: 0.85 },
    raider: { correct: 1.0, wrong: 0.55 }
};

const getLootRarity = (quality) => {
    return RARITY_TIERS.find(tier => quality >= tier.min && quality <= tier.max) || RARITY_TIERS[0];
};

const getLootIcon = (category) => {
    if (category === 'Weapon') return '🗡️';
    if (category === 'Armor') return '🛡️';
    if (category === 'Cup') return '🍺';
    if (category === 'Helmet') return '🎩';
    if (category === 'Consumable') return '🧪';
    return '✨';
};

const getLootPrefix = (itemType) => {
    const configuredPrefixes = Array.isArray(itemType?.prefixes)
        ? itemType.prefixes.filter(prefix => typeof prefix === 'string' && prefix.trim().length > 0)
        : [];
    if (configuredPrefixes.length > 0) {
        return configuredPrefixes[randomBetween(0, configuredPrefixes.length - 1)].trim();
    }
    if (typeof itemType?.prefix === 'string' && itemType.prefix.trim().length > 0) {
        return itemType.prefix.trim();
    }
    return '';
};

const getLootDisplayName = (itemType, fallbackName = '') => {
    if (typeof itemType?.displayName === 'string' && itemType.displayName.trim().length > 0) {
        return itemType.displayName.trim();
    }
    if (typeof itemType?.category === 'string' && itemType.category.trim().length > 0) {
        return itemType.category.trim();
    }
    return fallbackName;
};

const getLootCategories = () => {
    const availableLoot = lootConfig.length > 0
        ? lootConfig
        : lootNames.map(entry => ({
            category: entry.category,
            displayName: entry.displayName,
            prefix: entry.prefix,
            prefixes: entry.prefixes,
            type: entry.category,
            icon: ''
        }));
    const categories = [...new Set(availableLoot.map(item => item.category))];
    if (state.player?.playerClass === 'healer' && !categories.includes('Consumable')) {
        categories.push('Consumable');
    }
    return categories;
};

const getClassLootWeights = (playerClass) => {
    const weights = {
        Weapon: 1,
        Armor: 1,
        Cup: 1,
        Helmet: 1,
        Consumable: 1
    };
    if (playerClass === 'dps') {
        weights.Weapon = 1.4;
        weights.Cup = 1.2;
        weights.Armor = 0.9;
        weights.Helmet = 0.95;
    } else if (playerClass === 'tank') {
        weights.Armor = 1.4;
        weights.Helmet = 1.2;
        weights.Weapon = 0.9;
        weights.Cup = 1.0;
    } else if (playerClass === 'healer') {
        weights.Cup = 1.4;
        weights.Consumable = 1.3;
        weights.Armor = 0.95;
        weights.Weapon = 0.8;
        weights.Helmet = 0.9;
    }
    return weights;
};

const pickWeightedCategory = (categories, weights) => {
    const pool = categories.map(category => ({ category, weight: weights[category] ?? 1 }));
    const total = pool.reduce((sum, item) => sum + item.weight, 0);
    let rnd = Math.random() * total;
    for (const item of pool) {
        rnd -= item.weight;
        if (rnd <= 0) {
            return item.category;
        }
    }
    return pool[pool.length - 1].category;
};

const pickUniqueCategories = (playerClass, count = 3) => {
    const categories = getLootCategories();
    const weights = getClassLootWeights(playerClass);
    const selected = [];

    while (selected.length < count && categories.length > 0) {
        const category = pickWeightedCategory(categories, weights);
        selected.push(category);
        const index = categories.indexOf(category);
        if (index !== -1) {
            categories.splice(index, 1);
        }
    }
    return selected;
};

const rollRegen = (rarity, highCap = 20) => {
    const chance = Math.random();
    if (chance > 0.97) {
        return Math.max(1, Math.round(randomBetween(12, highCap) * rarity.multiplier));
    }
    if (chance > 0.8) {
        return Math.max(1, Math.round(randomBetween(6, 11) * rarity.multiplier));
    }
    return Math.max(1, Math.round(randomBetween(1, 4) * rarity.multiplier));
};

const state = {
    role: null,
    player: null,
    currentLocation: null,
    debugMode: false,
    scannedPlayers: [],
    lastScannedToken: null,
    fightRunning: false,
    fightLog: [],
    fightSession: null,
    questionDraftAnswers: {},
    videoStream: null,
    avatarSeed: null,
    avatarStyle: null,
    avatarUrl: null
};

let locationMap = null;
let locationMarkerGroup = null;
let userLocationMarker = null;
let answerResultFxTimer = null;

const showAnswerResultAnimation = (correct) => {
    if (!elements.answerResultFx || !elements.answerResultIcon || !elements.answerResultLabel) {
        return;
    }

    if (answerResultFxTimer) {
        clearTimeout(answerResultFxTimer);
    }

    elements.answerResultFx.classList.remove('show', 'success', 'failure');
    elements.answerResultIcon.textContent = correct ? '✓' : '✕';
    elements.answerResultLabel.textContent = correct ? 'Correct' : 'Wrong';
    elements.answerResultFx.classList.add(correct ? 'success' : 'failure');

    void elements.answerResultFx.offsetWidth;
    elements.answerResultFx.classList.add('show');

    answerResultFxTimer = setTimeout(() => {
        elements.answerResultFx.classList.remove('show', 'success', 'failure');
        answerResultFxTimer = null;
    }, 920);
};

const showScreen = (key) => {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[key].classList.add('active');
    if (key === 'locations') {
        setTimeout(() => {
            if (locationMap) {
                locationMap.invalidateSize();
            }
        }, 100);
    }
};

const initializeLocationMap = () => {
    if (!elements.locationMap || locationMap) {
        return;
    }
    locationMap = L.map(elements.locationMap, {
        zoomControl: true,
        attributionControl: false
    }).setView([56.9496, 24.1052], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(locationMap);

    locationMarkerGroup = L.layerGroup().addTo(locationMap);
};

const createUserLocationIcon = () => {
    const avatarUrl = state.player?.avatarUrl || state.avatarUrl || '';
    const avatarHtml = avatarUrl
        ? `<div class="user-location-icon"><img src="${avatarUrl}" alt="Player avatar"></div>`
        : `<div class="user-location-icon user-location-text">You</div>`;
    return L.divIcon({
        className: 'user-location-icon-wrapper',
        html: avatarHtml,
        iconSize: [42, 42],
        iconAnchor: [21, 21]
    });
};

const placeUserLocationMarker = (lat, lng) => {
    if (!locationMap) {
        return;
    }
    if (userLocationMarker) {
        userLocationMarker.setLatLng([lat, lng]);
        userLocationMarker.setIcon(createUserLocationIcon());
        userLocationMarker.setPopupContent(`<strong>Your position</strong><br>${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } else {
        userLocationMarker = L.marker([lat, lng], { icon: createUserLocationIcon() })
            .bindPopup(`<strong>Your position</strong><br>${lat.toFixed(5)}, ${lng.toFixed(5)}`)
            .addTo(locationMap);
    }
};

const updateLocationMap = () => {
    initializeLocationMap();
    if (!locationMap || !locationMarkerGroup) {
        return;
    }

    locationMarkerGroup.clearLayers();
    locations.forEach(location => {
        const status = location.result === 'correct'
            ? 'correct'
            : location.result === 'wrong'
                ? 'wrong'
                : 'unanswered';
        const markerStyle = {
            radius: 10,
            color: status === 'correct' ? '#4caf50' : status === 'wrong' ? '#d32f2f' : '#f5d76e',
            fillColor: status === 'correct' ? '#66bb6a' : status === 'wrong' ? '#ff6f61' : '#f5d76e',
            fillOpacity: 0.7,
            weight: 2
        };
        const marker = L.circleMarker([location.lat, location.lng], markerStyle).addTo(locationMarkerGroup);

        const distanceText = location.distance != null
            ? `<br>Distance: ${Math.round(location.distance)}m`
            : '';
        const resultText = location.visited
            ? location.result === 'correct'
                ? 'Result: Correct'
                : location.result === 'wrong'
                    ? 'Result: Incorrect'
                    : 'Result: Completed'
            : 'Result: Not answered yet';
        marker.bindPopup(`<strong>${location.name}</strong><br>Difficulty: ${location.difficulty}<br>${resultText}${distanceText}`);
        marker.on('click', () => locationMap.setView([location.lat, location.lng], 15));
    });

    if (userLocationMarker) {
        userLocationMarker.addTo(locationMap);
    }
};

const refreshUserLocation = () => {
    initializeLocationMap();
    if (!navigator.geolocation) {
        elements.locationStatus.textContent = 'Geolocation unavailable. Use test mode to continue.';
        buildLocationCards();
        return;
    }
    elements.locationStatus.textContent = 'Checking position...';
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        placeUserLocationMarker(lat, lng);
        if (locationMap) {
            locationMap.setView([lat, lng], 13);
        }

        locations.forEach(location => {
            location.distance = distanceMeters(lat, lng, location.lat, location.lng);
        });
        elements.locationStatus.textContent = 'Location refreshed. Tap a marker or a card to attempt the question.';
        buildLocationCards();
    }, () => {
        elements.locationStatus.textContent = 'Location access denied. Use test mode or allow location access.';
        buildLocationCards();
    }, { enableHighAccuracy: true, timeout: 10000 });
};

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const distanceMeters = (lat1, lng1, lat2, lng2) => {
    const toRad = v => v * Math.PI / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const savePlayer = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        player: state.player,
        scannedPlayers: state.scannedPlayers,
        locationsStatus: locations.map(loc => ({
            id: loc.id,
            visited: Boolean(loc.visited),
            result: loc.result || null
        }))
    }));
};

const loadPlayer = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            state.player = data.player || null;
            const locationsStatus = Array.isArray(data.locationsStatus) ? data.locationsStatus : [];
            locations.forEach(location => {
                const savedLoc = locationsStatus.find(item => item.id === location.id);
                location.visited = Boolean(savedLoc?.visited);
                location.result = savedLoc?.result || null;
            });
            if (state.player) {
                if (state.player.playerClass === 'healer') {
                    state.player.healingOutput = state.player.healingOutput ?? 50;
                } else {
                    state.player.healingOutput = 0;
                }
            }
            state.scannedPlayers = Array.isArray(data.scannedPlayers) ? data.scannedPlayers.map(player => ({
                ...player,
                avatarUrl: player.avatarUrl || (player.avatarSeed && player.avatarStyle ? getAvatarUrl(player.avatarStyle, player.avatarSeed) : null),
                inventory: Array.isArray(player.inventory) ? player.inventory : []
            })) : [];
        } catch (error) {
            console.warn('Failed to parse saved game state.', error);
        }
    }
};

const resetPlayer = () => {
    state.player = null;
    state.avatarSeed = null;
    state.avatarStyle = null;
    state.avatarUrl = null;
    state.scannedPlayers = [];
    state.visitedLocationIds = [];
    state.currentLocation = null;
    state.pendingLoot = null;
    state.questionDraftAnswers = {};
    state.fightLog.length = 0;
    state.debugMode = false;
    localStorage.removeItem(STORAGE_KEY);
};

const askPassword = (message) => {
    const entry = prompt(message);
    return entry === ADMIN_PASSWORD;
};

const clearStorageWithPassword = () => {
    if (!askPassword('Enter developer password to clear saved game data:')) {
        alert('Incorrect password. Developer reset cancelled.');
        return;
    }
    localStorage.removeItem(STORAGE_KEY);
    resetPlayer();
    locations.forEach(location => {
        location.visited = false;
        location.result = null;
    });
    alert('Local storage cleared. The game has been reset.');
    showScreen('welcome');
};

const getSelectedPlayerClass = () => {
    const selected = document.querySelector('input[name="player-class"]:checked');
    return selected ? selected.value : 'dps';
};

const openClassInfoModal = () => {
    if (!elements.classInfoModal) {
        return;
    }
    elements.classInfoModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
};

const closeClassInfoModal = () => {
    if (!elements.classInfoModal) {
        return;
    }
    elements.classInfoModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
};

const createNewPlayer = (name, role, playerClass) => {
    const base = {
        name,
        role,
        playerClass,
        avatarSeed: state.avatarSeed,
        avatarStyle: state.avatarStyle,
        avatarUrl: state.avatarUrl,
        hpMax: role === 'boss' ? 1200 : 700,
        atk: role === 'boss' ? 110 : 90,
        def: role === 'boss' ? 80 : 45,
        spd: role === 'boss' ? 0.95 : 1.0,
        critRate: role === 'boss' ? 5 : 8,
        critDmg: role === 'boss' ? 130 : 140,
        currentHp: role === 'boss' ? 1200 : 700,
        inventory: [],
        level: 1,
        lootQuality: 0,
        healingOutput: 0,
        rage: 0,
        thorns: 0,
        regen: 0
    };
    if (playerClass === 'dps') {
        base.hpMax = 650;
        base.currentHp = 650;
        base.atk = 105;
        base.def = 45;
        base.spd = 1.1;
        base.critRate = 13;
        base.critDmg = 150;
        base.rage = 25;
        base.classDescription = 'Medium HP, high damage and crit, Rage +25';
    } else if (playerClass === 'tank') {
        base.hpMax = 780;
        base.currentHp = 780;
        base.atk = 80;
        base.def = 60;
        base.spd = 0.95;
        base.critRate = 6;
        base.critDmg = 130;
        base.thorns = 25;
        base.classDescription = 'High HP, strong defense, Thorns +25';
    } else if (playerClass === 'healer') {
        base.hpMax = 620;
        base.currentHp = 620;
        base.atk = 75;
        base.def = 45;
        base.spd = 1.0;
        base.critRate = 8;
        base.critDmg = 140;
        base.healingOutput = 50;
        base.classDescription = 'Lower HP, healing focus, Heal +50';
    } else if (playerClass === 'boss') {
        base.classDescription = 'Boss class';
    }
    return base;
};

const renderInventory = () => {
    if (!state.player) {
        return;
    }
    elements.playerInventory.innerHTML = '';
    if (state.player.inventory.length === 0) {
        elements.playerInventory.innerHTML = '<div class="inventory-item"><strong>No loot yet</strong><p>Answer locations to collect item choices.</p></div>';
        return;
    }
    state.player.inventory.forEach(item => {
        const card = document.createElement('div');
        card.className = `inventory-item ${item.rarityClass || getLootRarity(item.quality).className}`;
        const details = item.type === 'healing'
            ? `Heals ${item.heal} HP during boss fight${item.stats.regen ? ` • REGEN ${item.stats.regen}` : ''}`
            : formatStatsLine(item.stats) || 'No stat bonus';
        card.innerHTML = `
            <strong>${item.icon ? item.icon + ' ' : ''}${item.name} (${item.rarityName || getLootRarity(item.quality).name})</strong>
            <p>${details}</p>
            ${item.classBonusLabel ? `<p class="loot-bonus-label">${item.classBonusLabel}</p>` : ''}
        `;
        elements.playerInventory.appendChild(card);
    });
};

const createLoot = (difficulty, forcedCategory = null) => {
    const availableLoot = lootConfig.length > 0
        ? lootConfig
        : lootNames.map(entry => ({
            category: entry.category,
            displayName: entry.displayName,
            prefix: entry.prefix,
            prefixes: entry.prefixes,
            type: entry.category,
            icon: ''
        }));
    const itemPools = availableLoot.filter(entry => {
        return forcedCategory ? entry.category === forcedCategory : true;
    });
    const itemType = itemPools.length > 0
        ? itemPools[randomBetween(0, itemPools.length - 1)]
        : (forcedCategory === 'Consumable'
            ? { category: 'Consumable', displayName: 'Potion', prefix: 'Heal', type: 'Consumable', icon: '🧪' }
            : availableLoot[randomBetween(0, availableLoot.length - 1)]);
    const quality = randomBetween(difficulty + 1, difficulty + 4);
    const rarity = getLootRarity(quality);
    const stats = {
        hp: 0,
        atk: 0,
        def: 0,
        spd: 0,
        critRate: 0,
        critDmg: 0,
        rage: 0,
        thorns: 0
    };
    const categoryKey = itemType.type || itemType.category;
    if (categoryKey === 'Weapon') {
        stats.atk = Math.round(quality * randomBetween(4, 7) * rarity.multiplier);
        stats.critRate = Math.min(
            MAX_SINGLE_ITEM_CRIT_RATE,
            Math.round(randomBetween(1, 2) * quality * 0.45 * rarity.multiplier)
        );
        stats.critDmg = Math.round(randomBetween(1, 2) * quality * rarity.multiplier);
        if (state.player?.playerClass === 'dps' && Math.random() < 0.25) {
            stats.rage = Math.round(quality * randomBetween(2, 4) * rarity.multiplier);
        }
    } else if (categoryKey === 'Armor') {
        stats.def = Math.round(quality * randomBetween(4, 8) * rarity.multiplier);
        stats.hp = Math.round(quality * randomBetween(3, 7) * rarity.multiplier);
        const thornsChance = state.player?.playerClass === 'tank' ? 0.6 : 0;
        if (Math.random() < thornsChance) {
            stats.thorns = Math.round(quality * randomBetween(1, 3) * rarity.multiplier);
            stats.regen = rollRegen(rarity, 20);
        }
    } else if (categoryKey === 'Helmet') {
        stats.def = Math.round(quality * randomBetween(4, 7) * rarity.multiplier);
        stats.hp = Math.round(quality * randomBetween(2, 5) * rarity.multiplier);
        const thornsChance = state.player?.playerClass === 'tank' ? 0.5 : 0;
        if (Math.random() < thornsChance) {
            stats.thorns = Math.round(quality * randomBetween(1, 2) * rarity.multiplier);
            stats.regen = rollRegen(rarity, 20);
        }
    } else if (categoryKey === 'Cup') {
        stats.hp = Math.round(quality * randomBetween(3, 6) * rarity.multiplier);
        stats.atk = Math.round(quality * randomBetween(2, 3) * rarity.multiplier);
    } else if (categoryKey === 'Consumable') {
        const healPower = Math.round(quality * randomBetween(4, 8) * rarity.multiplier);
        const regenValue = rollRegen(rarity, 20);
        const item = {
            name: `Heal Potion (${quality})`,
            category: 'Consumable',
            quality,
            rarityName: rarity.name,
            rarityClass: rarity.className,
            stats: { hp: 0, atk: 0, def: 0, spd: 0, critRate: 0, critDmg: 0, rage: 0, thorns: 0, regen: regenValue },
            icon: getLootIcon('Consumable'),
            type: 'healing',
            heal: healPower
        };
        item.classBonusLabel = `Healer bonus: Heal + Regen ${regenValue}`;
        return item;
    } else {
        stats.spd = Number((quality * randomBetween(1, 2) * 0.05 * rarity.multiplier).toFixed(2));
        stats.critDmg = Math.round(quality * randomBetween(2, 4) * rarity.multiplier);
        stats.critRate = Math.min(
            MAX_SINGLE_ITEM_CRIT_RATE,
            Math.round(randomBetween(1, 2) * quality * 0.45 * rarity.multiplier)
        );
    }
    if (stats.hp > 0) {
        stats.hp = Math.max(MIN_HP_BONUS_PER_ITEM, stats.hp);
    }
    const selectedPrefix = getLootPrefix(itemType);
    const itemDisplayName = getLootDisplayName(itemType, categoryKey || itemType.category || 'Loot');
    const item = {
        name: selectedPrefix ? `${selectedPrefix} ${itemDisplayName}` : `${itemDisplayName}`,
        category: itemType.category,
        quality,
        rarityName: rarity.name,
        rarityClass: rarity.className,
        stats,
        icon: itemType.icon && !itemType.icon.includes('<') ? itemType.icon : getLootIcon(categoryKey),
        type: categoryKey === 'Consumable' ? 'standard' : categoryKey
    };
    if (state.player?.playerClass === 'tank' && item.stats.thorns > 0) {
        item.classBonusLabel = 'Tank bonus: Thorns';
    } else if (state.player?.playerClass === 'dps' && item.stats.rage > 0) {
        item.classBonusLabel = 'DPS bonus: Rage';
    } else if (state.player?.playerClass === 'healer' && item.type === 'healing') {
        item.classBonusLabel = 'Healer bonus: Heal';
    }
    return item;
};

const createLootOptions = (difficulty, multiplier) => {
    const categories = pickUniqueCategories(state.player?.playerClass || 'dps', 3);
    return categories.map(category => scaleLoot(createLoot(difficulty, category), multiplier));
};

const applyLoot = (item) => {
    state.player.inventory.push(item);
    state.player.lootQuality += item.quality;
    if (item.type === 'healing') {
        state.player.healingOutput += item.heal;
        state.player.regen = Math.min(MAX_TOTAL_REGEN, Math.max(0, (state.player.regen || 0) + (item.stats.regen || 0)));
        return;
    }
    state.player.hpMax += item.stats.hp;
    state.player.atk += item.stats.atk;
    state.player.def += item.stats.def;
    state.player.spd = Math.min(MAX_TOTAL_SPD, state.player.spd + item.stats.spd);
    state.player.critRate = Math.min(MAX_TOTAL_CRIT_RATE, state.player.critRate + item.stats.critRate);
    state.player.critDmg = Math.min(MAX_TOTAL_CRIT_DMG, state.player.critDmg + item.stats.critDmg);
    state.player.rage = Math.max(0, (state.player.rage || 0) + (item.stats.rage || 0));
    state.player.thorns = Math.min(MAX_TOTAL_THORNS, Math.max(0, (state.player.thorns || 0) + (item.stats.thorns || 0)));
    state.player.regen = Math.min(MAX_TOTAL_REGEN, Math.max(0, (state.player.regen || 0) + (item.stats.regen || 0)));
    state.player.currentHp = Math.min(state.player.currentHp + Math.round(item.stats.hp * 0.4), state.player.hpMax);
};

const scaleLoot = (item, multiplier) => {
    const scaledQuality = Math.max(1, Math.round(item.quality * multiplier));
    const scaled = {
        ...item,
        quality: scaledQuality,
        rarityName: getLootRarity(scaledQuality).name,
        rarityClass: getLootRarity(scaledQuality).className,
        stats: {
            hp: item.stats.hp > 0
                ? Math.max(MIN_HP_BONUS_PER_ITEM, Math.round(item.stats.hp * multiplier))
                : 0,
            atk: Math.round(item.stats.atk * multiplier),
            def: Math.round(item.stats.def * multiplier),
            spd: Number((item.stats.spd * multiplier).toFixed(2)),
            critRate: Math.min(MAX_SINGLE_ITEM_CRIT_RATE, Math.round(item.stats.critRate * multiplier)),
            critDmg: Math.round(item.stats.critDmg * multiplier),
            rage: Math.round(item.stats.rage * multiplier),
            thorns: Math.round(item.stats.thorns * multiplier),
            regen: Math.round(item.stats.regen * multiplier)
        },
        classBonusLabel: item.classBonusLabel
    };
    if (item.type === 'healing' && scaled.stats.regen > 0) {
        scaled.classBonusLabel = `Healer bonus: Heal + Regen ${scaled.stats.regen}`;
    }
    if (typeof item.heal === 'number') {
        scaled.heal = Math.max(1, Math.round(item.heal * multiplier));
    }
    return scaled;
};

const formatStatsLine = (stats) => {
    const lines = [];
    if (stats.hp) lines.push(`HP +${stats.hp}`);
    if (stats.atk) lines.push(`ATK +${stats.atk}`);
    if (stats.def) lines.push(`DEF +${stats.def}`);
    if (stats.spd) lines.push(`SPD +${stats.spd.toFixed(2)}`);
    if (stats.critRate) lines.push(`CRIT +${stats.critRate}%`);
    if (stats.critDmg) lines.push(`CDMG +${stats.critDmg}%`);
    if (stats.rage) lines.push(`RAGE +${stats.rage}`);
    if (stats.thorns) lines.push(`THORNS +${stats.thorns}`);
    if (stats.regen) lines.push(`REGEN +${stats.regen}`);
    return lines.length > 0 ? lines.join(' • ') : 'No stat bonus';
};

const getStatCapWarning = (label, currentValue, bonusValue, capValue) => {
    if (!Number.isFinite(currentValue) || !Number.isFinite(bonusValue) || !Number.isFinite(capValue) || bonusValue <= 0) {
        return null;
    }
    const appliedValue = Math.min(capValue, currentValue + bonusValue);
    const effectiveGain = Math.max(0, appliedValue - currentValue);
    if (effectiveGain >= bonusValue) {
        return null;
    }
    if (effectiveGain <= 0) {
        return `${label} cap reached (${capValue})`;
    }
    return `${label} limited by cap: +${effectiveGain}/${bonusValue} (cap ${capValue})`;
};

const getLootCapWarnings = (item) => {
    if (!item || !state.player) {
        return [];
    }

    const warnings = [];
    const stats = item.stats || {};
    const capRules = [
        { label: 'SPD', current: Number(state.player.spd || 0), bonus: Number(stats.spd || 0), cap: MAX_TOTAL_SPD },
        { label: 'CRIT', current: Number(state.player.critRate || 0), bonus: Number(stats.critRate || 0), cap: MAX_TOTAL_CRIT_RATE },
        { label: 'CDMG', current: Number(state.player.critDmg || 0), bonus: Number(stats.critDmg || 0), cap: MAX_TOTAL_CRIT_DMG },
        { label: 'THORNS', current: Number(state.player.thorns || 0), bonus: Number(stats.thorns || 0), cap: MAX_TOTAL_THORNS },
        { label: 'REGEN', current: Number(state.player.regen || 0), bonus: Number(stats.regen || 0), cap: MAX_TOTAL_REGEN }
    ];

    capRules.forEach(rule => {
        const warning = getStatCapWarning(rule.label, rule.current, rule.bonus, rule.cap);
        if (warning) {
            warnings.push(warning);
        }
    });

    return warnings;
};

const openLootChoice = (location, correct) => {
    const roleKey = state.role === 'boss' ? 'boss' : 'raider';
    const roleMultipliers = LOOT_REWARD_MULTIPLIERS[roleKey] || LOOT_REWARD_MULTIPLIERS.raider;
    const multiplier = correct ? roleMultipliers.correct : roleMultipliers.wrong;
    const label = correct ? 'Correct answer! Pick a boosted reward.' : 'Incorrect answer. Loot is reduced but still salvageable.';
    state.pendingLoot = {
        locationId: location.id,
        items: createLootOptions(location.difficulty, multiplier)
    };
    elements.lootMessage.textContent = `${label} (x${multiplier.toFixed(1)} reward)`;
    elements.lootChoices.innerHTML = '';
    state.pendingLoot.items.forEach((item, index) => {
        const rarity = getLootRarity(item.quality);
        const card = document.createElement('div');
        card.className = `loot-card ${item.rarityClass || rarity.className}`;
        const healingDetails = item.type === 'healing'
            ? `Heals ${item.heal} HP in boss fight${item.stats.regen ? ` • REGEN ${item.stats.regen}` : ''}`
            : formatStatsLine(item.stats);
        const capWarnings = getLootCapWarnings(item);
        card.innerHTML = `
            <h3>${item.icon ? item.icon + ' ' : ''}${item.name}</h3>
            <p class="loot-rarity">${item.rarityName || rarity.name} • Quality ${item.quality}</p>
            <p>${healingDetails}</p>
            ${capWarnings.length > 0 ? `<p class="loot-cap-warning">${capWarnings.join(' • ')}</p>` : ''}
            ${item.classBonusLabel ? `<p class="loot-bonus-label">${item.classBonusLabel}</p>` : ''}
            <button type="button" data-index="${index}">Choose this loot</button>
        `;
        card.querySelector('button').addEventListener('click', () => {
            applyLoot(item);
            state.pendingLoot = null;
            savePlayer();
            updateProfileUI();
            buildLocationCards();
            elements.lootMessage.textContent = `Loot acquired: ${item.name} (Quality ${item.quality}).`;
            showScreen('locations');
        });
        elements.lootChoices.appendChild(card);
    });
    showScreen('loot');
};

const buildLocationCards = () => {
    elements.locationList.innerHTML = '';
    locations.forEach(location => {
        const withinDistance = location.distance != null && location.distance <= 1000;
        const canAttempt = state.debugMode || withinDistance;
        const resultLabel = location.visited
            ? location.result === 'correct'
                ? 'Correct answer'
                : location.result === 'wrong'
                    ? 'Incorrect answer'
                    : 'Completed'
            : null;
        const distanceText = location.distance != null
            ? withinDistance
                ? `Within 1km (${Math.round(location.distance)}m)`
                : `Too far (${Math.round(location.distance)}m)`
            : 'Distance unknown';
        const statusText = resultLabel || distanceText;
        const buttonLabel = location.visited
            ? location.result === 'correct'
                ? 'Correct'
                : location.result === 'wrong'
                    ? 'Wrong'
                    : 'Completed'
            : canAttempt
                ? 'Attempt location'
                : 'Move closer to attempt';
        const card = document.createElement('div');
        card.className = `location-card${location.visited ? ' completed' : ''}`;
        card.innerHTML = `
            <h3>${location.name}</h3>
            <p class="meta">Difficulty: ${location.difficulty} • ${statusText}</p>
            <button ${location.visited || !canAttempt ? 'disabled' : ''} data-id="${location.id}">${buttonLabel}</button>
        `;
        const button = card.querySelector('button');
        if (button && !location.visited && canAttempt) {
            button.addEventListener('click', () => checkLocation(location.id));
        }
        elements.locationList.appendChild(card);
    });
    updateLocationMap();
};

const checkLocation = (locationId) => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location || location.visited) {
        return;
    }
    if (state.debugMode) {
        openQuestion(location);
        return;
    }
    if (!navigator.geolocation) {
        elements.locationStatus.textContent = 'Geolocation unavailable. Use test mode to continue.';
        return;
    }
    elements.locationStatus.textContent = 'Checking position...';
    navigator.geolocation.getCurrentPosition(position => {
        const meters = distanceMeters(position.coords.latitude, position.coords.longitude, location.lat, location.lng);
        if (meters <= 1000) {
            openQuestion(location);
        } else {
            elements.locationStatus.textContent = `Too far from ${location.name}: ${Math.round(meters)}m away.`;
        }
    }, () => {
        elements.locationStatus.textContent = 'Location access denied. Use test mode or allow location access.';
    }, { enableHighAccuracy: true, timeout: 10000 });
};

const openQuestion = (location) => {
    state.currentLocation = location;
    elements.questionText.textContent = location.question;
    elements.questionOptions.innerHTML = '';
    const savedAnswer = state.questionDraftAnswers?.[location.id];
    location.answers.forEach((answer, index) => {
        const label = document.createElement('label');
        label.className = 'option-item';
        label.innerHTML = `<input type="radio" name="answer" value="${index}"${savedAnswer === index ? ' checked' : ''}><span>${answer}</span>`;
        const input = label.querySelector('input[name="answer"]');
        if (input) {
            input.addEventListener('change', () => {
                state.questionDraftAnswers[location.id] = index;
            });
        }
        elements.questionOptions.appendChild(label);
    });
    elements.questionFeedback.textContent = '';
    showScreen('question');
};

const collectAnswer = () => {
    const selected = elements.questionOptions.querySelector('input[name="answer"]:checked');
    if (!selected) {
        elements.questionFeedback.textContent = 'Choose an answer before submitting.';
        return null;
    }
    return Number(selected.value);
};

const handleAnswerSubmit = () => {
    const selectedIndex = collectAnswer();
    if (selectedIndex === null) {
        return;
    }
    const location = state.currentLocation;
    if (!location) {
        return;
    }
    const correct = selectedIndex === location.correct;
    delete state.questionDraftAnswers[location.id];
    location.visited = true;
    location.result = correct ? 'correct' : 'wrong';
    savePlayer();
    elements.questionFeedback.textContent = correct
        ? 'Correct! Choose your loot from the options available.'
        : 'Incorrect answer. The reward is reduced, but still choose one salvage item.';
    elements.questionFeedback.style.color = correct ? '#c8f7c5' : '#f2a6a6';
    showAnswerResultAnimation(correct);
    buildLocationCards();
    openLootChoice(location, correct);
};

const buildQrPage = async () => {
    if (!state.player || state.player.role !== 'raider') {
        return;
    }
    elements.qrCard.innerHTML = '';
    const token = getPlayerToken();
    if (!token) {
        elements.qrCard.textContent = 'Unable to build QR code.';
        elements.qrText.value = '';
        return;
    }
    elements.qrText.value = token;

    try {
        // Use the official browser global variable directly
        const qrLib = window.QRCode; 
        if (!qrLib || typeof qrLib.toDataURL !== 'function') {
            throw new Error('QR generator library is not loaded on the window object');
        }

        // Programmatic inversion fix: 
        // Ensure "dark" is your QR module color and "light" is the background color
        const dataUrl = await qrLib.toDataURL(token, {
            errorCorrectionLevel: 'M',
            margin: 4, // 4 modules is standard for optimal scanner framing
            width: 256,
            color: {
                dark: '#000000',  // The QR modules MUST be dark
                light: '#ffffff'  // The background MUST be light
            }
        });

        // Generate the visual element onto your page
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = "Raider Profile QR Code";
        img.style.maxWidth = "100%";
        elements.qrCard.appendChild(img);

    } catch (error) {
        console.error('QR generation failed:', error);
        elements.qrCard.textContent = 'Failed to generate QR code visual.';
    }
};

const encodePlayerToken = (value) => {
    return btoa(
        encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (match, p1) =>
            String.fromCharCode(parseInt(p1, 16))
        )
    );
};

const decodePlayerToken = (value) => {
    return decodeURIComponent(
        Array.from(atob(value), (char) =>
            '%' + char.charCodeAt(0).toString(16).padStart(2, '0')
        ).join('')
    );
};

const getPlayerToken = () => {
    if (!state.player) {
        return '';
    }
    const token = {
        n: state.player.name,
        r: state.player.role,
        c: state.player.playerClass,
        H: state.player.hpMax,
        A: state.player.atk,
        D: state.player.def,
        S: state.player.spd,
        C: state.player.critRate,
        Q: state.player.critDmg,
        G: state.player.rage || 0,
        T: state.player.thorns || 0,
        E: state.player.regen || 0,
        L: state.player.healingOutput || 0,
        V: state.player.avatarSeed,
        Y: state.player.avatarStyle
    };
    return JSON.stringify(token);
};

const normalizePlayerPayload = (raw) => {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const payload = {
        name: raw.name || raw.n || '',
        role: raw.role || raw.r || 'raider',
        playerClass: raw.playerClass || raw.c || 'dps',
        hpMax: raw.hpMax || raw.H || 0,
        atk: raw.atk || raw.A || 0,
        def: raw.def || raw.D || 0,
        spd: raw.spd || raw.S || 0,
        critRate: raw.critRate || raw.C || 0,
        critDmg: raw.critDmg || raw.Q || 0,
        rage: raw.rage || raw.G || 0,
        thorns: raw.thorns || raw.T || 0,
        regen: raw.regen || raw.E || 0,
        healingOutput: raw.healingOutput || raw.L || 0,
        lootQuality: raw.lootQuality || raw.P || 0,
        avatarSeed: raw.avatarSeed || raw.V || null,
        avatarStyle: raw.avatarStyle || raw.Y || null,
        inventory: Array.isArray(raw.inventory) ? raw.inventory : []
    };
    return payload;
};

const getPlayerScanSignature = (player) => {
    if (!player) {
        return '';
    }
    const signatureSource = {
        name: player.name || '',
        role: player.role || '',
        playerClass: player.playerClass || '',
        hpMax: Number(player.hpMax) || 0,
        atk: Number(player.atk) || 0,
        def: Number(player.def) || 0,
        spd: Number(player.spd) || 0,
        critRate: Number(player.critRate) || 0,
        critDmg: Number(player.critDmg) || 0,
        rage: Number(player.rage) || 0,
        thorns: Number(player.thorns) || 0,
        regen: Number(player.regen) || 0,
        healingOutput: Number(player.healingOutput) || 0,
        avatarSeed: player.avatarSeed || '',
        avatarStyle: player.avatarStyle || ''
    };
    return JSON.stringify(signatureSource);
};

const parsePlayerToken = (token) => {
    if (!token || typeof token !== 'string') {
        return null;
    }
    const trimmed = token.trim();
    let parsed = null;
    try {
        parsed = JSON.parse(trimmed);
    } catch (_error) {
        try {
            const decoded = decodePlayerToken(trimmed);
            parsed = JSON.parse(decoded);
        } catch (error) {
            console.warn('Unable to parse player token:', error);
            return null;
        }
    }
    return normalizePlayerPayload(parsed);
};

const addScannedPlayer = (payload, rawToken = null) => {
    if (!payload || payload.role !== 'raider') {
        elements.scanStatus.textContent = 'QR does not contain a valid raider profile.';
        return;
    }
    const normalizedToken = typeof rawToken === 'string' ? rawToken.trim() : '';
    const payloadSignature = getPlayerScanSignature(payload);
    if (state.scannedPlayers.some(player => getPlayerScanSignature(player) === payloadSignature)) {
        elements.scanStatus.textContent = `${payload.name} is already scanned.`;
        return;
    }
    if (normalizedToken.length > 0) {
        payload.token = normalizedToken;
    }
    payload.signature = payloadSignature;
    if (payload.avatarSeed && payload.avatarStyle) {
        payload.avatarUrl = getAvatarUrl(payload.avatarStyle, payload.avatarSeed);
    }
    if (!Array.isArray(payload.inventory)) {
        payload.inventory = [];
    }
    payload.critDmg = typeof payload.critDmg === 'number' ? payload.critDmg : 0;
    payload.rage = typeof payload.rage === 'number' ? payload.rage : 0;
    payload.thorns = typeof payload.thorns === 'number' ? payload.thorns : 0;
    payload.regen = typeof payload.regen === 'number' ? payload.regen : 0;
    payload.healingOutput = typeof payload.healingOutput === 'number' ? payload.healingOutput : 0;
    state.scannedPlayers.push(payload);
    renderScannedList();
    savePlayer();
    elements.scanStatus.textContent = `${payload.name} scanned successfully.`;
};

const useHealingItemsInFight = (party, log) => {
    for (const member of party) {
        if (member.playerClass !== 'healer' || member.currentHp <= 0) {
            continue;
        }
        const healingIndex = member.inventory.findIndex(item => item.type === 'healing' && item.heal > 0);
        if (healingIndex === -1) {
            continue;
        }
        const item = member.inventory.splice(healingIndex, 1)[0];
        const target = party.reduce((best, candidate) => {
            if (candidate.currentHp <= 0) return best;
            if (!best || candidate.currentHp / candidate.hpMax < best.currentHp / best.hpMax) {
                return candidate;
            }
            return best;
        }, null);
        if (!target) {
            continue;
        }
        const healed = Math.min(item.heal, target.hpMax - target.currentHp);
        target.currentHp += healed;
        log.push(`${member.name} uses ${item.name} and heals ${target.name} for ${healed} HP.`);
    }
};

const renderScannedList = () => {
    elements.scannedList.innerHTML = '';
    if (state.scannedPlayers.length === 0) {
        elements.scannedList.innerHTML = '<div class="player-card"><p>No raiders scanned yet.</p></div>';
        return;
    }
    state.scannedPlayers.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';
        const avatarUrl = player.avatarUrl || (player.avatarSeed && player.avatarStyle ? getAvatarUrl(player.avatarStyle, player.avatarSeed) : '');
        card.innerHTML = `
            <div class="player-card-row">
                <div class="player-avatar-scan">
                    <img src="${avatarUrl}" alt="${player.name} avatar">
                </div>
                <div class="player-card-body">
                    <h3>${player.name}</h3>
                    <p class="meta">HP ${player.hpMax} • ATK ${player.atk} • DEF ${player.def}</p>
                    <p class="meta">SPD ${player.spd.toFixed(2)} • CRIT ${player.critRate}% • CDMG ${player.critDmg}%</p>
                    <p class="meta">Rage ${player.rage} • Thorns ${player.thorns} • Regen ${player.regen}</p>
                    <p class="meta">Heal ${player.healingOutput}</p>
                </div>
            </div>
        `;
        elements.scannedList.appendChild(card);
    });
};

const stopVideo = () => {
    if (state.videoStream) {
        state.videoStream.getTracks().forEach(track => track.stop());
        state.videoStream = null;
    }
    if (elements.qrVideo) {
        elements.qrVideo.pause();
        elements.qrVideo.srcObject = null;
        elements.qrVideo.classList.add('hidden');
    }
};

const startQrScanner = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        elements.scanStatus.textContent = 'Camera not supported. Use manual paste.';
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: 'environment' }
            }
        });
        state.videoStream = stream;
        elements.qrVideo.srcObject = stream;
        elements.qrVideo.classList.remove('hidden');
        elements.scanStatus.textContent = 'Point camera at the raider QR code.';
        await elements.qrVideo.play().catch(() => {});
        requestAnimationFrame(scanTick);
    } catch (error) {
        elements.scanStatus.textContent = 'Unable to access camera. Use manual paste instead.';
    }
};

const scanTick = () => {
    if (!elements.qrVideo || !elements.qrVideo.videoWidth || !state.videoStream) {
        requestAnimationFrame(scanTick);
        return;
    }
    const canvas = elements.qrCanvas;
    const context = canvas.getContext('2d');
    canvas.width = elements.qrVideo.videoWidth;
    canvas.height = elements.qrVideo.videoHeight;
    
    // Draw the current camera frame to the canvas
    context.drawImage(elements.qrVideo, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code && code.data) {
        // 1. Draw a bounding box around the successful QR code for immediate visual feedback
        const drawLine = (begin, end, color) => {
            context.beginPath();
            context.moveTo(begin.x, begin.y);
            context.lineTo(end.x, end.y);
            context.lineWidth = 4;
            context.strokeStyle = color;
            context.stroke();
        };
        drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#4ade80");
        drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#4ade80");
        drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#4ade80");
        drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#4ade80");

        const payload = parsePlayerToken(code.data);
        if (payload) {
            const currentToken = code.data.trim();
            if (state.lastScannedToken === currentToken) {
                window.setTimeout(() => requestAnimationFrame(scanTick), 250);
                return;
            }
            state.lastScannedToken = currentToken;

            // Check if this specific player profile has already been added to the game state
            const payloadSignature = getPlayerScanSignature(payload);
            const isDuplicate = state.scannedPlayers && state.scannedPlayers.some(p => getPlayerScanSignature(p) === payloadSignature);
            
            if (isDuplicate) {
                // Update text to notify that they are already in the party
                elements.scanStatus.textContent = `⚠️ ${payload.n || 'Player'} has ALREADY been scanned into the party!`;
                elements.scanStatus.style.color = "#fbbf24"; // Warning Orange/Yellow
            } else {
                // Not a duplicate - register the player safely
                addScannedPlayer(payload, code.data);
                
                // Force-update the visual roster array right away so it renders below the camera
                if (typeof renderScannedList === 'function') {
                    renderScannedList();
                }
                
                elements.scanStatus.textContent = `✅ Successfully added ${payload.n || 'Player'} to the Raid Party!`;
                elements.scanStatus.style.color = "#4ade80"; // Success Green
            }
        } else {
            elements.scanStatus.textContent = '❌ QR code read but data format is invalid.';
            elements.scanStatus.style.color = "#ef4444"; // Error Red
        }

        // Keep the camera loop alive so the next raider can be scanned immediately.
        window.setTimeout(() => requestAnimationFrame(scanTick), 250);
        return;
    }
    
    // Continue loop cycle execution if nothing is captured
    if (state.videoStream) {
        window.setTimeout(() => requestAnimationFrame(scanTick), 250);
    }
};

const createBossProfile = () => {
    const party = state.scannedPlayers;
    const fallbackBoss = {
        name: `${state.player.name} (Boss)`,
        hpMax: 1200,
        atk: 120,
        def: 80,
        spd: 1,
        critRate: 8,
        critDmg: 150,
        currentHp: 0,
        avatarUrl: state.player?.avatarUrl || state.avatarUrl || null,
        avatarSeed: state.player?.avatarSeed || state.avatarSeed || null,
        avatarStyle: state.player?.avatarStyle || state.avatarStyle || null
    };

    const boss = FightModule && typeof FightModule.createBossProfileFromParty === 'function'
        ? FightModule.createBossProfileFromParty(party, fallbackBoss, state.player)
        : {
            ...fallbackBoss,
            currentHp: fallbackBoss.hpMax
        };

    boss.name = `${state.player.name} (Boss)`;
    boss.avatarUrl = state.player?.avatarUrl || state.avatarUrl || null;
    boss.avatarSeed = state.player?.avatarSeed || state.avatarSeed || null;
    boss.avatarStyle = state.player?.avatarStyle || state.avatarStyle || null;
    boss.currentHp = boss.hpMax;
    return boss;
};

const calculateDamage = (attacker, defender) => {
    const base = attacker.atk * (attacker.atk / (attacker.atk + defender.def * 1.25)) * 0.72;
    const variation = 0.9 + Math.random() * 0.2;
    let damage = Math.round(base * variation);
    if (attacker.rage) {
        damage = Math.round(damage * (1 + attacker.rage / 100));
    }
    if (Math.random() * 100 < attacker.critRate) {
        damage = Math.round(damage * (1 + attacker.critDmg / 100));
    }
    return Math.max(1, damage);
};

const applyFightAnimation = (session, targetName, amount) => {
    if (!session || !targetName || !amount) {
        return;
    }
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate([30, 15, 30]);
    }
};

const getFightUnitAvatar = (unit) => {
    if (unit?.avatarUrl) {
        return unit.avatarUrl;
    }
    if (unit?.avatarSeed && unit?.avatarStyle) {
        return getAvatarUrl(unit.avatarStyle, unit.avatarSeed);
    }
    return '';
};

const getBossPreview = (session) => {
    if (!session) {
        return null;
    }
    if (FightModule && typeof FightModule.getBossPreview === 'function') {
        return FightModule.getBossPreview(session);
    }
    const aliveRaiders = session.party.filter(member => member.currentHp > 0);
    if (aliveRaiders.length === 0) {
        return null;
    }
    const preferredAbility = session.bossSelectedAbility || 'basic';
    const abilityToUse = preferredAbility === 'targeted' && session.bossAbilityCooldown <= 0
        ? 'targeted'
        : preferredAbility === 'aoe' && session.bossAoeCooldown <= 0
            ? 'aoe'
            : preferredAbility === 'vamp' && session.bossVampCooldown <= 0
                ? 'vamp'
                : session.bossAbilityCooldown <= 0
                    ? 'targeted'
                    : session.bossAoeCooldown <= 0
                        ? 'aoe'
                        : session.bossVampCooldown <= 0
                            ? 'vamp'
                            : 'basic';

    const target = abilityToUse === 'targeted'
        ? (() => {
            const cursor = Number.isInteger(session.bossTargetCursor) ? session.bossTargetCursor : 0;
            const partyLength = Math.max(1, Array.isArray(session.party) ? session.party.length : 0);
            const startIndex = cursor % partyLength;
            let selected = null;
            for (let offset = 0; offset < partyLength; offset += 1) {
                const candidateIndex = (startIndex + offset) % partyLength;
                const candidate = session.party[candidateIndex];
                if (candidate && candidate.currentHp > 0) {
                    selected = candidate;
                    session.bossTargetCursor = (candidateIndex + 1) % partyLength;
                    session.bossAbilityTargetName = selected.name;
                    break;
                }
            }
            return selected || aliveRaiders[0] || null;
        })()
        : (() => {
            const tanks = aliveRaiders.filter(member => member.playerClass === 'tank');
            return tanks.length > 0 && Math.random() < 0.75
                ? tanks.reduce((lowest, candidate) => {
                    if (!lowest) {
                        return candidate;
                    }
                    return candidate.currentHp < lowest.currentHp ? candidate : lowest;
                }, null)
                : aliveRaiders.reduce((lowest, candidate) => {
                    if (!lowest) {
                        return candidate;
                    }
                    return candidate.currentHp < lowest.currentHp ? candidate : lowest;
                }, null);
        })();

    if (!target) {
        return null;
    }

    const baseDamage = Math.max(1, Math.round(session.boss.atk * (session.boss.atk / (session.boss.atk + target.def * 1.25)) * 0.72));
    const minDamage = Math.max(1, Math.round(baseDamage * 0.9));
    const maxDamage = Math.max(1, Math.round(baseDamage * 1.1));
    const partySize = Math.max(1, aliveRaiders.length);

    if (abilityToUse === 'targeted') {
        const targetedBounds = {
            min: Math.max(1, Math.round(minDamage * 1.2)),
            max: Math.max(1, Math.round(maxDamage * 1.2))
        };
        return {
            type: 'targeted',
            target: target.name,
            amount: Math.round((targetedBounds.min + targetedBounds.max) / 2),
            amountRange: targetedBounds,
            abilityName: 'Targeted Attack'
        };
    }
    if (abilityToUse === 'aoe') {
        const aoeBounds = {
            min: Math.max(1, Math.round(minDamage / partySize)),
            max: Math.max(1, Math.round(maxDamage / partySize))
        };
        return {
            type: 'aoe',
            target: 'All Raiders',
            amount: Math.round((aoeBounds.min + aoeBounds.max) / 2),
            amountRange: aoeBounds,
            abilityName: 'AoE Attack'
        };
    }
    if (abilityToUse === 'vamp') {
        const vampBounds = {
            min: Math.max(1, Math.round(minDamage * 0.85)),
            max: Math.max(1, Math.round(maxDamage * 0.85))
        };
        return {
            type: 'vamp',
            target: target.name,
            amount: Math.round((vampBounds.min + vampBounds.max) / 2),
            amountRange: vampBounds,
            abilityName: 'Vamp Attack'
        };
    }
    return {
        type: 'basic',
        target: target.name,
        amount: Math.round((minDamage + maxDamage) / 2),
        amountRange: { min: minDamage, max: maxDamage },
        abilityName: 'Basic Attack'
    };
};

const renderFightView = () => {
    const session = state.fightSession;
    if (!session) {
        elements.fightSummary.textContent = 'No fight started yet.';
        elements.fightTurnIndicator.textContent = 'Start the encounter to begin the first turn.';
        elements.fightBoss.innerHTML = '<div class="fight-boss-card"><p>Boss will appear here once the fight begins.</p></div>';
        elements.fightParty.innerHTML = '';
        elements.fightAbilityBar.innerHTML = '';
        elements.fightLog.innerHTML = '<div class="fight-log-entry">The battlefield is waiting for the first turn.</div>';
        elements.btnRunFight.textContent = 'Start Fight';
        return;
    }

    elements.fightSummary.textContent = FightModule ? FightModule.getFightSummary(session) : 'Fight ready.';
    const activeName = session.currentActor?.name || 'Waiting';
    elements.fightTurnIndicator.textContent = session.status === 'ready'
        ? `Turn ${session.turnNumber || 0} • ${activeName} is ready`
        : `Fight ended • ${session.winner === 'party' ? 'Party wins' : session.winner === 'boss' ? 'Boss wins' : 'Draw'}`;

    document.body.classList.toggle('fight-boss-phase', session.status === 'ready' && session.phase === 'boss');

    const bossHpPercent = (session.boss.currentHp / session.boss.hpMax) * 100;
    const bossAvatarUrl = getFightUnitAvatar(session.boss);
    const bossDamageFlash = session.lastAction?.target === session.boss.name ? 'damage-flash' : '';
    const bossHighlight = session.highlightUntil > Date.now() && session.lastAction?.actor === session.boss.name ? 'fight-card-pulse fight-vibrate' : '';
    const previewTurn = (session.turnNumber || 0) + 1;
    const preferredAbility = session.bossSelectedAbility || 'basic';
    const currentPreviewAbility = preferredAbility === 'targeted' && session.bossAbilityCooldown <= 0
        ? 'targeted'
        : preferredAbility === 'aoe' && session.bossAoeCooldown <= 0
            ? 'aoe'
            : preferredAbility === 'vamp' && session.bossVampCooldown <= 0
                ? 'vamp'
                : session.bossAbilityCooldown <= 0
                    ? 'targeted'
                    : session.bossAoeCooldown <= 0
                        ? 'aoe'
                        : session.bossVampCooldown <= 0
                            ? 'vamp'
                            : 'basic';
    const currentPreviewKey = `${previewTurn}:${session.boss.name}:${currentPreviewAbility}:${preferredAbility}`;
    const shouldReusePreview = session.lastPreview
        && session.lastPreview.turn === previewTurn
        && session.lastPreview.actor === session.boss.name
        && session.lastPreview.previewKey === currentPreviewKey;
    const preview = shouldReusePreview
        ? session.lastPreview
        : getBossPreview(session);
    if (preview) {
        session.lastPreview = preview;
    }
    const previewTargetName = preview?.resolvedTargetName || preview?.target || null;
    const bossStats = `HP ${Math.max(0, session.boss.currentHp)} • ATK ${session.boss.atk} • DEF ${session.boss.def}`;
    elements.fightBoss.innerHTML = `
        <div class="fight-boss-card ${session.currentActor?.name === session.boss.name ? 'active' : ''} ${bossDamageFlash} ${bossHighlight}">
            <div class="fight-unit-row">
                <div class="fight-avatar">
                    ${bossAvatarUrl ? `<img src="${bossAvatarUrl}" alt="${session.boss.name}">` : '<div class="fight-avatar-placeholder"></div>'}
                </div>
                <div class="fight-unit-body">
                    <div class="fight-unit-header">
                        <h3>${session.boss.name}</h3>
                        <span class="fight-role">Boss</span>
                    </div>
                    <div class="fight-stats">${bossStats}</div>
                </div>
            </div>
            <div class="fight-hp-bar">
                <div class="fight-hp-fill ${bossHpPercent <= 35 ? 'warning' : ''} ${bossDamageFlash}" style="width: ${Math.max(0, bossHpPercent)}%"></div>
                ${session.lastAction?.target === session.boss.name ? `<span class="fight-damage-badge">-${session.lastAction.amount}</span>` : ''}
            </div>
            <div class="fight-hp-label">${Math.max(0, session.boss.currentHp)} / ${session.boss.hpMax} HP</div>
        </div>
    `;

    elements.fightParty.innerHTML = session.party.map(member => {
        const hpPercent = (member.currentHp / member.hpMax) * 100;
        const isActive = session.currentActor?.name === member.name;
        const memberDamageFlash = session.lastAction?.target === member.name ? 'damage-flash' : '';
        const memberHighlight = session.highlightUntil > Date.now() && session.lastAction?.target === member.name ? 'fight-card-pulse fight-vibrate' : '';
        const avatarUrl = getFightUnitAvatar(member);
        const targetArrow = previewTargetName && session.phase === 'boss' && member.name === previewTargetName ? '<span class="fight-target-arrow" aria-label="Targeted"></span>' : '';
        const isTargeted = previewTargetName && session.phase === 'boss' && member.name === previewTargetName;
        const extraStats = [
            member.thorns > 0 ? `THR ${member.thorns}` : null,
            member.regen > 0 ? `REGEN ${member.regen}` : null,
            member.healingOutput > 0 ? `HEAL ${member.healingOutput}` : null
        ].filter(Boolean);
        const statLabel = extraStats.length > 0 ? ` • ${extraStats.join(' • ')}` : '';
        const damageBadge = session.lastAction && ['attack', 'boss', 'heal-attack', 'thorns'].includes(session.lastAction.type)
            && session.lastAction.target === member.name
            ? `<span class="fight-damage-badge">-${session.lastAction.amount}</span>`
            : '';
        const healBadge = (session.lastAction?.type === 'regen' || session.lastAction?.type === 'heal')
            && session.lastAction.target === member.name
            ? `<span class="fight-heal-badge">+${session.lastAction.amount}</span>`
            : '';
        return `
            <div class="fight-member-card ${isActive ? 'active' : ''} ${memberDamageFlash} ${memberHighlight} ${isTargeted ? 'targeted' : ''}">
                ${targetArrow}
                <div class="fight-unit-row">
                    <div class="fight-avatar">
                        ${avatarUrl ? `<img src="${avatarUrl}" alt="${member.name}">` : '<div class="fight-avatar-placeholder"></div>'}
                    </div>
                    <div class="fight-unit-body">
                        <div class="fight-unit-header">
                            <h3>${member.name}</h3>
                            <span class="fight-role">${member.playerClass || 'Raider'}</span>
                        </div>
                        <div class="fight-stats">HP ${Math.max(0, member.currentHp)} • ATK ${member.atk} • DEF ${member.def}${statLabel}</div>
                    </div>
                </div>
                <div class="fight-hp-bar">
                    <div class="fight-hp-fill ${hpPercent <= 35 ? 'warning' : ''} ${memberDamageFlash}" style="width: ${Math.max(0, hpPercent)}%"></div>
                    ${damageBadge}
                    ${healBadge}
                </div>
                <div class="fight-hp-label">${Math.max(0, member.currentHp)} / ${member.hpMax} HP</div>
            </div>
        `;
    }).join('');

    const getAbilityButtonLabel = (abilityKey, cooldown) => {
        if (abilityKey === 'basic') {
            return 'Basic';
        }
        const labels = {
            targeted: 'Targeted',
            aoe: 'AoE',
            vamp: 'Vamp'
        };
        const base = labels[abilityKey] || abilityKey;
        return cooldown > 0 ? `${base} (${cooldown})` : base;
    };

    const activeAbility = FightModule && typeof FightModule.getBossPreview === 'function'
        ? (preview?.type === 'targeted' ? 'targeted' : preview?.type === 'aoe' ? 'aoe' : preview?.type === 'vamp' ? 'vamp' : 'basic')
        : (session.bossSelectedAbility === 'basic' ? 'basic' : 'basic');
    const previewDamageText = preview?.amountRange ? `${preview.amountRange.min}-${preview.amountRange.max}` : preview?.amount;

    elements.fightAbilityBar.innerHTML = session.phase === 'boss' ? `
        <div class="fight-ability-preview">
            <strong>${preview ? preview.abilityName : 'Boss Ability'}</strong>
            ${preview ? ` → ${preview.target} for ${previewDamageText} damage` : ''}
        </div>
        <div class="fight-ability-controls">
            <button type="button" class="fight-ability-choice ${activeAbility === 'basic' ? 'active' : ''}" data-ability="basic">Basic</button>
            <button type="button" class="fight-ability-choice ${activeAbility === 'targeted' ? 'active' : ''}" data-ability="targeted" ${session.bossAbilityCooldown <= 0 ? '' : 'disabled'}>${getAbilityButtonLabel('targeted', session.bossAbilityCooldown)}</button>
            <button type="button" class="fight-ability-choice ${activeAbility === 'aoe' ? 'active' : ''}" data-ability="aoe" ${session.bossAoeCooldown <= 0 ? '' : 'disabled'}>${getAbilityButtonLabel('aoe', session.bossAoeCooldown)}</button>
            <button type="button" class="fight-ability-choice ${activeAbility === 'vamp' ? 'active' : ''}" data-ability="vamp" ${session.bossVampCooldown <= 0 ? '' : 'disabled'}>${getAbilityButtonLabel('vamp', session.bossVampCooldown)}</button>
        </div>
        <span class="fight-ability-text">${preview ? preview.abilityName : 'Basic attack'}</span>
    ` : '';

    const recentLogs = (session.log || []).slice(-8);
    elements.fightLog.innerHTML = recentLogs.length > 0
        ? recentLogs.map(line => `<div class="fight-log-entry">${line}</div>`).join('')
        : '<div class="fight-log-entry">No turns have been taken yet.</div>';
    elements.fightLog.scrollTop = elements.fightLog.scrollHeight;

    if (session.status !== 'ready') {
        elements.btnRunFight.textContent = 'Restart Fight';
    } else if (session.phase === 'setup') {
        elements.btnRunFight.textContent = 'Start Fight';
    } else {
        elements.btnRunFight.textContent = 'Next Turn';
    }
};

const handleBossAbilitySelection = (event) => {
    const button = event.target.closest('[data-ability]');
    if (!button || !state.fightSession || state.fightSession.phase !== 'boss') {
        return;
    }
    const ability = button.getAttribute('data-ability');
    if (!ability) {
        return;
    }
    const wasTargetedSelected = state.fightSession.bossSelectedAbility === 'targeted';
    state.fightSession.bossSelectedAbility = ability;
    if (ability === 'targeted' && state.fightSession.bossAbilityCooldown > 0) {
        return;
    }
    if (ability === 'aoe' && state.fightSession.bossAoeCooldown > 0) {
        return;
    }
    if (ability === 'vamp' && state.fightSession.bossVampCooldown > 0) {
        return;
    }

    if (ability === 'targeted' && wasTargetedSelected) {
        state.fightSession.lastPreview = null;
    }

    renderFightView();
};

const runFight = () => {
    if (!FightModule) {
        elements.fightSummary.textContent = 'Combat module unavailable.';
        return;
    }

    if (!state.fightSession) {
        if (state.scannedPlayers.length === 0) {
            elements.fightSummary.textContent = 'Scan at least one raider before fighting.';
            return;
        }
        const boss = createBossProfile();
        const party = state.scannedPlayers.map(raider => ({ ...raider, currentHp: raider.hpMax, inventory: Array.isArray(raider.inventory) ? [...raider.inventory] : [] }));
        state.fightSession = FightModule.createFightSession({ boss, party });
    }

    if (state.fightSession.status !== 'ready') {
        const boss = createBossProfile();
        const party = state.scannedPlayers.map(raider => ({ ...raider, currentHp: raider.hpMax, inventory: Array.isArray(raider.inventory) ? [...raider.inventory] : [] }));
        state.fightSession = FightModule.createFightSession({ boss, party });
    }

    if (state.fightSession.phase === 'setup') {
        state.fightSession.phase = 'boss';
        state.fightSession.currentActor = { name: state.fightSession.boss.name, kind: 'boss', unit: state.fightSession.boss };
        state.fightSession.lastAction = { type: 'setup', actor: state.fightSession.boss.name, target: null, amount: 0, detail: 'Ready' };
        state.fightSession.lastPreview = getBossPreview(state.fightSession);
        renderFightView();
        return;
    }

    FightModule.advanceTurn(state.fightSession);
    if (state.fightSession.lastAction && state.fightSession.lastAction.amount > 0) {
        applyFightAnimation(state.fightSession, state.fightSession.lastAction.target, state.fightSession.lastAction.amount);
    }
    renderFightView();
};

const activateBossScan = () => {
    showScreen('scan');
    renderScannedList();
    state.lastScannedToken = null;
    
    // Ensure the camera wrapper is completely visible
    const stageContainer = document.querySelector('.scan-stage');
    if (stageContainer) {
        stageContainer.classList.remove('hidden');
    }
    
    // Clear any leftover "Scan Next Raider" buttons from a previous scan
    const oldBtn = document.getElementById('btn-scan-next');
    if (oldBtn) oldBtn.remove();
    
    elements.scanStatus.textContent = 'Ready to scan or paste a raider QR code.';
    elements.scanStatus.style.color = "";
    
    // Turn on the video loop
    startQrScanner(); 
};

const initialize = async () => {
    await loadLocations();
    await loadLootConfig();
    loadPlayer();
    if (state.player) {
        state.role = state.player.role;
        state.avatarSeed = state.player.avatarSeed || createAvatarSeed();
        state.avatarStyle = state.player.avatarStyle || pickRandomAvatarStyle();
        state.avatarUrl = state.player.avatarUrl || getAvatarUrl(state.avatarStyle, state.avatarSeed);
        if (Array.isArray(state.visitedLocationIds) && state.visitedLocationIds.length > 0) {
            locations.forEach(location => {
                location.visited = state.visitedLocationIds.includes(location.id);
            });
            state.visitedLocationIds = [];
        }
    } else {
        state.avatarSeed = null;
        state.avatarStyle = null;
        state.avatarUrl = null;
    }

    elements.btnStartRaider.addEventListener('click', () => {
        state.role = 'raider';
        elements.playerRoleInput.value = 'Raider';
        elements.playerClassSelector.classList.remove('hidden');
        elements.btnClassInfo.classList.remove('hidden');
        elements.bossOnlyHint.classList.add('hidden');
        elements.setupForm.querySelector('button[type=submit]').textContent = 'Create Raider';
        showScreen('setup');
    });

    elements.btnStartBoss.addEventListener('click', () => {
        state.role = 'boss';
        elements.playerRoleInput.value = 'Boss';
        elements.playerClassSelector.classList.add('hidden');
        elements.btnClassInfo.classList.add('hidden');
        closeClassInfoModal();
        elements.bossOnlyHint.classList.remove('hidden');
        elements.setupForm.querySelector('button[type=submit]').textContent = 'Create Boss';
        showScreen('setup');
    });

    elements.btnClassInfo.addEventListener('click', openClassInfoModal);
    elements.btnClassInfoClose.addEventListener('click', closeClassInfoModal);
    elements.classInfoModal.addEventListener('click', (event) => {
        if (event.target === elements.classInfoModal) {
            closeClassInfoModal();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !elements.classInfoModal.classList.contains('hidden')) {
            closeClassInfoModal();
        }
    });

    elements.btnBackWelcome.addEventListener('click', () => showScreen('welcome'));

    elements.setupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = elements.playerNameInput.value.trim();
        if (name.length < 2) {
            alert('Enter a name with at least 2 characters.');
            return;
        }
        const playerClass = state.role === 'boss' ? 'boss' : getSelectedPlayerClass();
        state.player = createNewPlayer(name, state.role, playerClass);
        savePlayer();
        updateProfileUI();
        showScreen('player');
    });

    elements.btnResetProfile.addEventListener('click', () => {
        if (confirm('Reset this profile and return to the welcome screen?')) {
            stopVideo();
            resetPlayer();
            showScreen('welcome');
        }
    });

    elements.btnRefreshLocation.addEventListener('click', () => {
        refreshUserLocation();
        showScreen('locations');
    });

    elements.btnViewQr.addEventListener('click', async () => {
        await buildQrPage();
        showScreen('qr');
    });

    elements.btnGoLocations.addEventListener('click', () => {
        refreshUserLocation();
        showScreen('locations');
    });

    elements.btnBackLoot.addEventListener('click', () => {
        if (state.pendingLoot?.items?.length) {
            elements.lootMessage.textContent = 'Choose your loot first before leaving this screen.';
            return;
        }
        showScreen('locations');
    });

    elements.btnToggleDebug.addEventListener('click', () => {
        if (!state.debugMode) {
            if (!askPassword('Enter developer password to enable test mode:')) {
                alert('Incorrect password. Test mode not enabled.');
                return;
            }
        }
        state.debugMode = !state.debugMode;
        elements.btnToggleDebug.textContent = state.debugMode ? 'Disable Test Mode' : 'Enter Test Mode';
        elements.locationStatus.textContent = state.debugMode
            ? 'Test mode ON: location checks will skip real GPS.'
            : 'Test mode OFF: location checks require real GPS.';
        buildLocationCards();
    });

    elements.btnClearStorage.addEventListener('click', () => clearStorageWithPassword());

    elements.btnBackPlayer.addEventListener('click', () => showScreen('player'));
    elements.btnBackPlayer2.addEventListener('click', () => showScreen('player'));
    elements.btnBackPlayer3.addEventListener('click', () => {
        stopVideo();
        showScreen('player');
    });
    elements.btnBackPlayer4.addEventListener('click', () => showScreen('player'));
    elements.btnBackLocations.addEventListener('click', () => {
        if (state.currentLocation && !state.currentLocation.visited) {
            elements.locationStatus.textContent = `Question for ${state.currentLocation.name} is still open. Return to the location to finish it.`;
        }
        showScreen('locations');
    });

    elements.btnSubmitAnswer.addEventListener('click', handleAnswerSubmit);
    elements.btnScanQr.addEventListener('click', activateBossScan);

    elements.btnParseQr.addEventListener('click', () => {
        const payload = parsePlayerToken(elements.scanInput.value);
        addScannedPlayer(payload, elements.scanInput.value);
    });
    elements.btnGoLocationsBoss.addEventListener('click', () => {
        refreshUserLocation();
        showScreen('locations');
    });

    elements.btnRandomAvatar.addEventListener('click', generateRandomAvatar);
    if (!state.player) {
        generateRandomAvatar();
    }
    //elements.btnViewScanned.addEventListener('click', activateBossScan);
    elements.btnViewScanned.addEventListener('click', () => {
    // Turn off the camera if it was lingering open
    stopVideo(); 
    
    showScreen('scan');
    
    // Hide the entire live camera block so only the party roster is visible
    const stageContainer = document.querySelector('.scan-stage');
    if (stageContainer) {
        stageContainer.classList.add('hidden');
    }
    
    // Update the layout context text
    elements.scanStatus.textContent = "Reviewing Scanned Raid Party";
    elements.scanStatus.style.color = "#7dd3fc"; // Change text to your theme's info blue
});
    elements.fightAbilityBar.addEventListener('click', handleBossAbilitySelection);

    elements.btnStartFight.addEventListener('click', () => {
        if (state.scannedPlayers.length === 0) {
            elements.profileMessage.textContent = 'Scan raiders before starting the fight.';
            return;
        }
        const boss = createBossProfile();
        const party = state.scannedPlayers.map(raider => ({ ...raider, currentHp: raider.hpMax, inventory: Array.isArray(raider.inventory) ? [...raider.inventory] : [] }));
        state.fightSession = FightModule ? FightModule.createFightSession({ boss, party }) : null;
        showScreen('fight');
        renderFightView();
    });
    elements.btnRunFight.addEventListener('click', runFight);

    if (state.player) {
        state.avatarSeed = state.player.avatarSeed || createAvatarSeed();
        state.avatarStyle = state.player.avatarStyle || pickRandomAvatarStyle();
        state.avatarUrl = state.player.avatarUrl || getAvatarUrl(state.avatarStyle, state.avatarSeed);
        updateProfileUI();
        showScreen('player');
    }
};

const generateRandomAvatar = () => {
    const seed = createAvatarSeed();
    const style = pickRandomAvatarStyle();
    state.avatarSeed = seed;
    state.avatarStyle = style;
    state.avatarUrl = getAvatarUrl(style, seed);
    elements.avatarPreview.innerHTML = `<img src="${state.avatarUrl}" alt="Random avatar preview">`;
};

const updateProfileUI = () => {
    if (!state.player) {
        return;
    }
    elements.summaryName.textContent = state.player.name;
    elements.summaryRole.textContent = state.player.role === 'boss' ? 'Boss' : 'Raider';
    elements.summaryClass.textContent = state.player.playerClass
        ? `${state.player.playerClass.toUpperCase()} — ${state.player.classDescription || ''}`
        : '';
    elements.statHp.textContent = `${state.player.currentHp}/${state.player.hpMax}`;
    elements.statAtk.textContent = state.player.atk;
    elements.statDef.textContent = state.player.def;
    elements.statSpd.textContent = state.player.spd.toFixed(2);
    elements.statCrit.textContent = `${state.player.critRate}%`;
    elements.statCdmg.textContent = `${state.player.critDmg}%`;
    elements.statRage.textContent = state.player.rage || '-';
    elements.statThorns.textContent = state.player.thorns || '-';
    elements.statRegen.textContent = state.player.regen || '-';
    elements.statHeal.textContent = state.player.playerClass === 'healer' ? state.player.healingOutput : '-';
    elements.playerAvatarImg.src = state.player.avatarUrl || state.avatarUrl;
    elements.playerAvatarImg.alt = `${state.player.name} avatar`;
    elements.profileMessage.textContent = state.player.role === 'boss'
        ? 'Use this phone to collect raider codes and start the fight.'
        : 'Collect loot by visiting real locations and answering questions correctly.';
    elements.raiderControls.classList.toggle('hidden', state.player.role === 'boss');
    elements.bossControls.classList.toggle('hidden', state.player.role !== 'boss');
    renderInventory();
};

initialize();
