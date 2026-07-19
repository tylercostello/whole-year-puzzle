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

async function main() {
  await init();
  board = get_board();
  buildBoardDom();
  populateSelectors();

  document.getElementById("solve-btn").addEventListener("click", onSolve);
  document.getElementById("prev-btn").addEventListener("click", () => navigate(-1));
  document.getElementById("next-btn").addEventListener("click", () => navigate(1));

  onSolve(); // solve for today's date on load
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
}

function onSolve() {
  const month = parseInt(document.getElementById("month-select").value, 10);
  const day = parseInt(document.getElementById("day-select").value, 10);
  solutions = solve_all(month, day);
  currentIndex = 0;
  render();
}

function navigate(delta) {
  if (!solutions.length) return;
  currentIndex = (currentIndex + delta + solutions.length) % solutions.length;
  render();
}

function render() {
  const status = document.getElementById("status");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  if (!solutions.length) {
    status.textContent = "No solutions found";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  } else {
    status.textContent = `Solution ${currentIndex + 1} of ${solutions.length}`;
    prevBtn.disabled = solutions.length < 2;
    nextBtn.disabled = solutions.length < 2;
  }

  const grid = solutions[currentIndex];
  board.forEach((cell, idx) => {
    const el = cellEls[idx];
    el.classList.remove("open");
    el.style.background = "";
    if (cell.kind === "blocked") return;

    const v = grid ? grid[idx] : -2;
    if (v === -2) {
      el.classList.add("open");
    } else if (v >= 0) {
      el.style.background = PIECE_COLORS[v];
    }
  });
}

main();
