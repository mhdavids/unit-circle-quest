// ─── Math Keyboard ────────────────────────────────────────────────────────────
// Manages keyboard state and renders the on-screen math keyboard.
// State produces a canonical answer string like "√3/2", "-2√3/3", "undefined".

class MathKeyboard {
  constructor(displayEl, onSubmit) {
    this.displayEl = displayEl;
    this.onSubmit = onSubmit;
    this.reset();
  }

  reset() {
    // State: answer = negative * (whole)(√radical) / denominator  OR  "undefined"
    this.state = {
      isUndefined: false,
      negative: false,
      whole: '',        // e.g. '2' or '' or '1'
      hasRadical: false,
      radical: '',      // content under √ — usually '2' or '3'
      hasDenom: false,
      denom: '',        // denominator digits
    };
    this._updateDisplay();
  }

  // ── Build canonical string from state ──────────────────────────────────────
  buildString() {
    const s = this.state;
    if (s.isUndefined) return 'undefined';

    let result = '';
    if (s.negative) result += '-';

    if (s.hasRadical) {
      result += s.whole;           // e.g. '' or '2'
      result += '√';
      result += s.radical;         // e.g. '2' or '3'
    } else {
      result += s.whole;
    }

    if (s.hasDenom) {
      result += '/';
      result += s.denom;
    }

    return result;
  }

  // Build LaTeX directly from state for clean partial-state rendering
  _stateToLatex() {
    const s = this.state;
    if (s.isUndefined) return '\\text{undefined}';

    const sign = s.negative ? '-' : '';

    let numPart = '';
    if (s.hasRadical) {
      const coeff = (s.whole && s.whole !== '1') ? s.whole : (s.whole === '1' ? '' : '');
      numPart = coeff + (s.radical ? `\\sqrt{${s.radical}}` : '\\sqrt{\\phantom{0}}');
    } else {
      numPart = s.whole;
    }

    if (s.hasDenom) {
      const den = s.denom || '\\phantom{0}';
      return sign + `\\dfrac{${numPart || '\\phantom{0}'}}{${den}}`;
    }

    return sign + numPart;
  }

  _updateDisplay() {
    const latex = this._stateToLatex();
    this.displayEl.classList.remove('correct', 'wrong');

    if (!latex) {
      this.displayEl.innerHTML = '<span style="opacity:0.3">▮</span>';
      this.displayEl.classList.add('empty');
      return;
    }

    this.displayEl.classList.remove('empty');
    if (typeof katex !== 'undefined') {
      try {
        this.displayEl.innerHTML = katex.renderToString(latex, { throwOnError: false });
      } catch {
        this.displayEl.textContent = this.buildString();
      }
    } else {
      this.displayEl.textContent = this.buildString();
    }
  }

  // ── Which part we're currently editing ───────────────────────────────────
  _editPhase() {
    const s = this.state;
    if (s.isUndefined) return 'undefined';
    if (s.hasDenom) return 'denom';
    if (s.hasRadical && s.radical === '') return 'radical';
    if (s.hasRadical) return 'radical';
    return 'whole';
  }

  // ── Key press handlers ────────────────────────────────────────────────────
  pressDigit(d) {
    const s = this.state;
    if (s.isUndefined) return;
    const phase = this._editPhase();
    if (phase === 'denom') {
      if (s.denom.length < 2) s.denom += d;
    } else if (phase === 'radical') {
      if (s.radical.length < 1) s.radical += d;
    } else {
      if (s.whole.length < 2) s.whole += d;
    }
    this._updateDisplay();
  }

  pressRadical() {
    const s = this.state;
    if (s.isUndefined || s.hasDenom) return;
    s.hasRadical = !s.hasRadical;
    if (!s.hasRadical) s.radical = '';
    this._updateDisplay();
  }

  pressFraction() {
    const s = this.state;
    if (s.isUndefined) return;
    if (!s.whole && !s.hasRadical) return; // nothing to put over fraction yet
    s.hasDenom = true;
    this._updateDisplay();
  }

  pressNegative() {
    const s = this.state;
    if (s.isUndefined) return;
    s.negative = !s.negative;
    this._updateDisplay();
  }

  pressUndefined() {
    this.reset();
    this.state.isUndefined = true;
    this._updateDisplay();
  }

  pressBackspace() {
    const s = this.state;
    if (s.isUndefined) { s.isUndefined = false; this._updateDisplay(); return; }
    if (s.hasDenom && s.denom.length > 0) {
      s.denom = s.denom.slice(0, -1);
    } else if (s.hasDenom && s.denom.length === 0) {
      s.hasDenom = false;
    } else if (s.hasRadical && s.radical.length > 0) {
      s.radical = s.radical.slice(0, -1);
    } else if (s.hasRadical && s.radical.length === 0) {
      s.hasRadical = false;
    } else if (s.whole.length > 0) {
      s.whole = s.whole.slice(0, -1);
    } else if (s.negative) {
      s.negative = false;
    }
    this._updateDisplay();
  }

  pressSubmit() {
    const val = this.buildString();
    if (!val || val === '-') return;
    this.onSubmit(val);
  }

  flashCorrect() {
    this.displayEl.classList.remove('empty', 'wrong');
    this.displayEl.classList.add('correct');
  }

  flashWrong() {
    this.displayEl.classList.remove('empty', 'correct');
    this.displayEl.classList.add('wrong');
    this.displayEl.classList.add('shake');
    setTimeout(() => this.displayEl.classList.remove('shake'), 400);
  }

  // ── Render keyboard HTML ──────────────────────────────────────────────────
  static render(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.className = 'math-keyboard';
    el.innerHTML = `
      <!-- Row 1: digits + √ + backspace -->
      <button class="kbd-btn" data-key="7">7</button>
      <button class="kbd-btn" data-key="8">8</button>
      <button class="kbd-btn" data-key="9">9</button>
      <button class="kbd-btn kbd-special" data-key="sqrt">√</button>
      <button class="kbd-btn kbd-bksp"    data-key="bksp">⌫</button>

      <!-- Row 2: digits + fraction + negate -->
      <button class="kbd-btn" data-key="4">4</button>
      <button class="kbd-btn" data-key="5">5</button>
      <button class="kbd-btn" data-key="6">6</button>
      <button class="kbd-btn kbd-special" data-key="frac">/ ̄</button>
      <button class="kbd-btn kbd-neg"     data-key="neg">±</button>

      <!-- Row 3: digits -->
      <button class="kbd-btn" data-key="1">1</button>
      <button class="kbd-btn" data-key="2">2</button>
      <button class="kbd-btn" data-key="3">3</button>
      <button class="kbd-btn" data-key="0">0</button>
      <button class="kbd-btn kbd-clr"     data-key="clr">CLR</button>

      <!-- Row 4: undefined + submit -->
      <button class="kbd-btn kbd-undef"   data-key="undef">UNDEFINED</button>
      <button class="kbd-btn kbd-submit"  data-key="submit">ENTER ↵</button>
    `;
  }

  // Attach event listeners to the rendered keyboard
  attachTo(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-key]');
      if (!btn) return;
      const key = btn.dataset.key;
      if ('0123456789'.includes(key)) { this.pressDigit(key); return; }
      switch (key) {
        case 'sqrt':   this.pressRadical(); break;
        case 'frac':   this.pressFraction(); break;
        case 'neg':    this.pressNegative(); break;
        case 'undef':  this.pressUndefined(); break;
        case 'bksp':   this.pressBackspace(); break;
        case 'clr':    this.reset(); break;
        case 'submit': this.pressSubmit(); break;
      }
    });

    // Physical keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if ('0123456789'.includes(e.key)) { this.pressDigit(e.key); return; }
      if (e.key === 'Backspace') { this.pressBackspace(); return; }
      if (e.key === 'Enter') { this.pressSubmit(); return; }
      if (e.key === '/') { this.pressFraction(); return; }
      if (e.key === '-') { this.pressNegative(); return; }
      if (e.key === 'r' || e.key === 'R') { this.pressRadical(); return; }
      if (e.key === 'Escape') { this.reset(); return; }
      if (e.key === 'u' || e.key === 'U') { this.pressUndefined(); return; }
    });
  }
}
