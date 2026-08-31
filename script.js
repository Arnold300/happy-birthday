/* =========================================================================
   APP LOGIC
   All content/customization lives in config.js — this file just runs the
   flow: (optional date lock) -> PIN -> quiz -> sudoku -> reveal.
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  buildStars();
  buildBackgroundCollage();
  initFlow();
});

function buildBackgroundCollage() {
  const wrap = document.getElementById('bgCollage');
  const src = CONFIG.teaserCollageImage;
  if (!src) return;

  // Reuses your single Canva collage as a full-bleed, blurred/dimmed
  // background — no separate photo set needed.
  wrap.innerHTML = '';
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  img.className = 'bg-collage-img';
  img.onerror = () => { img.style.display = 'none'; };
  wrap.appendChild(img);
}

// Screens that should show the faded photo-collage background
const COLLAGE_SCREENS = new Set(['screen-teaser', 'screen-quiz', 'screen-sudoku']);

function buildStars() {
  const wrap = document.getElementById('bgStars');
  const starStyles = ['star--gold', 'star--pink', 'star--purple', 'star--dust'];

  for (let i = 0; i < 120; i++) {
    const s = document.createElement('div');
    const size = (Math.random() * 3.2 + 1.5).toFixed(2) + 'px';
    const tint = starStyles[Math.floor(Math.random() * starStyles.length)];
    const x = Math.random() * 100;
    const y = Math.random() * 100;

    s.className = `star ${tint}`;
    s.style.left = x + 'vw';
    s.style.top = y + 'vh';
    s.style.setProperty('--star-size', size);
    s.style.animationDelay = (Math.random() * 5.8).toFixed(2) + 's';
    s.style.animationDuration = (Math.random() * 2.9 + 2.4).toFixed(2) + 's';

    if (Math.random() > 0.88) {
      s.style.filter = 'blur(0.2px)';
    }
    if (Math.random() > 0.94) {
      s.style.opacity = '1';
      s.style.boxShadow = '0 0 16px rgba(255,255,255,0.95), 0 0 26px rgba(191, 144, 255, 0.8)';
    }

    wrap.appendChild(s);
  }
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(el => el.hidden = true);
  document.getElementById(id).hidden = false;

  const collage = document.getElementById('bgCollage');
  if (collage) collage.classList.toggle('visible', COLLAGE_SCREENS.has(id));
}

/* -------------------------------------------------------------------------
   FLOW ENTRY
   ------------------------------------------------------------------------- */
function initFlow() {
  if (CONFIG.lockUntil) {
    const target = new Date(CONFIG.lockUntil).getTime();
    if (Date.now() < target) {
      showScreen('screen-lock');
      runCountdown(target);
      return;
    }
  }
  showScreen('screen-pin');
  initPinScreen();
}

function runCountdown(target) {
  const dEl = document.getElementById('cd-days');
  const hEl = document.getElementById('cd-hours');
  const mEl = document.getElementById('cd-mins');
  const sEl = document.getElementById('cd-secs');

  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      clearInterval(timer);
      showScreen('screen-pin');
      initPinScreen();
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    dEl.textContent = String(days).padStart(2, '0');
    hEl.textContent = String(hours).padStart(2, '0');
    mEl.textContent = String(mins).padStart(2, '0');
    sEl.textContent = String(secs).padStart(2, '0');
  };
  tick();
  const timer = setInterval(tick, 1000);
}

/* -------------------------------------------------------------------------
   SCREEN 1: PIN
   ------------------------------------------------------------------------- */
async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function initPinScreen() {
  const dotsWrap = document.getElementById('pinDots');
  const keypad = document.getElementById('keypad');
  const errorText = document.getElementById('pinError');
  const hintText = document.getElementById('pinHint');
  hintText.textContent = CONFIG.pinHint || '';

  let entered = '';

  dotsWrap.innerHTML = '';
  for (let i = 0; i < CONFIG.pinLength; i++) {
    const dot = document.createElement('div');
    dot.className = 'pin-dot';
    dotsWrap.appendChild(dot);
  }

  const renderDots = () => {
    const dots = dotsWrap.querySelectorAll('.pin-dot');
    dots.forEach((d, i) => d.classList.toggle('filled', i < entered.length));
  };

  const shakeDots = () => {
    dotsWrap.classList.add('shake');
    setTimeout(() => dotsWrap.classList.remove('shake'), 400);
  };

  const submit = async () => {
    const hash = await sha256(entered);
    if (hash === CONFIG.pinHash) {
      errorText.textContent = '';
      document.onkeydown = null;
      showScreen('screen-pin-success');
      initPinSuccess();
    } else {
      showWrongPinTease();
      shakeDots();
      entered = '';
      renderDots();
    }
  };

  const pressDigit = (d) => {
    if (entered.length >= CONFIG.pinLength) return;
    entered += d;
    renderDots();
    if (entered.length === CONFIG.pinLength) {
      setTimeout(submit, 150);
    }
  };

  const backspace = () => {
    entered = entered.slice(0, -1);
    renderDots();
  };

  // Build keypad 1-9, backspace, 0
  keypad.innerHTML = '';
  const layout = ['1','2','3','4','5','6','7','8','9','⌫','0',''];
  layout.forEach(k => {
    const btn = document.createElement('button');
    btn.className = 'key';
    btn.type = 'button';
    if (k === '') { btn.style.visibility = 'hidden'; btn.disabled = true; }
    btn.textContent = k;
    btn.addEventListener('click', () => {
      if (k === '⌫') backspace();
      else if (k !== '') pressDigit(k);
    });
    keypad.appendChild(btn);
  });

  // Also allow physical keyboard
  document.onkeydown = (e) => {
    if (document.getElementById('screen-pin').hidden) return;
    if (/^[0-9]$/.test(e.key)) pressDigit(e.key);
    if (e.key === 'Backspace') backspace();
  };
}

function showWrongPinTease() {
  const teases = CONFIG.pinWrongTeases || [];
  if (!teases.length) return;
  const tease = teases[Math.floor(Math.random() * teases.length)];

  const layer = document.getElementById('pinTeaseLayer');
  const bubble = document.createElement('div');
  bubble.className = 'pin-tease';

  if (tease.photo) {
    const img = document.createElement('img');
    img.src = tease.photo;
    img.alt = '';
    img.onerror = () => img.remove();
    bubble.appendChild(img);
  }
  const span = document.createElement('span');
  span.textContent = tease.text;
  bubble.appendChild(span);

  layer.appendChild(bubble);
  setTimeout(() => bubble.remove(), 3000);
}

function initPinSuccess() {
  const headline = document.getElementById('pinSuccessHeadline');
  const btn = document.getElementById('pinSuccessBtn');
  headline.textContent = CONFIG.pinSuccessHeadline || "You've successfully entered the right PIN!";
  btn.textContent = CONFIG.pinSuccessButtonLabel || "Would you love to see what's next??";
  btn.onclick = () => {
    btn.disabled = true;
    startBackgroundAudio();
    celebrateAndAdvance();
  };
}

/* Starts the mashup looping at a low, faded volume. Called from a real
   click handler so autoplay restrictions don't block it. Plays through
   every screen from here on (teaser, quiz, sudoku, reveal). */
function startBackgroundAudio() {
  if (!CONFIG.audioSrc) return;
  const audio = document.getElementById('bgAudio');
  audio.src = CONFIG.audioSrc;
  audio.loop = true;
  audio.volume = CONFIG.audioVolume ?? 0.32;
  audio.play().catch(() => {}); // silently ignore if the browser still blocks it
}

function celebrateAndAdvance() {
  const canvas = document.getElementById('fireworksCanvas');
  const duration = CONFIG.pinFireworksDurationMs ?? 6000;
  canvas.classList.add('active');
  const stop = runFireworks(canvas, duration);
  setTimeout(() => {
    stop();
    canvas.classList.remove('active');
    showScreen('screen-teaser');
    initTeaser();
  }, duration);
}

/* -------------------------------------------------------------------------
   SCREEN 1.5: TEASER (collage reveal + mashup)
   ------------------------------------------------------------------------- */
function initTeaser() {
  const photo = document.getElementById('teaserPhoto');
  const text = document.getElementById('teaserText');
  const promptLayer = document.getElementById('teaserPromptLayer');
  const promptText = document.getElementById('teaserPromptText');
  const yesBtn = document.getElementById('teaserYesBtn');
  const yessBtn = document.getElementById('teaserYessBtn');

  photo.src = CONFIG.teaserCollageImage || '';
  photo.onerror = () => { photo.style.display = 'none'; };
  text.textContent = CONFIG.teaserText || '';
  promptText.textContent = CONFIG.teaserPromptText || 'Would you fancy a round of fun and rapid questions?';

  promptLayer.hidden = false;
  promptLayer.classList.remove('visible');
  const revealDelay = CONFIG.teaserPromptDelayMs ?? 8000;
  setTimeout(() => {
    promptLayer.classList.add('visible');
  }, revealDelay);

  const goToQuiz = () => {
    showScreen('screen-quiz');
    initQuiz();
  };
  yesBtn.onclick = goToQuiz;
  yessBtn.onclick = goToQuiz;
}

/* Hyper-realistic particle fireworks: rockets launch from the bottom with
   trails, then burst into "peony" (sharp) or "willow" (drooping) sparks
   with glow, drag, gravity, and motion-blur trailing. Colors pulled from
   the site palette family. Runs for `duration` ms, returns a stop() fn. */
function runFireworks(canvas, duration) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const resize = () => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const palettes = [
    ['#FFD37A', '#FFB13C'], // gold family
    ['#FF8FA3', '#FF5D7A'], // rose family
    ['#7FE8C4', '#3AC79A'], // teal family
    ['#FFF3D6', '#FFE9B0'], // parchment family
  ];

  let rockets = [];
  let sparks = [];
  let running = true;
  const startTime = performance.now();
  let lastLaunch = -Infinity;
  const launchEvery = 700;

  function spawnRocket() {
    const x = window.innerWidth * (0.15 + Math.random() * 0.7);
    const targetY = window.innerHeight * (0.12 + Math.random() * 0.3);
    rockets.push({ x, y: window.innerHeight, targetY, vy: -(6.5 + Math.random() * 1.5), trail: [] });
  }

  function explode(x, y) {
    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    const type = Math.random() < 0.35 ? 'willow' : 'peony';
    const count = type === 'willow' ? 55 : 70;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.15;
      const speed = type === 'willow' ? 1.2 + Math.random() * 1.6 : 2.2 + Math.random() * 2.6;
      sparks.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: type === 'willow' ? 0.006 + Math.random() * 0.004 : 0.012 + Math.random() * 0.008,
        drag: type === 'willow' ? 0.988 : 0.965,
        gravity: type === 'willow' ? 0.045 : 0.028,
        size: 1.4 + Math.random() * 1.4,
        color: palette[Math.floor(Math.random() * palette.length)],
        flicker: Math.random() < 0.3,
        trail: [],
      });
    }
    // bright flash at the burst origin
    sparks.push({ x, y, vx: 0, vy: 0, life: 1, decay: 0.08, drag: 1, gravity: 0, size: 22, color: '#FFFFFF', flicker: false, trail: [], isFlash: true });
  }

  function tick(now) {
    if (!running) return;

    // translucent fill instead of full clear -> soft motion-blur trails
    ctx.fillStyle = 'rgba(11,13,28,0.22)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    if (now - lastLaunch > launchEvery && now - startTime < duration - 700) {
      spawnRocket();
      lastLaunch = now;
    }

    rockets.forEach(r => {
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 8) r.trail.shift();
      r.y += r.vy;
      r.vy += 0.03;
    });
    rockets.forEach(r => {
      ctx.strokeStyle = 'rgba(255,233,176,0.5)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      r.trail.forEach((p, i) => { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
      ctx.stroke();
      ctx.fillStyle = '#FFE9B0';
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    rockets.filter(r => r.y <= r.targetY || r.vy >= 0).forEach(r => explode(r.x, r.y));
    rockets = rockets.filter(r => r.y > r.targetY && r.vy < 0);

    sparks.forEach(s => {
      if (!s.isFlash) {
        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > 5) s.trail.shift();
      }
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= s.drag;
      s.vy *= s.drag;
      s.vy += s.gravity;
      s.life -= s.decay;
    });
    sparks = sparks.filter(s => s.life > 0);

    sparks.forEach(s => {
      const alpha = s.flicker ? Math.max(s.life * (0.4 + Math.random() * 0.6), 0) : Math.max(s.life, 0);
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = s.isFlash ? 30 : 8;
      ctx.shadowColor = s.color;

      if (!s.isFlash && s.trail.length > 1) {
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size * 0.6;
        ctx.beginPath();
        s.trail.forEach((p, i) => { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }

      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  return function stop() {
    running = false;
    window.removeEventListener('resize', resize);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}

/* -------------------------------------------------------------------------
   SCREEN 2: QUIZ
   ------------------------------------------------------------------------- */
function initQuiz() {
  let index = 0;
  const answers = []; // { question, answer } pairs, shown on the summary screen

  const progressEl = document.getElementById('quizProgress');
  const questionEl = document.getElementById('quizQuestion');
  const bodyEl = document.getElementById('quizBody');
  const reactionEl = document.getElementById('quizReaction');
  const nextBtn = document.getElementById('quizNextBtn');

  function renderQuestion() {
    const q = CONFIG.quiz[index];
    progressEl.textContent = `question ${index + 1} of ${CONFIG.quiz.length}`;
    questionEl.textContent = q.question;
    reactionEl.textContent = '';
    nextBtn.hidden = true;
    bodyEl.innerHTML = '';

    if (q.image) {
      const img = document.createElement('img');
      img.src = q.image;
      img.alt = '';
      img.className = 'quiz-photo';
      img.onerror = () => { img.style.display = 'none'; };
      bodyEl.appendChild(img);
    }

    function renderTextInput() {
      bodyEl.innerHTML = '';
      if (q.image) {
        const img = document.createElement('img');
        img.src = q.image;
        img.alt = '';
        img.className = 'quiz-photo';
        img.onerror = () => { img.style.display = 'none'; };
        bodyEl.appendChild(img);
      }
      const input = document.createElement('input');
      input.className = 'text-input';
      input.type = 'text';
      input.placeholder = 'Type your answer...';
      const submitBtn = document.createElement('button');
      submitBtn.className = 'btn-primary';
      submitBtn.type = 'button';
      submitBtn.textContent = 'Submit';
      submitBtn.style.marginTop = '10px';
      submitBtn.addEventListener('click', () => {
        const val = input.value.trim();
        if (!val) {
          reactionEl.textContent = 'Please answer this one first';
          input.focus();
          return;
        }
        input.disabled = true;
        submitBtn.disabled = true;
        answers.push({ question: q.question, answer: val });
        reactionEl.textContent = pick(['noted 📝', 'love that for you', 'got it!', 'saving that one', 'interesting...']);
        nextBtn.hidden = false;
      });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitBtn.click(); });
      bodyEl.appendChild(input);
      bodyEl.appendChild(submitBtn);
      setTimeout(() => input.focus(), 50);
    }

    if (q.options && q.options.length) {
      // Multiple-choice — just records whichever she picks, no right/wrong.
      q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.type = 'button';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          const allBtns = bodyEl.querySelectorAll('.choice-btn');
          allBtns.forEach(b => { b.disabled = true; });
          btn.classList.add('selected');
          answers.push({ question: q.question, answer: opt });
          reactionEl.textContent = pick(['noted 📝', 'love that for you', 'got it!', 'saving that one', 'interesting...']);
          nextBtn.hidden = false;
        });
        bodyEl.appendChild(btn);
      });

      // Optional "Other" option — switches this question into free-text
      // mode so she can type her own answer instead of picking yours.
      if (q.allowOther) {
        const otherBtn = document.createElement('button');
        otherBtn.className = 'choice-btn';
        otherBtn.type = 'button';
        otherBtn.textContent = q.otherLabel || 'Other (type your own)';
        otherBtn.addEventListener('click', renderTextInput);
        bodyEl.appendChild(otherBtn);
      }
    } else {
      // Free text — she types her own answer.
      renderTextInput();
    }
  }

  nextBtn.addEventListener('click', () => {
    index++;
    if (index < CONFIG.quiz.length) {
      renderQuestion();
    } else {
      showQaSummary(answers);
    }
  });

  renderQuestion();
}

/* -------------------------------------------------------------------------
   SCREEN 2.5: Q&A SUMMARY (her answers, screenshot-friendly)
   ------------------------------------------------------------------------- */
function showQaSummary(answers) {
  const list = document.getElementById('qaList');
  const headline = document.getElementById('qaSummaryHeadline');
  const btn = document.getElementById('qaSummaryBtn');

  headline.textContent = CONFIG.qaSummaryHeadline || "Here's what you said";
  btn.textContent = CONFIG.qaSummaryButtonLabel || 'Continue';

  list.innerHTML = '';
  answers.forEach(a => {
    const item = document.createElement('div');
    item.className = 'qa-item';
    const q = document.createElement('p');
    q.className = 'qa-question';
    q.textContent = a.question;
    const ans = document.createElement('p');
    ans.className = 'qa-answer';
    ans.textContent = a.answer;
    item.appendChild(q);
    item.appendChild(ans);
    list.appendChild(item);
  });

  showScreen('screen-qa-summary');
  btn.onclick = () => {
    // Rapid-fire round is currently skipped — going straight to the sudoku.
    // To bring it back later, swap the two lines below for:
    //   showScreen('screen-quiz'); startRapidFireIntro();
    showScreen('screen-sudoku');
    initSudoku();
  };
}

function startRapidFireIntro() {
  const progressEl = document.getElementById('quizProgress');
  const questionEl = document.getElementById('quizQuestion');
  const bodyEl = document.getElementById('quizBody');
  const reactionEl = document.getElementById('quizReaction');
  const nextBtn = document.getElementById('quizNextBtn');

  progressEl.textContent = 'bonus round';
  questionEl.textContent = CONFIG.rapidFireIntro || 'Rapid fire round!';
  bodyEl.innerHTML = '';
  reactionEl.textContent = '';
  nextBtn.hidden = false;
  nextBtn.textContent = CONFIG.rapidFireStartLabel || 'start';
  nextBtn.onclick = () => {
    nextBtn.onclick = null;
    runRapidFire(0);
  };
}

function runRapidFire(rIndex) {
  const progressEl = document.getElementById('quizProgress');
  const questionEl = document.getElementById('quizQuestion');
  const bodyEl = document.getElementById('quizBody');
  const reactionEl = document.getElementById('quizReaction');
  const nextBtn = document.getElementById('quizNextBtn');

  const items = CONFIG.rapidFireRound || [];
  if (rIndex >= items.length) {
    showScreen('screen-sudoku');
    initSudoku();
    return;
  }

  const item = items[rIndex];
  progressEl.textContent = `food photo ${rIndex + 1} of ${items.length}`;
  questionEl.textContent = item.question || 'What date is this from?';
  reactionEl.textContent = '';
  nextBtn.hidden = true;
  nextBtn.onclick = null;
  bodyEl.innerHTML = '';

  if (item.image) {
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = '';
    img.className = 'quiz-photo';
    img.onerror = () => { img.style.display = 'none'; };
    bodyEl.appendChild(img);
  }

  (item.options || []).forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.type = 'button';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      const isCorrect = opt === item.answer;
      const allBtns = bodyEl.querySelectorAll('.choice-btn');
      allBtns.forEach(b => {
        b.disabled = true;
        if (b === btn) b.classList.add(isCorrect ? 'correct' : 'incorrect');
      });
      reactionEl.textContent = isCorrect
        ? pick(['yes!! you remembered', 'correct — impressive', 'nailed it'])
        : pick(['nope, guess again next time', 'so close (not really)', 'wrong but A for effort']);
      setTimeout(() => runRapidFire(rIndex + 1), CONFIG.rapidFireAutoAdvanceMs || 1100);
    });
    bodyEl.appendChild(btn);
  });
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* -------------------------------------------------------------------------
   SCREEN 3: SUDOKU (4x4)
   ------------------------------------------------------------------------- */
/* Generates a genuinely valid, randomized 6x6 sudoku solution (2 rows x
   3 cols boxes) via backtracking. A different valid puzzle every time. */
function generateSudokuSolution() {
  const size = 6, boxRows = 2, boxCols = 3;
  const grid = Array.from({ length: size }, () => Array(size).fill(0));

  function isValid(r, c, val) {
    for (let i = 0; i < size; i++) {
      if (grid[r][i] === val) return false;
      if (grid[i][c] === val) return false;
    }
    const br = Math.floor(r / boxRows) * boxRows;
    const bc = Math.floor(c / boxCols) * boxCols;
    for (let i = br; i < br + boxRows; i++) {
      for (let j = bc; j < bc + boxCols; j++) {
        if (grid[i][j] === val) return false;
      }
    }
    return true;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function fill(pos) {
    if (pos === size * size) return true;
    const r = Math.floor(pos / size), c = pos % size;
    for (const val of shuffle([1, 2, 3, 4, 5, 6])) {
      if (isValid(r, c, val)) {
        grid[r][c] = val;
        if (fill(pos + 1)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  }

  fill(0);
  return grid;
}

function initSudoku() {
  const grid = document.getElementById('sudokuGrid');
  const checkBtn = document.getElementById('sudokuCheckBtn');
  const skipBtn = document.getElementById('sudokuSkipBtn');
  const errorEl = document.getElementById('sudokuError');
  const teaseBubble = document.getElementById('teaseBubble');
  const photos = CONFIG.sudokuPhotos || [];

  // Uses your own solved grid if you've provided one in config.js
  // (CONFIG.sudokuSolution), otherwise generates a fresh valid random one
  // every time. Values 1-6 map to positions in CONFIG.sudokuPhotos.
  const solution = CONFIG.sudokuSolution || generateSudokuSolution();

  // Medium difficulty by default — fewer givens = harder. Uses your own
  // exact starting layout if provided (CONFIG.sudokuPuzzle, 0 = blank),
  // otherwise picks that many random cells to reveal.
  const givensCount = CONFIG.sudokuGivensCount || 14;
  const givens = new Set();
  if (CONFIG.sudokuPuzzle) {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (CONFIG.sudokuPuzzle[r][c] !== 0) givens.add(r * 6 + c);
      }
    }
  } else {
    while (givens.size < givensCount) {
      givens.add(Math.floor(Math.random() * 36));
    }
  }

  grid.innerHTML = '';
  const cells = []; // { el, value } — value 0 = empty
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const idx = r * 6 + c;
      const cellData = { el: null, value: 0 };
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sudoku-cell';
      if (c % 3 === 2) btn.classList.add('box-right');
      if (r % 2 === 1) btn.classList.add('box-bottom');

      if (givens.has(idx)) {
        const val = solution[r][c];
        cellData.value = val;
        btn.classList.add('given');
        btn.style.backgroundImage = photos[val - 1] ? `url(${photos[val - 1]})` : 'none';
        btn.disabled = true;
      } else {
        btn.classList.add('cell-empty');
        btn.addEventListener('click', () => {
          cellData.value = (cellData.value + 1) % 7; // cycles 0(empty)->1->2->...->6->0
          btn.style.backgroundImage = cellData.value && photos[cellData.value - 1] ? `url(${photos[cellData.value - 1]})` : 'none';
          btn.classList.toggle('cell-empty', cellData.value === 0);
          btn.classList.remove('wrong');
        });
        // Long-press / right-click clears the cell back to empty
        btn.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          cellData.value = 0;
          btn.style.backgroundImage = 'none';
          btn.classList.add('cell-empty');
          btn.classList.remove('wrong');
        });
      }
      cellData.el = btn;
      grid.appendChild(btn);
      cells.push(cellData);
    }
  }

  checkBtn.addEventListener('click', () => {
    let allFilled = true;
    let allCorrect = true;
    cells.forEach((cell, i) => {
      const r = Math.floor(i / 6), c = i % 6;
      if (!cell.value) allFilled = false;
      const isCorrect = cell.value === solution[r][c];
      cell.el.classList.toggle('wrong', cell.value !== 0 && !isCorrect);
      if (!isCorrect) allCorrect = false;
    });

    if (!allFilled) {
      errorEl.textContent = 'Fill in every square first (tap to cycle through her photos).';
      return;
    }
    if (allCorrect) {
      errorEl.textContent = '';
      clearTimeout(teaseTimers);
      teaseBubble.hidden = true;
      setTimeout(() => {
        showScreen('screen-congrats');
        initCongrats();
      }, 150);
    } else {
      errorEl.textContent = 'Not quite — the highlighted squares are off.';
    }
  });

  skipBtn.addEventListener('click', () => {
    errorEl.textContent = '';
    clearTimeout(teaseTimers);
    teaseBubble.hidden = true;
    setTimeout(() => {
      showScreen('screen-congrats');
      initCongrats();
    }, 150);
  });

  // --- Teasing pop-ups ---
  const startTime = Date.now();
  const shownTeases = new Set();
  let teaseTimers;

  function checkTeases() {
    const elapsed = (Date.now() - startTime) / 1000;
    const due = CONFIG.sudokuTeases
      .filter(t => elapsed >= t.afterSeconds && !shownTeases.has(t.afterSeconds));
    if (due.length) {
      const t = due[0];
      shownTeases.add(t.afterSeconds);
      teaseBubble.textContent = t.text;
      teaseBubble.hidden = false;
      setTimeout(() => { teaseBubble.hidden = true; }, 3200);
    }
    teaseTimers = setTimeout(checkTeases, 1000);
  }
  checkTeases();
}

/* -------------------------------------------------------------------------
   SCREEN 3.5: CONGRATS (transition between sudoku win and the reveal)
   ------------------------------------------------------------------------- */
function initCongrats() {
  const eyebrow = document.getElementById('congratsEyebrow');
  const headline = document.getElementById('congratsMessage');
  const btnLayer = document.getElementById('congratsBtnLayer');
  const btn = document.getElementById('congratsBtn');

  eyebrow.textContent = CONFIG.congratsEyebrow || 'Congratulations to my Smartie';
  headline.textContent = CONFIG.sudokuWinMessage || "You've now unlocked your birthday message";
  btn.textContent = CONFIG.congratsButtonLabel || 'Reveal Card';

  btnLayer.hidden = false;
  btnLayer.classList.remove('visible');
  const delay = CONFIG.congratsButtonDelayMs ?? 3000;
  setTimeout(() => {
    btnLayer.classList.add('visible');
  }, delay);

  const canvas = document.getElementById('congratsCanvas');
  canvas.classList.add('active');
  const stop = runFireworks(canvas, 2400);
  setTimeout(() => { stop(); canvas.classList.remove('active'); }, 2400);

  btn.onclick = () => {
    showScreen('screen-reveal');
    initReveal();
  };
}

/* -------------------------------------------------------------------------
   SCREEN 4: REVEAL
   ------------------------------------------------------------------------- */
function initReveal() {
  document.getElementById('revealName').textContent = CONFIG.recipientName || '';
  document.getElementById('revealHeadline').textContent = CONFIG.revealHeadline || 'Happy Birthday!';

  const collage = document.getElementById('collage');
  collage.innerHTML = '';
  collage.style.display = 'none';

  const messageCard = document.getElementById('messageCard');
  messageCard.innerHTML = '';

  const grain = document.createElement('div');
  grain.className = 'paper-grain';
  messageCard.appendChild(grain);

  const creases = document.createElement('div');
  creases.className = 'paper-creases';
  messageCard.appendChild(creases);

  const twine = document.createElement('div');
  twine.className = 'message-twine';
  messageCard.appendChild(twine);

  const flower = document.createElement('div');
  flower.className = 'dried-flower';
  for (let i = 0; i < 8; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.style.transform = `rotate(${i * 45}deg) translateY(-18px)`;
    flower.appendChild(petal);
  }
  const center = document.createElement('span');
  center.className = 'flower-center';
  flower.appendChild(center);
  messageCard.appendChild(flower);

  const seal = document.createElement('div');
  seal.className = 'wax-seal';
  seal.textContent = CONFIG.waxSealText || '❤';
  messageCard.appendChild(seal);

  (CONFIG.message || []).forEach(line => {
    const p = document.createElement('p');
    p.textContent = line;
    messageCard.appendChild(p);
  });

  launchConfetti();
}

function launchConfetti() {
  const layer = document.getElementById('confettiLayer');
  const colors = ['#D4A62A', '#E8A0A0', '#2C5F5A', '#F6EFE1'];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (3 + Math.random() * 2.5) + 's';
    piece.style.animationDelay = (Math.random() * 1.5) + 's';
    layer.appendChild(piece);
  }
  setTimeout(() => { layer.innerHTML = ''; }, 7000);
}
