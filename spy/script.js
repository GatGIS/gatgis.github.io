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
let usedLocations = [];
let randomLocation;

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

function loadTranslations() {
  fetch(`${currentLanguage}.json`)
    .then(response => response.json())
    .then(data => {
      translations = data;
      applyTranslations();
      updateLanguageButtons(currentLanguage === 'eng' ? 'english-button' : 'latvian-button');
    });
}
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
  const availableLocations = translations.locations; // Use the translated locations directly
  const randomLocationIndex = generateRandomLocationIndex(usedLocations);
  const randomLocation = availableLocations[randomLocationIndex];
  usedLocations.push(randomLocation);


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

function generateRandomLocationIndex(excludedLocations) {
  const availableLocations = translations.locations;
  const filteredLocations = availableLocations.filter(location => !excludedLocations.includes(location));
  return Math.floor(Math.random() * filteredLocations.length);
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
function backToStart() { // Add this function
  cardsContainer.innerHTML = '';
  settingsContainer.style.display = 'none';
  gameContainer.classList.remove('hidden');
  countdownContainer.style.display = 'none';
  resetCountdown();
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
  }, 1000);
}

function checkAllUsed() {
  const allCards = Array.from(document.getElementsByClassName('card'));
  if (allCards.every(card => card.classList.contains('used'))) {
    usedLocations.push(randomLocation); // Add the location to usedLocations
    console.log(`Added "${randomLocation}" to usedLocations`);
    countdownContainer.style.display = 'block'; // Show the countdown when all cards are used
    startCountdown(); // Start the countdown if all cards are used
  }
}
