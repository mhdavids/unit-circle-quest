// ─── Post-Miss Animated Explanation ──────────────────────────────────────────
// Generates an SVG animation + step list explaining how to find a trig value.

const COLORS = {
  axis: '#7070a0',
  blue: '#00d4ff',
  pink: '#ff006e',
  green: '#39ff14',
  gold: '#ffd700',
  purple: '#bf5af2',
  text: '#e0e0ff',
  bg: '#12122a',
  xPos: '#39ff14',
  xNeg: '#ff006e',
  yPos: '#00d4ff',
  yNeg: '#bf5af2',
};

// ── KaTeX helper ──────────────────────────────────────────────────────────────
function kSpan(content) {
  if (typeof katex === 'undefined') return `<span class="math">${content}</span>`;
  const latex = toLatex(content);
  return `<span class="math">${katex.renderToString(latex || content, { throwOnError: false })}</span>`;
}

// ── Main entry point ──────────────────────────────────────────────────────────
function buildExplanation(question, containerEl) {
  const { deg, canonical, func, answer } = question;
  const data = TRIG_DATA[canonical];

  containerEl.innerHTML = '';

  // 1. Build SVG
  const svgWrap = document.createElement('div');
  svgWrap.className = 'explanation-svg-wrap';
  const svg = createExplanationSVG(deg, canonical, func, data);
  svgWrap.appendChild(svg);
  containerEl.appendChild(svgWrap);

  // 2. Correct answer box
  const ansBox = document.createElement('div');
  ansBox.className = 'correct-answer-box';
  if (typeof katex !== 'undefined') {
    ansBox.innerHTML = katex.renderToString(
      `\\${func}\\!\\left(${toLatex(question.displayAngle)}\\right) = ${toLatex(answer)}`,
      { throwOnError: false, displayMode: true }
    );
  } else {
    ansBox.textContent = `${func}(${question.displayAngle}) = ${answer}`;
  }
  containerEl.appendChild(ansBox);

  // 3. Step list
  const steps = buildSteps(deg, canonical, func, data, question.displayAngle);
  const ul = document.createElement('ul');
  ul.className = 'explanation-steps';
  steps.forEach((s, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="step-num">${i + 1}</span>${s}`;
    ul.appendChild(li);
  });
  containerEl.appendChild(ul);

  // Animate steps in sequence after SVG animation completes
  animateSteps(ul.querySelectorAll('li'), 600);
}

// ── Step text builder ─────────────────────────────────────────────────────────
function buildSteps(deg, canonical, func, data, displayAngle) {
  const steps = [];
  const needsCoterminal = deg !== canonical;

  if (needsCoterminal) {
    const times = Math.abs(Math.floor(deg / 360)) + (deg < 0 && deg % 360 !== 0 ? 1 : 0);
    const amount = times * 360;
    const expr = deg < 0
      ? `${deg}^{\\circ} + ${amount}^{\\circ} = ${canonical}^{\\circ}`
      : `${deg}^{\\circ} - ${amount}^{\\circ} = ${canonical}^{\\circ}`;
    steps.push(`${kSpan(expr)} — find the coterminal angle in 0°–360°.`);
  }

  // Quadrant / reference angle
  const q = data.quadrant;
  const ref = data.refAngle;
  if (q === 0) {
    steps.push(`${kSpan(canonical + '°')} is on an axis — read the value directly from the unit circle.`);
  } else {
    const qLabel = ['', 'I (x+, y+)', 'II (x−, y+)', 'III (x−, y−)', 'IV (x+, y−)'][q];
    steps.push(`${kSpan(canonical + '°')} is in Quadrant ${qLabel}. Reference angle: ${kSpan(ref + '°')}.`);
  }

  // Triangle type
  const coordStr = `(${toLatex(data.cos)},\\, ${toLatex(data.sin)})`;
  if (data.triangleType === '30-60-90') {
    steps.push(`Use the 30-60-90 triangle. The unit circle point is ${kSpan(coordStr)}, so ${kSpan('x = ' + toLatex(data.cos))}, ${kSpan('y = ' + toLatex(data.sin))}.`);
  } else if (data.triangleType === '45-45-90') {
    steps.push(`Use the 45-45-90 triangle. The unit circle point is ${kSpan(coordStr)}, so ${kSpan('x = ' + toLatex(data.cos))}, ${kSpan('y = ' + toLatex(data.sin))}.`);
  } else {
    steps.push(`At this axis angle, the coordinates are ${kSpan(coordStr)}.`);
  }

  // Function formula
  const undef = '\\text{undefined}';
  const formulaMap = {
    sin: `\\sin\\theta = y = ${toLatex(data.sin)}`,
    cos: `\\cos\\theta = x = ${toLatex(data.cos)}`,
    tan: data.tan === 'undefined'
      ? `\\tan\\theta = y/x = ${toLatex(data.sin)} \\div ${toLatex(data.cos)} = ${undef}`
      : `\\tan\\theta = y/x = ${toLatex(data.sin)} \\div ${toLatex(data.cos)} = ${toLatex(data.tan)}`,
    csc: data.csc === 'undefined'
      ? `\\csc\\theta = 1/y = 1 \\div ${toLatex(data.sin)} = ${undef}`
      : `\\csc\\theta = 1/y = 1 \\div ${toLatex(data.sin)} = ${toLatex(data.csc)}`,
    sec: data.sec === 'undefined'
      ? `\\sec\\theta = 1/x = 1 \\div ${toLatex(data.cos)} = ${undef}`
      : `\\sec\\theta = 1/x = 1 \\div ${toLatex(data.cos)} = ${toLatex(data.sec)}`,
    cot: data.cot === 'undefined'
      ? `\\cot\\theta = x/y = ${toLatex(data.cos)} \\div ${toLatex(data.sin)} = ${undef}`
      : `\\cot\\theta = x/y = ${toLatex(data.cos)} \\div ${toLatex(data.sin)} = ${toLatex(data.cot)}`,
  };
  steps.push(kSpan(formulaMap[func]));

  return steps;
}

// ── Animate steps ─────────────────────────────────────────────────────────────
function animateSteps(items, delayStart) {
  items.forEach((li, i) => {
    setTimeout(() => li.classList.add('visible'), delayStart + i * 320);
  });
}

// ── SVG Creation ──────────────────────────────────────────────────────────────
function createExplanationSVG(deg, canonical, func, data) {
  const W = 300, H = 300, CX = 150, CY = 150, R = 110;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '300');
  svg.setAttribute('height', '300');
  svg.style.borderRadius = '8px';

  // Background
  rect(svg, 0, 0, W, H, COLORS.bg);

  // Grid lines (faint)
  line(svg, 0, CY, W, CY, COLORS.axis, 1, '4,4');
  line(svg, CX, 0, CX, H, COLORS.axis, 1, '4,4');

  // Axis arrows
  arrow(svg, CX, CY, CX + R + 20, CY, COLORS.axis, 1.5);
  arrow(svg, CX, CY, CX - R - 20, CY, COLORS.axis, 1);
  arrow(svg, CX, CY, CX, CY - R - 20, COLORS.axis, 1.5);
  arrow(svg, CX, CY, CX, CY + R + 20, COLORS.axis, 1);
  text(svg, CX + R + 22, CY + 4, 'x', COLORS.axis, '11px');
  text(svg, CX + 5, CY - R - 18, 'y', COLORS.axis, '11px');

  // Unit circle
  circle(svg, CX, CY, R, 'none', COLORS.blue, 1.5);

  // Angle arc
  const angleRad = (canonical * Math.PI) / 180;
  const px = CX + R * Math.cos(-angleRad);
  const py = CY + R * Math.sin(-angleRad);

  // Draw angle arc from 0 to angle
  const arcR = 28;
  const arcPath = arcPathStr(CX, CY, arcR, 0, -angleRad);
  path(svg, arcPath, 'none', COLORS.gold, 2, '', 'arc-path');

  // Radial line to point
  const radialLine = line(svg, CX, CY, px, py, COLORS.pink, 2.5);
  radialLine.id = 'radial-line';

  // Triangle legs (if not axis)
  if (data.quadrant !== 0) {
    // horizontal leg
    const triLine1 = line(svg, CX, CY, px, CY, COLORS.green, 1.5, '6,3');
    // vertical leg
    const triLine2 = line(svg, px, CY, px, py, COLORS.purple, 1.5, '6,3');

    // Label x and y
    const xMid = (CX + px) / 2;
    const yMid = (py + CY) / 2;
    text(svg, xMid, CY + (py > CY ? -8 : 12), data.cos, COLORS.green, '10px', 'middle');
    text(svg, px + (px > CX ? 5 : -5), yMid, data.sin, COLORS.purple, '10px', px > CX ? 'start' : 'end');
  }

  // Point on circle
  const dot = circle(svg, px, py, 6, COLORS.pink, COLORS.pink, 0);
  dot.id = 'angle-dot';

  // Coordinate label
  const labelX = px + (px > CX ? 8 : -8);
  const labelY = py + (py > CY ? 14 : -8);
  const coordLabel = text(svg, labelX, labelY, `(${data.cos}, ${data.sin})`, COLORS.gold, '9.5px', px > CX ? 'start' : 'end');
  coordLabel.id = 'coord-label';

  // Angle degree label on arc
  const arcLabelAngle = canonical / 2;
  const arcLabelRad = (arcLabelAngle * Math.PI) / 180;
  const arcLX = CX + (arcR + 14) * Math.cos(-arcLabelRad);
  const arcLY = CY + (arcR + 14) * Math.sin(-arcLabelRad);
  text(svg, arcLX, arcLY, `${canonical}°`, COLORS.gold, '9px', 'middle');

  // Highlighted function value
  const funcColors = { sin: COLORS.purple, cos: COLORS.green, tan: COLORS.gold, csc: COLORS.purple, sec: COLORS.green, cot: COLORS.gold };
  const funcVal = data[func];
  const highlightEl = text(svg, CX, H - 16, `${func} = ${funcVal}`, funcColors[func] || COLORS.text, '13px', 'middle');
  highlightEl.setAttribute('font-weight', '700');
  highlightEl.style.opacity = '0';

  // Animate SVG elements
  animateSVGElements(svg, deg, canonical, data, func, highlightEl);

  return svg;
}

// ── SVG Animations ────────────────────────────────────────────────────────────
function animateSVGElements(svg, deg, canonical, data, func, highlightEl) {
  // Animate the radial line drawing (CSS animation via stroke-dasharray)
  const radial = svg.getElementById('radial-line');
  if (radial) {
    const length = 115;
    radial.style.strokeDasharray = length;
    radial.style.strokeDashoffset = length;
    radial.style.transition = 'stroke-dashoffset 0.5s ease-out 0.2s';
    setTimeout(() => { radial.style.strokeDashoffset = '0'; }, 50);
  }

  // Animate dot pop-in
  const dot = svg.getElementById('angle-dot');
  if (dot) {
    dot.setAttribute('r', '0');
    setTimeout(() => {
      dot.style.transition = 'r 0.3s ease';
      dot.setAttribute('r', '6');
    }, 700);
  }

  // Animate coord label
  const coord = svg.getElementById('coord-label');
  if (coord) {
    coord.style.opacity = '0';
    coord.style.transition = 'opacity 0.4s';
    setTimeout(() => { coord.style.opacity = '1'; }, 900);
  }

  // Show function result last
  setTimeout(() => {
    highlightEl.style.transition = 'opacity 0.4s';
    highlightEl.style.opacity = '1';
  }, 1200);
}

// ── SVG helpers ───────────────────────────────────────────────────────────────
function rect(parent, x, y, w, h, fill) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  Object.assign(el, {});
  el.setAttribute('x', x); el.setAttribute('y', y);
  el.setAttribute('width', w); el.setAttribute('height', h);
  el.setAttribute('fill', fill);
  parent.appendChild(el);
  return el;
}

function circle(parent, cx, cy, r, fill, stroke, sw) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  el.setAttribute('cx', cx); el.setAttribute('cy', cy); el.setAttribute('r', r);
  el.setAttribute('fill', fill); el.setAttribute('stroke', stroke);
  el.setAttribute('stroke-width', sw);
  parent.appendChild(el);
  return el;
}

function line(parent, x1, y1, x2, y2, stroke, sw, dash = '') {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  el.setAttribute('x1', x1); el.setAttribute('y1', y1);
  el.setAttribute('x2', x2); el.setAttribute('y2', y2);
  el.setAttribute('stroke', stroke); el.setAttribute('stroke-width', sw);
  if (dash) el.setAttribute('stroke-dasharray', dash);
  parent.appendChild(el);
  return el;
}

function arrow(parent, x1, y1, x2, y2, stroke, sw) {
  const id = `arr-${Math.random().toString(36).slice(2,6)}`;
  const defs = parent.querySelector('defs') || (() => { const d = document.createElementNS('http://www.w3.org/2000/svg','defs'); parent.insertBefore(d, parent.firstChild); return d; })();
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', id); marker.setAttribute('markerWidth', '6'); marker.setAttribute('markerHeight', '6');
  marker.setAttribute('refX', '3'); marker.setAttribute('refY', '3'); marker.setAttribute('orient', 'auto');
  const mp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  mp.setAttribute('d', 'M0,0 L0,6 L6,3 z'); mp.setAttribute('fill', stroke);
  marker.appendChild(mp); defs.appendChild(marker);
  const l = line(parent, x1, y1, x2, y2, stroke, sw);
  l.setAttribute('marker-end', `url(#${id})`);
  return l;
}

function text(parent, x, y, content, fill, fontSize, anchor = 'start') {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  el.setAttribute('x', x); el.setAttribute('y', y);
  el.setAttribute('fill', fill); el.setAttribute('font-size', fontSize);
  el.setAttribute('font-family', 'Courier New, monospace');
  el.setAttribute('text-anchor', anchor);
  el.textContent = content;
  parent.appendChild(el);
  return el;
}

function path(parent, d, fill, stroke, sw, dash = '', id = '') {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  el.setAttribute('d', d); el.setAttribute('fill', fill);
  el.setAttribute('stroke', stroke); el.setAttribute('stroke-width', sw);
  if (dash) el.setAttribute('stroke-dasharray', dash);
  if (id) el.id = id;
  parent.appendChild(el);
  return el;
}

function arcPathStr(cx, cy, r, startAngle, endAngle) {
  const start = { x: cx + r * Math.cos(startAngle), y: cy + r * Math.sin(startAngle) };
  const end   = { x: cx + r * Math.cos(endAngle),   y: cy + r * Math.sin(endAngle) };
  const diff = endAngle - startAngle;
  const large = Math.abs(diff) > Math.PI ? 1 : 0;
  const sweep = diff > 0 ? 1 : 0;
  return `M${start.x},${start.y} A${r},${r} 0 ${large} ${sweep} ${end.x},${end.y}`;
}
