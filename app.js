const LEVELS = {
  easy: { max: 20, attempts: 7, label: "1 – 20" },
  medium: { max: 50, attempts: 6, label: "1 – 50" },
  hard: { max: 100, attempts: 5, label: "1 – 100" },
};

let currentLevel = "easy";
let secretNumber = 0;
let attemptsLeft = 0;
let guessesMade = [];
let gameOver = false;
const bestScores = { easy: null, medium: null, hard: null };

// DOM Elements
const levelButtons = document.querySelectorAll(".level-btn");
const rangeText = document.getElementById("rangeText");
const attemptsText = document.getElementById("attemptsText");
const bestScoreText = document.getElementById("bestScoreText");
const guessForm = document.getElementById("guessForm");
const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const restartBtn = document.getElementById("restartBtn");
const feedbackBox = document.getElementById("feedbackBox");
const historyList = document.getElementById("historyList");
const guessCount = document.getElementById("guessCount");

function getRandomNumber(max) {
  return Math.floor(Math.random() * max) + 1;
}

function setFeedback(message, type) {
  feedbackBox.textContent = message;
  feedbackBox.className = `feedback-box ${type}`;
}

function updateStatsUI() {
  const config = LEVELS[currentLevel];
  rangeText.textContent = config.label;
  attemptsText.textContent = attemptsLeft;
  bestScoreText.textContent = bestScores[currentLevel] !== null ? `${bestScores[currentLevel]} tries` : "--";
  guessCount.textContent = `${guessesMade.length} ${guessesMade.length === 1 ? "guess" : "guesses"}`;
  guessInput.max = config.max;
}

function renderHistory() {
  historyList.innerHTML = "";
  guessesMade.forEach((item) => {
    const chip = document.createElement("span");
    chip.className = `guess-chip ${item.hint}`;
    chip.textContent = `${item.value} (${item.hint === "low" ? "↑ Low" : "↓ High"})`;
    historyList.appendChild(chip);
  });
}

function startNewGame() {
  const config = LEVELS[currentLevel];
  secretNumber = getRandomNumber(config.max);
  attemptsLeft = config.attempts;
  guessesMade = [];
  gameOver = false;

  guessInput.value = "";
  guessInput.disabled = false;
  guessBtn.disabled = false;
  historyList.innerHTML = "";

  updateStatsUI();
  setFeedback(
    `New ${currentLevel.toUpperCase()} game started! Guess a number from 1 to ${config.max}.`,
    "neutral"
  );
  guessInput.focus();
}

function finishGame(isWin) {
  gameOver = true;
  guessInput.disabled = true;
  guessBtn.disabled = true;

  if (isWin) {
    const triesUsed = LEVELS[currentLevel].attempts - attemptsLeft;
    if (bestScores[currentLevel] === null || triesUsed < bestScores[currentLevel]) {
      bestScores[currentLevel] = triesUsed;
    }
    updateStatsUI();
    setFeedback(
      `🎉 Awesome! You guessed ${secretNumber} in ${triesUsed} ${triesUsed === 1 ? "try" : "tries"}!`,
      "win"
    );
  } else {
    setFeedback(`💥 Out of attempts! The secret number was ${secretNumber}.`, "lose");
  }
}

function handleGuessSubmit(event) {
  event.preventDefault();
  if (gameOver) return;

  const maxAllowed = LEVELS[currentLevel].max;
  const userGuess = Number(guessInput.value);

  if (!Number.isInteger(userGuess) || userGuess < 1 || userGuess > maxAllowed) {
    setFeedback(`⚠️ Please enter a whole number between 1 and ${maxAllowed}.`, "neutral");
    guessInput.value = "";
    guessInput.focus();
    return;
  }

  attemptsLeft -= 1;

  if (userGuess === secretNumber) {
    updateStatsUI();
    finishGame(true);
    return;
  }

  const hint = userGuess < secretNumber ? "low" : "high";
  guessesMade.push({ value: userGuess, hint });
  updateStatsUI();
  renderHistory();

  if (attemptsLeft === 0) {
    finishGame(false);
    return;
  }

  setFeedback(
    hint === "low"
      ? `📉 Too low! Try a higher number (${attemptsLeft} left).`
      : `📈 Too high! Try a lower number (${attemptsLeft} left).`,
    hint
  );

  guessInput.value = "";
  guessInput.focus();
}

// Event Listeners
levelButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    levelButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentLevel = btn.dataset.level;
    startNewGame();
  });
});

guessForm.addEventListener("submit", handleGuessSubmit);
restartBtn.addEventListener("click", startNewGame);

// Initialize
startNewGame();