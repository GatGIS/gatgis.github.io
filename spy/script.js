const gameContainer = document.getElementById('game-container');
const cardsContainer = document.getElementById('cards-container');
const countdownContainer = document.getElementById('countdown-container'); // Add this line
const playerCountInput = document.getElementById('player-count');
const timerInput = document.getElementById('timer');
const playerCountValue = document.getElementById('player-count-value');
const timerValue = document.getElementById('timer-value');
const startButton = document.getElementById('start-button');
const settingsContainer = document.getElementById('settings-container');
const restartButton = document.getElementById('restart-button');
const backToStartButton = document.getElementById('back-to-start-button'); // Add this line
const englishButton = document.getElementById('english-button');
const latvianButton = document.getElementById('latvian-button');

englishButton.addEventListener('click', () => {
  currentLanguage = 'eng';
  loadTranslations();
  updateLanguageButtons('english-button');
});

latvianButton.addEventListener('click', () => {
  currentLanguage = 'lv';
  loadTranslations();
  updateLanguageButtons('latvian-button');
});


let countdownInterval;
let remainingTime = 0;
let currentLanguage = 'eng'; // Default language is English
let translations; // Store loaded translations
let isCardRevealing = false; // Flag to track card reveal state
let usedLocations = new Set(); // Use a Set to store used locations
let allLocations = [];
let currentLocations = [];
let currentRoundLocation;

function loadTranslations() {
  fetch(`${currentLanguage}.json`)
    .then(response => response.json())
    .then(data => {
      translations = data;
      allLocations = [...translations.locations]; // Populate all locations
      currentLocations = allLocations.filter(location => !usedLocations.has(location)); // Use "has" method for Set
      applyTranslations();
      updateLanguageButtons(currentLanguage === 'eng' ? 'english-button' : 'latvian-button');
    });
}
backToStartButton.addEventListener('click', backToStart);
restartButton.addEventListener('click', restartGame);
playerCountInput.addEventListener('input', updatePlayerCount);
timerInput.addEventListener('input', updateTimer);

startButton.addEventListener('click', () => {
  // Check if the screen width is below a certain threshold (e.g., for mobile devices)
  if (window.innerWidth <= 768) {
    const element = document.documentElement; // Fullscreen the entire document
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { // Firefox
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari, and Opera
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { // IE/Edge
      element.msRequestFullscreen();
    }
  }
  startGame();
});


updatePlayerCount();
updateTimer();

function updateLanguageButtons(selectedButtonId) {
  // Remove the "selected" class from all language buttons
  englishButton.classList.remove('selected');
  latvianButton.classList.remove('selected');

  // Add the "selected" class to the currently clicked button
  document.getElementById(selectedButtonId).classList.add('selected');
}
function applyTranslations() {
  // Apply translations to elements using their 'data-translation' attributes
  const elementsToTranslate = document.querySelectorAll('[data-translation]');
  elementsToTranslate.forEach(element => {
    const translationKey = element.getAttribute('data-translation');
    if (translations.hasOwnProperty(translationKey)) {
      element.textContent = translations[translationKey];
    }
  });
}

// Call loadTranslations() when the page loads
window.addEventListener('DOMContentLoaded', loadTranslations);

function restartGame() {
  resetCountdown(); // Stop the previous countdown if running
  startGame(); // Restart the game
  isCardRevealing = false; // Reset the flag
  countdownContainer.style.display = 'none';
}

function resetCountdown() {
  clearInterval(countdownInterval);
  remainingTime = 0;
  countdownContainer.textContent = ''; // Clear countdown display
}

function updatePlayerCount() {
  const count = playerCountInput.value;
  playerCountValue.textContent = count;
}

function updateTimer() {
  const minutes = timerInput.value;
  timerValue.textContent = minutes + " min";
}

function startGame() {
  const playerCount = parseInt(playerCountInput.value);
  settingsContainer.classList.remove('hidden'); // Show settings after starting game
  isCardRevealing = false; // Reset the flag
  const timerMinutes = parseInt(timerInput.value);
  gameContainer.classList.add('hidden');
  cardsContainer.innerHTML = '';
  countdownContainer.innerHTML = ''; // Clear previous countdown display

  const spyIndex = Math.floor(Math.random() * playerCount);

  if (currentLocations.length === 0) {
    restartButton.removeEventListener('click', restartGame);
    restartButton.addEventListener('click', backToStart);
  } else {
    restartButton.removeEventListener('click', backToStart);
    restartButton.addEventListener('click', restartGame);
  }

  const randomLocationIndex = generateRandomLocationIndex(currentLocations, spyIndex, spyIndex);
  currentRoundLocation = currentLocations[randomLocationIndex];
  const randomLocation = currentRoundLocation;

  for (let i = 0; i < playerCount; i++) {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = translations.unrevealed_card;
    card.addEventListener('click', revealCard.bind(null, card, randomLocation, i, spyIndex));
    cardsContainer.appendChild(card);
  }

  settingsContainer.style.display = 'block'; // Show settings after starting game
  cardsContainer.classList.remove('hidden');
  countdownContainer.style.display = 'none';
  resetCountdown();
  remainingTime = timerMinutes * 60;
}

function backToStart() {
  cardsContainer.innerHTML = '';
  settingsContainer.style.display = 'none';
  gameContainer.classList.remove('hidden');
  countdownContainer.style.display = 'none';
  resetCountdown();
  if (currentRoundLocation) {
    usedLocations.add(currentRoundLocation); // Store the used location from the current round
  }
  usedLocations.clear(); // Clear the used locations list
  currentLocations = [...allLocations]; // Reset the current locations
}

function generateRandomLocationIndex(excludedLocations, spyIndex, cardIndex) {
  let availableLocations = excludedLocations.filter(location => !usedLocations.has(location));

  if (cardIndex !== spyIndex) {
    availableLocations = availableLocations.filter(location => location !== currentRoundLocation);
  }

  // If only one location remains, return its index
  if (availableLocations.length === 1) {
    return excludedLocations.indexOf(availableLocations[0]);
  }

  return Math.floor(Math.random() * availableLocations.length);
}

function startCountdown() {
  countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown();
}


function updateCountdown() {
  if (remainingTime <= 0) {
    clearInterval(countdownInterval);
    countdownContainer.textContent = 'Time\'s up!';
  } else {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    countdownContainer.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    remainingTime--;
  }
}

function revealCard(card, location, cardIndex, spyIndex) {
  if (isCardRevealing) {
    return; // Return if a card is already being revealed
  }

  isCardRevealing = true; // Set the flag to true
  card.removeEventListener('click', revealCard);

  if (card.classList.contains('used')) {
    return;
  }

  if (cardIndex === spyIndex) {
    card.textContent = translations.spy_card;
    card.classList.add('spy', 'revealed');
  } else {
    card.textContent = location;
    card.classList.add('revealed');
  }

  setTimeout(() => {
    card.textContent = translations.used_card;
    card.classList.remove('spy', 'revealed');
    card.classList.add('used');
    isCardRevealing = false; // Reset the flag after the reveal timeout
    randomLocation = location; // Assign randomLocation here, after the reveal
    checkAllUsed();
  }, 3000);
}

function checkAllUsed() {
  const allCards = Array.from(document.getElementsByClassName('card'));
  if (allCards.every(card => card.classList.contains('used'))) {
    if (!usedLocations.has(currentRoundLocation)) {
      usedLocations.add(currentRoundLocation); // Add the location to usedLocations
      console.log(`Added "${currentRoundLocation}" to usedLocations`);
    }

    if (usedLocations.size === allLocations.length) {
      restartButton.removeEventListener('click', restartGame);
      restartButton.addEventListener('click', backToStart);
    } else {
      restartButton.removeEventListener('click', backToStart);
      restartButton.addEventListener('click', restartGame);
    }

    countdownContainer.style.display = 'block'; // Show the countdown when all cards are used
    startCountdown(); // Start the countdown if all cards are used
  }
}
