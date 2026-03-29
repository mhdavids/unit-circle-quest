# Unit Circle Quest

An interactive browser-based game for high school (and college review) students to master all six trigonometric functions across the full unit circle.

🎮 **[Play it live](https://mhdavids.github.io/unit-circle-quest/)**

---

## What It Does

Students are shown an angle and must find the correct value of an assigned trig function (sin, cos, tan, csc, sec, cot). Answers are entered using an on-screen math keyboard that supports radicals and fractions. When a student answers incorrectly, an animated step-by-step explanation shows exactly how to find the answer.

### Key Features

- **10 difficulty levels** — timer shrinks from 60 seconds down to 2 seconds per question
- **Angle progression** — starts in Quadrant I, expands to all four quadrants, then introduces negative angles and angles greater than 360°
- **3 angle modes** — degrees, radians, or both (randomly mixed)
- **3 lives** — miss one, see the explanation, keep going
- **Math keyboard** — on-screen input for √, fractions, ±, and "undefined"
- **Animated explanations** — after a wrong answer, an SVG diagram shows the coterminal reduction (if needed), the special triangle placed in the correct quadrant, and the step-by-step calculation
- **KaTeX rendering** — all math displays as properly typeset fractions and radicals
- **Global leaderboard** — shared across all users via Firebase Realtime Database, with arcade-style 3-letter name entry
- **Comprehensive lesson page** — review before playing or revisit after a miss

---

## Lesson Page

Six sections covering everything students need:

1. **Special Triangles** — animated SVGs showing how an equilateral triangle (side 2) produces the 30-60-90 triangle, and how a unit square produces the 45-45-90 triangle
2. **SOHCAHTOA → Unit Circle** — why sin = y, cos = x, tan = y/x on the unit circle
3. **Four Quadrants & Signs** — ASTC mnemonic, sign rules, triangles in all four quadrants, full 17-angle trig table
4. **Trig Graphs** — all six functions graphed from −2π to 2π with asymptotes marked
5. **Radians vs Degrees** — radian definition, conversion formulas, coterminal angles, reference angles
6. **Full Unit Circle Reference** — labeled diagram with all 17 special angles (degrees + radians + coordinates) and a complete 8-column trig value table

---

## Trig Functions Covered

| Function | Definition |
|----------|------------|
| sin θ | y |
| cos θ | x |
| tan θ | y / x |
| csc θ | 1 / y |
| sec θ | 1 / x |
| cot θ | x / y |

All answers are rationalized (no radicals in the denominator).

---

## Angles Covered

| Level | Angle Pool |
|-------|-----------|
| 1 | Quadrant I: 0°, 30°, 45°, 60°, 90° |
| 2 | + Quadrant II: 120°, 135°, 150°, 180° |
| 3 | + Quadrants III & IV: full unit circle |
| 4–10 | + Negative angles and angles > 360° |

---

## Difficulty Progression

| Level | Time per Question |
|-------|------------------|
| 1 | 60 seconds |
| 2 | 45 seconds |
| 3 | 30 seconds |
| 4 | 25 seconds |
| 5 | 20 seconds |
| 6 | 15 seconds |
| 7 | 10 seconds |
| 8 | 5 seconds |
| 9 | 3 seconds |
| 10 | 2 seconds |

10 correct answers advances to the next level.

---

## Tech Stack

- **Vanilla HTML/CSS/JavaScript** — no build tools, no frameworks
- **KaTeX** — math typesetting for fractions, radicals, and Greek letters
- **Firebase Realtime Database** — global shared leaderboard via REST API
- **GitHub Pages** — static hosting

---

## File Structure

```
unit-circle-game/
├── index.html          # Landing page (mode selector, leaderboard preview)
├── game.html           # Game
├── lesson.html         # Lesson reference page
├── css/
│   └── style.css       # Dark neon theme
└── js/
    ├── trig-data.js    # All trig values, level config, toLatex() helper
    ├── game.js         # Game engine (lives, timer, scoring, Firebase)
    ├── keyboard.js     # MathKeyboard class (live KaTeX preview)
    └── explanation.js  # Animated post-miss explanation builder
```

---

## Running Locally

No installation needed — just open `index.html` in a browser.

```bash
git clone https://github.com/mhdavids/unit-circle-quest.git
cd unit-circle-quest
open index.html   # or double-click the file
```
