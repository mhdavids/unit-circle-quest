// ─── Trig Data ────────────────────────────────────────────────────────────────
// All values rationalized (no radicals in denominator)
// Keys are canonical degrees (0–360)

const TRIG_DATA = {
  0:   { cos:'1',      sin:'0',      tan:'0',       sec:'1',       csc:'undefined', cot:'undefined', rad:'0',       refAngle:0,  quadrant:0, triangleType:'axis' },
  30:  { cos:'√3/2',   sin:'1/2',    tan:'√3/3',    sec:'2√3/3',   csc:'2',         cot:'√3',        rad:'π/6',     refAngle:30, quadrant:1, triangleType:'30-60-90' },
  45:  { cos:'√2/2',   sin:'√2/2',   tan:'1',       sec:'√2',      csc:'√2',        cot:'1',         rad:'π/4',     refAngle:45, quadrant:1, triangleType:'45-45-90' },
  60:  { cos:'1/2',    sin:'√3/2',   tan:'√3',      sec:'2',       csc:'2√3/3',     cot:'√3/3',      rad:'π/3',     refAngle:60, quadrant:1, triangleType:'30-60-90' },
  90:  { cos:'0',      sin:'1',      tan:'undefined',sec:'undefined',csc:'1',        cot:'0',         rad:'π/2',     refAngle:90, quadrant:0, triangleType:'axis' },
  120: { cos:'-1/2',   sin:'√3/2',   tan:'-√3',     sec:'-2',      csc:'2√3/3',     cot:'-√3/3',     rad:'2π/3',    refAngle:60, quadrant:2, triangleType:'30-60-90' },
  135: { cos:'-√2/2',  sin:'√2/2',   tan:'-1',      sec:'-√2',     csc:'√2',        cot:'-1',        rad:'3π/4',    refAngle:45, quadrant:2, triangleType:'45-45-90' },
  150: { cos:'-√3/2',  sin:'1/2',    tan:'-√3/3',   sec:'-2√3/3',  csc:'2',         cot:'-√3',       rad:'5π/6',    refAngle:30, quadrant:2, triangleType:'30-60-90' },
  180: { cos:'-1',     sin:'0',      tan:'0',       sec:'-1',      csc:'undefined', cot:'undefined', rad:'π',       refAngle:0,  quadrant:0, triangleType:'axis' },
  210: { cos:'-√3/2',  sin:'-1/2',   tan:'√3/3',    sec:'-2√3/3',  csc:'-2',        cot:'√3',        rad:'7π/6',    refAngle:30, quadrant:3, triangleType:'30-60-90' },
  225: { cos:'-√2/2',  sin:'-√2/2',  tan:'1',       sec:'-√2',     csc:'-√2',       cot:'1',         rad:'5π/4',    refAngle:45, quadrant:3, triangleType:'45-45-90' },
  240: { cos:'-1/2',   sin:'-√3/2',  tan:'√3',      sec:'-2',      csc:'-2√3/3',    cot:'√3/3',      rad:'4π/3',    refAngle:60, quadrant:3, triangleType:'30-60-90' },
  270: { cos:'0',      sin:'-1',     tan:'undefined',sec:'undefined',csc:'-1',       cot:'0',         rad:'3π/2',    refAngle:90, quadrant:0, triangleType:'axis' },
  300: { cos:'1/2',    sin:'-√3/2',  tan:'-√3',     sec:'2',       csc:'-2√3/3',    cot:'-√3/3',     rad:'5π/3',    refAngle:60, quadrant:4, triangleType:'30-60-90' },
  315: { cos:'√2/2',   sin:'-√2/2',  tan:'-1',      sec:'√2',      csc:'-√2',       cot:'-1',        rad:'7π/4',    refAngle:45, quadrant:4, triangleType:'45-45-90' },
  330: { cos:'√3/2',   sin:'-1/2',   tan:'-√3/3',   sec:'2√3/3',   csc:'-2',        cot:'-√3',       rad:'11π/6',   refAngle:30, quadrant:4, triangleType:'30-60-90' },
  360: { cos:'1',      sin:'0',      tan:'0',       sec:'1',       csc:'undefined', cot:'undefined', rad:'2π',      refAngle:0,  quadrant:0, triangleType:'axis' },
};

const TRIG_FUNCTIONS = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot'];

// ─── Angle Utilities ──────────────────────────────────────────────────────────

function reduceToDegrees(deg) {
  return ((deg % 360) + 360) % 360;
}

function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

function degToRadString(deg) {
  if (deg === 0) return '0';
  const sign = deg < 0 ? '-' : '';
  const abs = Math.abs(deg);
  // deg/180 * π  →  simplify abs/180
  const g = gcd(abs, 180);
  const num = abs / g;
  const den = 180 / g;
  const numStr = num === 1 ? '' : String(num);
  return den === 1 ? `${sign}${numStr}π` : `${sign}${numStr}π/${den}`;
}

function formatAngle(deg, mode) {
  if (mode === 'degrees') return `${deg}°`;
  if (mode === 'radians') return degToRadString(deg);
  // 'both' — random
  return Math.random() < 0.5 ? `${deg}°` : degToRadString(deg);
}

// ─── Answer Normalization ────────────────────────────────────────────────────

function normalizeAnswer(str) {
  return str.trim().replace(/\s+/g, '').toLowerCase();
}

function checkAnswer(userInput, expected) {
  return normalizeAnswer(userInput) === normalizeAnswer(expected);
}

// ─── Level Configuration ─────────────────────────────────────────────────────

const LEVEL_CONFIGS = [
  { level: 1,  time: 60, label: '1' },
  { level: 2,  time: 45, label: '2' },
  { level: 3,  time: 30, label: '3' },
  { level: 4,  time: 25, label: '4' },
  { level: 5,  time: 20, label: '5' },
  { level: 6,  time: 15, label: '6' },
  { level: 7,  time: 10, label: '7' },
  { level: 8,  time: 5,  label: '8' },
  { level: 9,  time: 3,  label: '9' },
  { level: 10, time: 2,  label: '10' },
];

const ANGLE_POOLS = {
  1: [0, 30, 45, 60, 90],
  2: [0, 30, 45, 60, 90, 120, 135, 150, 180],
  3: [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360],
};

function getLevelPool(levelIndex) {
  if (levelIndex <= 0) return ANGLE_POOLS[1];
  if (levelIndex === 1) return ANGLE_POOLS[2];
  return ANGLE_POOLS[3]; // levels 3+ use full circle
}

function getCanonicalAngles() { return ANGLE_POOLS[3]; }

function generateQuestion(levelIndex, angleMode) {
  let deg;
  const useExtended = levelIndex >= 3 && Math.random() < 0.45;

  if (useExtended) {
    const base = ANGLE_POOLS[3][Math.floor(Math.random() * ANGLE_POOLS[3].length)];
    const variants = [base - 360, base + 360, base - 720, base + 720].filter(v => v !== 0 || base === 0);
    deg = variants[Math.floor(Math.random() * variants.length)];
  } else {
    const pool = getLevelPool(levelIndex);
    deg = pool[Math.floor(Math.random() * pool.length)];
  }

  const canonical = reduceToDegrees(deg);
  const func = TRIG_FUNCTIONS[Math.floor(Math.random() * TRIG_FUNCTIONS.length)];
  const answer = TRIG_DATA[canonical][func];
  const displayAngle = formatAngle(deg, angleMode);
  const needsCoterminal = deg !== canonical && !(deg === 360 && canonical === 0);

  return { deg, canonical, func, answer, displayAngle, needsCoterminal, levelConfig: LEVEL_CONFIGS[Math.min(levelIndex, 9)] };
}
