let currentLang = 'langA';
let questions = [];
let quizState = {
  answers: {},
  correct: [],
  incorrectCount: 0,
  startTime: Date.now()
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
    winMessage: '🎉 You did it!',
    timeLabel: 'Time',
    incorrectLabel: 'Incorrect Attempts'
  },
  langB: {
    submit: 'Iesniegt',
    winMessage: '🎉 Tu to paveici!',
    timeLabel: 'Laiks',
    incorrectLabel: 'Nepareizi mēģinājumi'
  }
};


document.getElementById('language').addEventListener('change', (e) => {
  currentLang = e.target.value;
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

  function update() {
    const elapsed = Date.now() - quizState.startTime;
    timerEl.textContent = `Time: ${formatTime(elapsed)}`;
  }

  update();
  timerInterval = setInterval(update, 1000);
}

async function loadQuestions() {
  loadState();
  const res = await fetch('questions.json');
  questions = await res.json();
  renderQuestions();
  updateProgressBar();
  updateIncorrectCounter();
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
      checkWin();
    };

    inputGroup.appendChild(input);
    inputGroup.appendChild(buttonWrapper);
    card.appendChild(questionText);
    card.appendChild(inputGroup);
    container.appendChild(card);
  });
}

function checkWin() {
  if (quizState.correct.length === questions.length) {
    clearInterval(timerInterval);

    const elapsed = Date.now() - quizState.startTime;
    const totalTime = Math.floor(elapsed / 1000);
    const minutes = String(Math.floor(totalTime / 60)).padStart(2, '0');
    const seconds = String(totalTime % 60).padStart(2, '0');

    // Avoid duplicate win message
    if (document.getElementById('win-message')) return;

    const winCard = document.createElement('div');
    winCard.className = 'card';
    winCard.id = 'win-message';

    winCard.innerHTML = `
      <div class="win-box">
        <strong>${translations[currentLang].winMessage}</strong><br><br>
        ⏱ ${translations[currentLang].timeLabel}: ${minutes}:${seconds}<br>
        ❌ ${translations[currentLang].incorrectLabel}: ${quizState.incorrectCount}
      </div>
    `;

    document.getElementById('quiz-container').appendChild(winCard);
  }
}


function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, '');
}

// Start the app
startTimer();
loadQuestions();

document.getElementById('secret-reset').addEventListener('click', () => {
  if (confirm("Reset all progress?")) {
    localStorage.removeItem('quizState');
    location.reload();
  }
});
