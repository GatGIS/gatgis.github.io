let currentLang = localStorage.getItem('currentLang') || 'langB';
let questions = [];
let quizState = {
  answers: {},
  correct: [],
  incorrectCount: 0,
  startTime: Date.now(),
  winTime: null  // ← track when the user finished
};

function saveState() {
  localStorage.setItem("quizState", JSON.stringify(quizState));
}

function loadState() {
  const saved = localStorage.getItem("quizState");
  if (saved) {
    quizState = JSON.parse(saved);
  } else {
    quizState.startTime = Date.now();
    saveState();
  }
}

const translations = {
  langA: {
    submit: 'Submit',
    winMessage: '🎉 You did it, champ!',
    timeLabel: 'Time',
    incorrectLabel: 'Incorrect Attempts'
  },
  langB: {
    submit: 'Iesniegt',
    winMessage: '🎉 Uzdevums pabeigts!',
    timeLabel: 'Laiks',
    incorrectLabel: 'Nepareizi mēģinājumi'
  }
};
document.getElementById('language').value = currentLang;

document.getElementById('language').addEventListener('change', (e) => {
  currentLang = e.target.value;
  localStorage.setItem('currentLang', currentLang); // Save selection
  renderQuestions();
});


let timerInterval;
function startTimer() {
  const timerEl = document.getElementById('timer');

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }

  // If quiz is already completed, show static time
  if (quizState.winTime) {
    const elapsed = quizState.winTime - quizState.startTime;
    timerEl.textContent = `⏱ ${formatTime(elapsed)}`;
    return; // Don't start the interval
  }

  function update() {
    const elapsed = Date.now() - quizState.startTime;
    timerEl.textContent = `⏱ ${formatTime(elapsed)}`;
  }

  update(); // Initial display
  timerInterval = setInterval(update, 1000);
}


async function loadQuestions() {
  const res = await fetch('questions.json');
  questions = await res.json();
  renderQuestions();
  updateProgressBar();
  updateIncorrectCounter(); // this can stay to ensure accuracy
}


function updateProgressBar() {
  const progress = (quizState.correct.length / questions.length) * 100;
  document.getElementById('progress-bar').style.width = `${progress}%`;
}

function updateIncorrectCounter() {
  document.getElementById('incorrect-counter').textContent = `❌ ${quizState.incorrectCount}`;
}

function renderQuestions() {
  const container = document.getElementById('quiz-container');
  container.innerHTML = '';

  questions.forEach((q) => {
    const prevAnswer = quizState.answers[q.id];
    const wasCorrect = quizState.correct.includes(q.id);

    const card = document.createElement('div');
    card.className = 'card';

    if (prevAnswer) {
      card.classList.add(wasCorrect ? 'card-correct' : 'card-incorrect');
    }

    const questionText = document.createElement('div');
    questionText.className = 'question';
    questionText.textContent = q[currentLang];

    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';

    let input, rangeDisplay;

    if (q.type === 'open') {
      input = document.createElement('input');
      input.type = 'text';
      input.value = prevAnswer || '';
    } else if (q.type === 'number') {
      input = document.createElement('input');
      input.type = 'range';
      input.min = q.min;
      input.max = q.max;
      input.value = prevAnswer || q.min;

      rangeDisplay = document.createElement('div');
      rangeDisplay.className = 'range-value';
      rangeDisplay.innerHTML = `Selected: <span class="range-number">${input.value}</span>`;

      input.addEventListener('input', () => {
        rangeDisplay.innerHTML = `Selected: <span class="range-number">${input.value}</span>`;
      });

      inputGroup.appendChild(rangeDisplay);
    }

    input.id = `input_${q.id}`;

    const buttonWrapper = document.createElement('div');
    const button = document.createElement('button');
    button.textContent = translations[currentLang].submit;

    buttonWrapper.appendChild(button);

    if (prevAnswer && wasCorrect) {
      input.disabled = true;
      buttonWrapper.innerHTML = '✅';
    }

    button.onclick = () => {
      let userAnswer = input.value.trim();
      const isEmpty = userAnswer === '';

      if (q.type === 'open') {
        userAnswer = normalize(userAnswer);
      }

      const isCorrect = q.answer.some(ans =>
        q.type === 'number' ? ans == userAnswer : normalize(ans) === userAnswer
      );

      input.classList.remove('correct', 'incorrect');
      card.classList.remove('card-correct', 'card-incorrect');

      quizState.answers[q.id] = input.value;

      if (isCorrect) {
        if (!quizState.correct.includes(q.id)) {
          quizState.correct.push(q.id);
        }
        input.classList.add('correct');
        input.disabled = true;
        buttonWrapper.innerHTML = '✅';
        card.classList.add('card-correct');
      } else if (!isEmpty) {
        input.classList.add('incorrect');
        quizState.incorrectCount += 1;
        card.classList.add('card-incorrect');
      }

      saveState();
      updateProgressBar();
      updateIncorrectCounter();
      checkWin(); // check on each answer
    };

    inputGroup.appendChild(input);
    inputGroup.appendChild(buttonWrapper);
    card.appendChild(questionText);
    card.appendChild(inputGroup);
    container.appendChild(card);
  });

  // ✅ Call this AFTER all questions have been rendered
  checkWin();
}


function checkWin() {
  // If all questions are correct and not yet marked as completed
  if (quizState.correct.length === questions.length && !quizState.winTime) {
    quizState.winTime = Date.now();
    saveState();
    clearInterval(timerInterval);
    showWinBox();
  }

  // If already completed (e.g. page reloaded)
  if (quizState.winTime) {
    clearInterval(timerInterval);
    showWinBox();
  }
}

function showWinBox() {
  const container = document.getElementById('quiz-container');
  if (document.getElementById('win-box')) return; // prevent duplicates

  const elapsed = quizState.winTime - quizState.startTime;
  const minutes = String(Math.floor(elapsed / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');

  const winBox = document.createElement('div');
  winBox.id = 'win-box';
  winBox.className = 'card win-card';

  const langText = {
    langA: `
      🎉 You completed the task!<br><br>
      ⏱ Time: ${minutes}:${seconds}<br>
      ❌ Incorrect Attempts: ${quizState.incorrectCount}
    `,
    langB: `
      🎉 Uzdevums pabeigts!<br><br>
      ⏱ Laiks: ${minutes}:${seconds}<br>
      ❌ Kļūdas: ${quizState.incorrectCount}
    `
  };

  winBox.innerHTML = `<div class="question">${langText[currentLang]}</div>`;
  container.appendChild(winBox);
}

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, '');
}

// Initialize from saved state FIRST
loadState();
updateIncorrectCounter(); // ensures ❌ is up-to-date
startTimer(); // uses winTime correctly if exists
loadQuestions(); // fetches and renders questions



async function hashPassword(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.getElementById('secret-reset').addEventListener('click', async () => {
  const confirmed = confirm("Reset all progress?");
  if (!confirmed) return;

  const input = prompt("Enter reset password:");
  if (!input) return;

  const trimmedInput = input.trim();
  const inputHash = await hashPassword(trimmedInput);
  const storedHash = "943bbbce935564cb99505d4668fcc04dace3df34282d5483d8b96fbaeada1c46"; // SHA-256 of 'parole'

  console.log("Entered password:", trimmedInput);
  console.log("Computed hash:  ", inputHash);
  console.log("Expected hash:  ", storedHash);

  if (inputHash === storedHash) {
    localStorage.removeItem('quizState');
    location.reload();
  } else {
    alert("Incorrect password. Reset aborted.");
  }
});
