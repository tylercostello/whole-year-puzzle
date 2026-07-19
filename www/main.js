import init, { get_board, solve_all } from "./pkg/whole_year_puzzle_solver.js";

const PIECE_COLORS = [
  "#e07a5f", "#3d405b", "#81b29a", "#f2cc8f", "#98c1d9",
  "#e76f51", "#6d597a", "#b56576", "#355070",
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

let board = [];
let cellEls = [];
let solutions = [];
let currentIndex = 0;

// ------------------------------------------------------------------
// Embedded solution counts (372 entries – all 12 months × 31 days)
// ------------------------------------------------------------------
const solutionCounts = new Map();

const countData = `
Jan 28: 734
Jan 22: 582
Jun 28: 564
Jan 07: 506
Jun 07: 483
Jun 29: 472
Mar 28: 444
Jun 31: 408
Jun 22: 403
Mar 07: 373
Mar 22: 353
Jan 30: 347
Jan 01: 315
Jan 14: 312
Jan 31: 312
Jun 14: 311
Apr 22: 305
Jun 01: 296
Apr 31: 284
Nov 28: 271
Aug 28: 264
Jan 11: 259
Jan 29: 256
Apr 29: 254
Apr 07: 250
Aug 22: 244
Jul 01: 241
Jan 20: 239
May 07: 236
Jun 20: 232
Mar 31: 231
Feb 07: 229
Jun 08: 229
Jun 12: 229
Jun 27: 227
Dec 07: 227
Aug 07: 222
Apr 08: 221
Nov 22: 220
Apr 28: 218
Oct 07: 218
Mar 29: 206
Jul 07: 206
Jan 16: 205
Jun 04: 205
Jan 05: 202
Jan 18: 202
Jun 30: 200
Jan 03: 198
Jan 09: 194
Jul 22: 194
Feb 28: 192
Jul 28: 192
Nov 05: 191
Jun 25: 190
Mar 30: 188
Aug 30: 187
Nov 14: 187
Nov 29: 185
Nov 31: 185
Jun 06: 184
Jan 08: 183
Oct 28: 180
Sep 07: 178
Mar 20: 175
Jun 17: 175
Sep 28: 175
Apr 14: 174
Jun 16: 174
Aug 14: 174
Sep 22: 173
Feb 31: 172
Dec 22: 171
Jan 13: 170
Jun 10: 170
Aug 31: 169
Jun 11: 168
Jul 31: 168
Dec 29: 166
Feb 29: 164
Nov 07: 164
Jun 13: 163
Mar 05: 162
Mar 14: 160
Apr 13: 159
May 28: 154
Jun 23: 153
Jun 18: 150
Oct 01: 150
Jan 27: 149
Jan 12: 147
Jul 30: 146
Jan 26: 145
Jan 25: 143
Jul 29: 143
Jun 05: 142
Dec 28: 140
Oct 22: 139
Jun 21: 136
Mar 11: 135
May 22: 133
Mar 01: 131
Apr 23: 131
Dec 08: 131
Dec 31: 131
Jan 10: 130
Mar 09: 130
Jun 02: 128
Aug 01: 127
Jan 17: 126
Apr 04: 125
Jun 09: 125
Dec 01: 125
Apr 18: 122
Nov 01: 122
Jan 04: 121
Mar 21: 121
Feb 01: 119
Feb 22: 119
Sep 31: 119
Jan 02: 118
Apr 30: 118
Jun 19: 116
Mar 13: 114
Mar 17: 114
Apr 10: 114
Mar 03: 113
Apr 02: 113
Sep 29: 113
Jun 15: 110
Aug 29: 110
Jan 19: 109
Aug 18: 109
Nov 30: 109
Aug 09: 108
Sep 01: 106
Jan 21: 105
Mar 16: 105
Mar 18: 105
May 30: 105
Nov 08: 104
Nov 13: 104
Jan 24: 102
Apr 16: 101
Jun 03: 101
Nov 27: 101
Jan 15: 100
Aug 12: 100
Oct 08: 100
Dec 10: 99
Mar 23: 98
May 01: 98
Sep 03: 98
Apr 25: 97
Feb 14: 96
Apr 11: 96
Apr 17: 96
Sep 08: 95
Sep 30: 95
Jan 23: 94
Apr 12: 94
Aug 20: 94
Nov 10: 94
Jan 06: 93
Feb 08: 93
Apr 09: 93
Nov 18: 93
Mar 10: 92
Mar 12: 92
May 08: 91
Jul 09: 91
Dec 30: 91
Apr 19: 90
Aug 13: 87
Oct 30: 87
Jun 26: 86
Jul 14: 86
Oct 29: 86
Mar 19: 85
Jul 13: 85
Aug 08: 85
Aug 11: 85
Nov 11: 85
Jul 18: 84
Nov 20: 84
Mar 02: 83
Apr 03: 83
Jul 08: 83
Apr 05: 82
Apr 20: 82
May 05: 82
Oct 31: 82
Mar 25: 81
Apr 27: 81
Feb 03: 80
Jun 24: 79
Aug 02: 79
Mar 24: 78
Apr 24: 78
Sep 13: 78
Mar 15: 77
Apr 01: 77
Oct 14: 77
Feb 10: 76
Mar 04: 76
Mar 08: 76
Apr 15: 76
Sep 10: 76
Mar 26: 75
May 29: 75
Dec 13: 75
Jul 03: 74
Aug 03: 74
Dec 27: 74
Feb 02: 73
Feb 18: 73
Aug 27: 73
Oct 13: 72
Jul 10: 71
Nov 17: 71
Dec 18: 71
Feb 30: 70
Aug 05: 70
Aug 23: 70
Apr 21: 69
May 31: 68
Nov 09: 68
Feb 13: 67
Aug 10: 67
Sep 05: 67
Sep 11: 66
Oct 18: 66
Sep 14: 65
Dec 06: 65
Mar 27: 64
Aug 17: 64
May 23: 63
Jul 11: 63
Sep 23: 62
Dec 11: 62
Apr 26: 60
Aug 04: 60
Nov 23: 60
Jul 20: 59
Oct 04: 59
Oct 16: 59
May 18: 58
Jul 12: 58
Sep 18: 57
Oct 09: 57
Dec 17: 57
Jul 23: 56
Dec 12: 56
Nov 12: 55
Nov 25: 55
Dec 16: 55
Feb 11: 54
Feb 16: 54
Feb 12: 53
May 09: 53
Sep 16: 53
Nov 15: 53
May 20: 52
Oct 03: 52
Dec 04: 52
Feb 27: 51
May 16: 51
Jul 05: 51
Jul 19: 51
Dec 03: 51
Dec 20: 51
Jul 16: 50
Jul 25: 50
Sep 25: 50
Nov 02: 50
Oct 15: 49
Nov 04: 49
Sep 12: 48
Feb 05: 47
Feb 19: 47
Feb 20: 47
Sep 27: 47
Nov 24: 47
May 11: 46
Sep 20: 46
Oct 10: 46
Oct 12: 46
Nov 03: 46
Nov 21: 46
Dec 23: 46
Feb 17: 45
Jul 26: 45
Oct 11: 45
Nov 26: 45
Dec 15: 45
Sep 04: 44
Oct 05: 44
May 03: 43
Jul 17: 43
Aug 21: 43
Oct 19: 43
Oct 20: 43
Feb 04: 41
Feb 23: 41
May 10: 41
May 13: 41
May 27: 41
Jul 04: 41
Jul 27: 41
Aug 16: 41
Nov 19: 41
Dec 14: 40
Sep 26: 39
Oct 24: 39
Feb 09: 38
Feb 25: 38
Aug 19: 38
Sep 09: 38
Oct 17: 38
Oct 23: 38
Dec 02: 38
Dec 05: 38
Feb 21: 37
Dec 24: 37
May 25: 36
Aug 24: 36
Oct 02: 36
Oct 27: 36
Nov 16: 36
Dec 09: 35
Dec 26: 35
Oct 25: 34
Dec 19: 34
Jul 21: 33
Jul 24: 33
Apr 06: 32
May 06: 32
Sep 21: 32
Dec 25: 32
May 14: 31
Sep 19: 31
Oct 26: 31
Feb 24: 30
May 17: 30
Aug 25: 30
Sep 17: 30
Dec 21: 30
May 02: 29
Aug 15: 29
Sep 24: 29
May 12: 28
May 19: 28
May 26: 28
Oct 21: 28
Aug 06: 27
Feb 26: 26
Feb 06: 25
May 04: 25
Aug 26: 24
Sep 06: 23
Sep 02: 22
Sep 15: 22
Feb 15: 21
Oct 06: 21
Nov 06: 21
May 24: 20
May 15: 19
Jul 02: 19
Jul 06: 16
Jul 15: 16
Mar 06: 13
May 21: 11
`;

// Parse the data
countData.trim().split('\n').forEach(line => {
  const parts = line.split(':');
  if (parts.length !== 2) return;
  const monthDay = parts[0].trim();
  const count = parseInt(parts[1].trim(), 10);
  const [monthStr, dayStr] = monthDay.split(' ');
  const monthIndex = MONTHS.indexOf(monthStr);
  const day = parseInt(dayStr, 10);
  if (monthIndex >= 0 && !isNaN(day)) {
    solutionCounts.set(`${monthIndex}-${day}`, count);
  }
});

// Compute ranking: sort by count ascending (lowest = hardest)
const allEntries = Array.from(solutionCounts.entries()).map(([key, count]) => {
  const [monthIdx, day] = key.split('-').map(Number);
  return { monthIdx, day, count };
});
allEntries.sort((a, b) => a.count - b.count);
const rankMap = new Map();
allEntries.forEach((entry, index) => {
  const key = `${entry.monthIdx}-${entry.day}`;
  rankMap.set(key, index + 1); // 1 = hardest
});
const totalDays = allEntries.length; // 372

// ------------------------------------------------------------------
// UI setup
// ------------------------------------------------------------------

async function main() {
  await init();
  board = get_board();
  buildBoardDom();
  populateSelectors();

  document.getElementById("solve-btn").addEventListener("click", onSolve);
  document.getElementById("prev-btn").addEventListener("click", () => navigate(-1));
  document.getElementById("next-btn").addEventListener("click", () => navigate(1));
  document.getElementById("next-day-btn").addEventListener("click", onNextDay);

  onSolve();
}

function populateSelectors() {
  const monthSel = document.getElementById("month-select");
  MONTHS.forEach((m, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = m;
    monthSel.appendChild(opt);
  });

  const daySel = document.getElementById("day-select");
  for (let d = 1; d <= 31; d++) {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    daySel.appendChild(opt);
  }

  const today = new Date();
  monthSel.value = today.getMonth();
  daySel.value = today.getDate();
}

function buildBoardDom() {
  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";
  cellEls = board.map((cell) => {
    const div = document.createElement("div");
    div.className = "cell " + cell.kind;
    if (cell.kind === "month") div.textContent = MONTHS[cell.value];
    else if (cell.kind === "day") div.textContent = cell.value;
    boardEl.appendChild(div);
    return div;
  });

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "piece-lines";
  boardEl.appendChild(svg);
}

function onSolve() {
  const month = Number(document.getElementById("month-select").value);
  const day = Number(document.getElementById("day-select").value);
  solutions = solve_all(month, day);
  currentIndex = 0;
  render();
}

function onNextDay() {
  let month = Number(document.getElementById("month-select").value);
  let day = Number(document.getElementById("day-select").value);
  day += 1;
  if (day > 31) {
    day = 1;
    month += 1;
    if (month > 11) month = 0;
  }
  document.getElementById("month-select").value = month;
  document.getElementById("day-select").value = day;
  onSolve();
}

function navigate(delta) {
  if (!solutions.length) return;
  currentIndex = (currentIndex + delta + solutions.length) % solutions.length;
  render();
}

function getDifficulty(monthIdx, day) {
  const key = `${monthIdx}-${day}`;
  const count = solutionCounts.get(key);
  if (count === undefined) return null;
  const rank = rankMap.get(key);
  if (!rank) return null;
  // linear mapping: rank 1 → 1 star, rank 372 → 5 stars
  const raw = 5 - ((rank - 1) / (totalDays - 1)) * 4;
  const stars = Math.round(raw * 2) / 2;
  return { rank, stars, count };
}

function renderStars(stars) {
  const full = Math.floor(stars);
  const half = stars - full >= 0.25;
  let html = '';

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      // ★ Full gold star
      html += `<svg width="20" height="20" viewBox="0 0 24 24" style="display:inline;vertical-align:middle;">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#f5b342" stroke="#f5b342" stroke-width="0.5"/>
      </svg>`;
    } else if (i === full && half) {
      // ☆ Half star: gray outline + gold fill on the left half only
      html += `<svg width="20" height="20" viewBox="0 0 24 24" style="display:inline;vertical-align:middle;">
        <defs>
          <clipPath id="halfClip_${i}">
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
        </defs>
        <!-- Gray outline for the entire star -->
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="none" stroke="#ddd" stroke-width="1.5"/>
        <!-- Gold fill clipped to the left half -->
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#f5b342" stroke="#f5b342" stroke-width="0.5" clip-path="url(#halfClip_${i})"/>
      </svg>`;
    } else {
      // ☆ Empty star (outline only)
      html += `<svg width="20" height="20" viewBox="0 0 24 24" style="display:inline;vertical-align:middle;">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="none" stroke="#ddd" stroke-width="1.5"/>
      </svg>`;
    }
  }
  return html;
}

function render() {
  const status = document.getElementById("status");
  const prev = document.getElementById("prev-btn");
  const next = document.getElementById("next-btn");
  const starsDisplay = document.getElementById("stars-display");
  const rankDisplay = document.getElementById("rank-display");

  if (!solutions.length) {
    status.textContent = "No solutions found";
    prev.disabled = true;
    next.disabled = true;
    starsDisplay.innerHTML = '';
    rankDisplay.textContent = '';
    return;
  }

  status.textContent = `Solution ${currentIndex + 1} of ${solutions.length}`;
  prev.disabled = solutions.length < 2;
  next.disabled = solutions.length < 2;

  const grid = solutions[currentIndex];
  board.forEach((cell, i) => {
    const el = cellEls[i];
    el.classList.remove("open");
    el.style.background = "";
    if (cell.kind === "blocked") return;
    const value = grid[i];
    if (value === -2) {
      el.classList.add("open");
    } else if (value >= 0) {
      el.style.background = PIECE_COLORS[value];
    }
  });

  drawPieceLines(grid);

  const month = Number(document.getElementById("month-select").value);
  const day = Number(document.getElementById("day-select").value);
  const diff = getDifficulty(month, day);
  if (diff) {
    starsDisplay.innerHTML = renderStars(diff.stars);
    rankDisplay.textContent = `${diff.rank} / ${totalDays}`;
  } else {
    starsDisplay.innerHTML = '';
    rankDisplay.textContent = '—';
  }
}

function drawPieceLines(grid) {
  const svg = document.getElementById("piece-lines");
  svg.innerHTML = "";
  svg.setAttribute("viewBox", "0 0 700 700");
  const ns = "http://www.w3.org/2000/svg";
  const size = 100;

  function line(x1, y1, x2, y2) {
    const l = document.createElementNS(ns, "line");
    l.setAttribute("x1", x1);
    l.setAttribute("y1", y1);
    l.setAttribute("x2", x2);
    l.setAttribute("y2", y2);
    l.setAttribute("stroke", "white");
    l.setAttribute("stroke-width", "3");
    l.setAttribute("stroke-linecap", "round");
    l.setAttribute("stroke-linejoin", "round");
    l.setAttribute("vector-effect", "non-scaling-stroke");
    svg.appendChild(l);
  }

  for (let i = 0; i < grid.length; i++) {
    const piece = grid[i];
    if (piece < 0) continue;
    const r = Math.floor(i / 7);
    const c = i % 7;
    const x = c * size;
    const y = r * size;

    if (r === 0 || grid[i - 7] !== piece)
      line(x, y, x + size, y);
    if (r === 6 || grid[i + 7] !== piece)
      line(x, y + size, x + size, y + size);
    if (c === 0 || grid[i - 1] !== piece)
      line(x, y, x, y + size);
    if (c === 6 || grid[i + 1] !== piece)
      line(x + size, y, x + size, y + size);
  }
}

main();