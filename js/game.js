// ─── Game Engine ──────────────────────────────────────────────────────────────

const QUESTIONS_PER_LEVEL = 10;
const MAX_LIVES = 3;
const POINTS_PER_CORRECT = 100;
const STREAK_BONUS = 50; // added every 3-streak

let state = {
  lives: MAX_LIVES,
  score: 0,
  levelIndex: 0,  // 0-based index into LEVEL_CONFIGS
  questionsInLevel: 0,
  streak: 0,
  angleMode: 'degrees',  // 'degrees' | 'radians' | 'both'
  currentQuestion: null,
  timerInterval: null,
  timeLeft: 0,
  totalTime: 0,
  running: false,
  waitingForNext: false,
};

let keyboard;

// ─── Init ─────────────────────────────────────────────────────────────────────
function initGame(angleMode) {
  state.lives = MAX_LIVES;
  state.score = 0;
  state.levelIndex = 0;
  state.questionsInLevel = 0;
  state.streak = 0;
  state.angleMode = angleMode || 'degrees';
  state.running = true;
  state.waitingForNext = false;

  // Render keyboard
  MathKeyboard.render('keyboard-container');

  const displayEl = document.getElementById('answer-display');
  keyboard = new MathKeyboard(displayEl, handleSubmit);
  keyboard.attachTo('keyboard-container');

  updateHUD();
  hideGameOver();
  hideModal();
  nextQuestion();
}

// ─── Question Flow ────────────────────────────────────────────────────────────
function nextQuestion() {
  if (!state.running) return;
  state.currentQuestion = generateQuestion(state.levelIndex, state.angleMode);
  state.waitingForNext = false;

  keyboard.reset();
  renderQuestion(state.currentQuestion);
  startTimer();
  updateLevelProgress();
}

function renderQuestion(q) {
  const angleEl  = document.getElementById('question-angle');
  const funcEl   = document.getElementById('question-func');
  const answerEl = document.getElementById('answer-display');

  if (typeof katex !== 'undefined') {
    const angleTex = toLatex(q.displayAngle);
    katex.render(angleTex, angleEl, { throwOnError: false, displayMode: true });
    katex.render(
      `\\text{Find: }\\${q.func}\\!\\left(${angleTex}\\right) = {?}`,
      funcEl,
      { throwOnError: false }
    );
  } else {
    angleEl.textContent = q.displayAngle;
    funcEl.innerHTML = `Find: <span class="func-name">${q.func}</span>(${q.displayAngle}) = ?`;
  }

  answerEl.innerHTML = '<span style="opacity:0.3">▮</span>';
  answerEl.className = 'answer-display empty';
}

// ─── Timer ────────────────────────────────────────────────────────────────────
function startTimer() {
  clearInterval(state.timerInterval);
  const cfg = LEVEL_CONFIGS[Math.min(state.levelIndex, 9)];
  state.totalTime = cfg.time;
  state.timeLeft = cfg.time;
  updateTimerBar();

  state.timerInterval = setInterval(() => {
    state.timeLeft -= 0.1;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      updateTimerBar();
      clearInterval(state.timerInterval);
      handleTimeout();
    } else {
      updateTimerBar();
    }
  }, 100);
}

function updateTimerBar() {
  const bar = document.getElementById('timer-bar');
  const pct = Math.max(0, state.timeLeft / state.totalTime) * 100;
  bar.style.width = pct + '%';
  bar.className = 'timer-bar';
  if (pct < 30) bar.classList.add('danger');
  else if (pct < 60) bar.classList.add('warn');

  // Also update numeric display if present
  const numEl = document.getElementById('timer-num');
  if (numEl) numEl.textContent = Math.ceil(state.timeLeft) + 's';
}

function handleTimeout() {
  if (state.waitingForNext) return;
  loseLife();
  showExplanation(state.currentQuestion, () => nextQuestion());
}

// ─── Answer Handling ──────────────────────────────────────────────────────────
function handleSubmit(value) {
  if (!state.running || state.waitingForNext) return;
  clearInterval(state.timerInterval);

  const correct = checkAnswer(value, state.currentQuestion.answer);

  if (correct) {
    keyboard.flashCorrect();
    state.score += POINTS_PER_CORRECT;
    state.streak++;
    if (state.streak > 0 && state.streak % 3 === 0) {
      state.score += STREAK_BONUS;
      showStreakBadge(state.streak);
    }
    state.questionsInLevel++;
    updateHUD();

    if (state.questionsInLevel >= QUESTIONS_PER_LEVEL) {
      // Level up!
      levelUp();
    } else {
      state.waitingForNext = true;
      setTimeout(() => nextQuestion(), 600);
    }
  } else {
    keyboard.flashWrong();
    state.streak = 0;
    loseLife();
    showExplanation(state.currentQuestion, () => nextQuestion());
    updateHUD();
  }
}

function loseLife() {
  state.lives--;
  updateHUD();
  if (state.lives <= 0) {
    state.running = false;
    clearInterval(state.timerInterval);
    // Let any current explanation finish, then show game over
    setTimeout(() => triggerGameOver(), state.lives <= 0 ? 3200 : 0);
  }
}

// ─── Level Progression ────────────────────────────────────────────────────────
function levelUp() {
  state.levelIndex = Math.min(state.levelIndex + 1, LEVEL_CONFIGS.length - 1);
  state.questionsInLevel = 0;
  state.waitingForNext = true;

  showLevelUpBanner(state.levelIndex + 1, () => {
    nextQuestion();
  });
}

function showLevelUpBanner(newLevel, cb) {
  const banner = document.getElementById('level-up-banner');
  if (!banner) { cb(); return; }
  banner.textContent = `LEVEL ${newLevel}!`;
  banner.classList.remove('hidden');
  banner.classList.add('bounce-in');
  setTimeout(() => {
    banner.classList.add('hidden');
    banner.classList.remove('bounce-in');
    cb();
  }, 1500);
}

// ─── HUD Updates ──────────────────────────────────────────────────────────────
function updateHUD() {
  // Lives
  const livesEl = document.getElementById('lives-display');
  if (livesEl) {
    livesEl.innerHTML = '';
    for (let i = 0; i < MAX_LIVES; i++) {
      const span = document.createElement('span');
      span.className = 'life-icon' + (i >= state.lives ? ' lost' : '');
      span.textContent = '♥';
      livesEl.appendChild(span);
    }
  }

  // Score
  const scoreEl = document.getElementById('score-display');
  if (scoreEl) scoreEl.textContent = 'Score: ' + String(state.score).padStart(6, '0');

  // Level
  const levelEl = document.getElementById('level-display');
  if (levelEl) levelEl.textContent = `LVL ${state.levelIndex + 1}`;
}

function updateLevelProgress() {
  const fill = document.getElementById('level-progress-fill');
  const label = document.getElementById('level-progress-label');
  if (fill) fill.style.width = (state.questionsInLevel / QUESTIONS_PER_LEVEL * 100) + '%';
  if (label) label.textContent = `${state.questionsInLevel}/${QUESTIONS_PER_LEVEL}`;
}

function showStreakBadge(streak) {
  const el = document.getElementById('streak-badge');
  if (!el) return;
  el.textContent = `🔥 ${streak} streak! +${STREAK_BONUS} pts`;
  el.classList.add('active');
  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => el.classList.remove('active'), 2000);
}

// ─── Explanation Modal ────────────────────────────────────────────────────────
function showExplanation(question, onDismiss) {
  if (!state.running && state.lives > 0) return;
  state.waitingForNext = true;
  const modal = document.getElementById('explanation-modal');
  const overlay = document.getElementById('modal-overlay');
  const container = document.getElementById('explanation-content');

  buildExplanation(question, container);
  overlay.classList.add('active');

  const dismissBtn = document.getElementById('dismiss-explanation');
  const handler = () => {
    overlay.classList.remove('active');
    dismissBtn.removeEventListener('click', handler);
    if (state.lives > 0) {
      onDismiss();
    }
  };
  dismissBtn.addEventListener('click', handler);

}

function hideModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('active');
}

// ─── Game Over ────────────────────────────────────────────────────────────────
async function triggerGameOver() {
  hideModal();
  const el = document.getElementById('game-over');
  if (!el) return;
  document.getElementById('final-score').textContent = state.score;
  document.getElementById('final-level').textContent = `Reached Level ${state.levelIndex + 1}`;
  el.classList.add('active');

  // Fetch current scores to decide whether this is a top-10 entry
  const scores = await fetchHighScores();
  const minScore = scores.length < 10 ? -1 : scores[scores.length - 1].score;
  if (state.score > minScore || scores.length < 10) {
    document.getElementById('name-entry-section').classList.remove('hidden');
    setupNameEntry();
  } else {
    document.getElementById('name-entry-section').classList.add('hidden');
  }

  renderHighScores();
}

function hideGameOver() {
  const el = document.getElementById('game-over');
  if (el) el.classList.remove('active');
}

// ─── High Score System (Firebase Realtime Database) ──────────────────────────
const FB_URL = 'https://unit-circle-quest-default-rtdb.firebaseio.com/scores';

async function fetchHighScores() {
  try {
    const res = await fetch(`${FB_URL}.json`);
    const data = await res.json();
    if (!data) return [];
    // Firebase returns an object keyed by push ID — convert to array
    return Object.values(data)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch {
    return [];
  }
}

async function addHighScore(name, score, level) {
  const entry = {
    name: name.toUpperCase().slice(0, 3).padEnd(3, '_'),
    score,
    level,
    ts: Date.now()
  };
  try {
    await fetch(`${FB_URL}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
  } catch {
    // silently fail — score just won't appear on leaderboard
  }
}

async function renderHighScores(tableId = 'highscore-table') {
  const tbl = document.getElementById(tableId);
  if (!tbl) return;
  tbl.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-dim)">Loading...</td></tr>';
  const scores = await fetchHighScores();
  if (scores.length === 0) {
    tbl.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-dim)">No scores yet!</td></tr>';
    return;
  }
  tbl.innerHTML = scores.map((s, i) =>
    `<tr>
      <td class="rank-col">${i + 1}.</td>
      <td>${s.name}</td>
      <td style="color:var(--neon-gold);font-family:'Courier New',monospace">${String(s.score).padStart(6,'0')}</td>
      <td style="color:var(--text-dim)">Lvl ${s.level}</td>
    </tr>`
  ).join('');
}

function setupNameEntry() {
  const inputs = document.querySelectorAll('.name-char');
  inputs.forEach((inp, i) => {
    inp.value = '';
    inp.addEventListener('input', (e) => {
      inp.value = inp.value.slice(-1).toUpperCase();
      if (inp.value && i < inputs.length - 1) inputs[i + 1].focus();
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i - 1].focus();
    });
  });
  inputs[0].focus();

  const saveBtn = document.getElementById('save-score-btn');
  if (saveBtn) {
    saveBtn.onclick = async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      const name = Array.from(inputs).map(i => i.value || '_').join('');
      await addHighScore(name, state.score, state.levelIndex + 1);
      document.getElementById('name-entry-section').classList.add('hidden');
      renderHighScores();
    };
  }
}

// ─── Boot ──────────────────────────────────────────────────────────────────────
// Called from HTML once DOM is ready
function bootGame() {
  // Read angle mode from URL params or localStorage
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode') || localStorage.getItem('ucg_mode') || 'degrees';
  initGame(mode);
}
