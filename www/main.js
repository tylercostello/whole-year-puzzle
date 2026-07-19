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

  document
    .getElementById("solve-btn")
    .addEventListener("click", onSolve);

  document
    .getElementById("prev-btn")
    .addEventListener("click", () => navigate(-1));

  document
    .getElementById("next-btn")
    .addEventListener("click", () => navigate(1));

  onSolve();
}



function populateSelectors() {

  const monthSel =
    document.getElementById("month-select");


  MONTHS.forEach((m, i) => {

    const opt = document.createElement("option");

    opt.value = i;
    opt.textContent = m;

    monthSel.appendChild(opt);
  });


  const daySel =
    document.getElementById("day-select");


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

  const boardEl =
    document.getElementById("board");


  boardEl.innerHTML = "";


  cellEls = board.map((cell) => {

    const div = document.createElement("div");

    div.className =
      "cell " + cell.kind;


    if (cell.kind === "month")
      div.textContent = MONTHS[cell.value];

    else if (cell.kind === "day")
      div.textContent = cell.value;


    boardEl.appendChild(div);

    return div;
  });



  const svg =
    document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );


  svg.id = "piece-lines";


  boardEl.appendChild(svg);
}




function onSolve() {

  const month =
    Number(
      document.getElementById("month-select").value
    );


  const day =
    Number(
      document.getElementById("day-select").value
    );


  solutions =
    solve_all(month, day);


  currentIndex = 0;

  render();
}




function navigate(delta) {

  if (!solutions.length)
    return;


  currentIndex =
    (currentIndex + delta + solutions.length)
    % solutions.length;


  render();
}




function render() {

  const status =
    document.getElementById("status");

  const prev =
    document.getElementById("prev-btn");

  const next =
    document.getElementById("next-btn");



  if (!solutions.length) {

    status.textContent =
      "No solutions found";

    prev.disabled = true;
    next.disabled = true;

    return;
  }



  status.textContent =
    `Solution ${currentIndex + 1} of ${solutions.length}`;


  prev.disabled = solutions.length < 2;
  next.disabled = solutions.length < 2;



  const grid =
    solutions[currentIndex];



  board.forEach((cell, i) => {

    const el = cellEls[i];

    el.classList.remove("open");

    el.style.background = "";



    if (cell.kind === "blocked")
      return;



    const value = grid[i];



    if (value === -2) {

      el.classList.add("open");

    }

    else if (value >= 0) {

      el.style.background =
        PIECE_COLORS[value];

    }

  });



  drawPieceLines(grid);
}




function drawPieceLines(grid) {

  const svg =
    document.getElementById("piece-lines");


  svg.innerHTML = "";


  svg.setAttribute(
    "viewBox",
    "0 0 700 700"
  );


  const ns =
    "http://www.w3.org/2000/svg";


  const size = 100;



  function line(x1, y1, x2, y2) {

    const l =
      document.createElementNS(
        ns,
        "line"
      );


    l.setAttribute("x1", x1);
    l.setAttribute("y1", y1);

    l.setAttribute("x2", x2);
    l.setAttribute("y2", y2);



    l.setAttribute(
      "stroke",
      "white"
    );


    l.setAttribute(
      "stroke-width",
      "3"
    );


    l.setAttribute(
      "stroke-linecap",
      "round"
    );


    l.setAttribute(
      "stroke-linejoin",
      "round"
    );


    l.setAttribute(
      "vector-effect",
      "non-scaling-stroke"
    );


    svg.appendChild(l);
  }




  for (let i = 0; i < grid.length; i++) {

    const piece = grid[i];


    if (piece < 0)
      continue;


    const r =
      Math.floor(i / 7);

    const c =
      i % 7;


    const x = c * size;
    const y = r * size;



    if (r === 0 || grid[i - 7] !== piece)
      line(
        x,
        y,
        x + size,
        y
      );



    if (r === 6 || grid[i + 7] !== piece)
      line(
        x,
        y + size,
        x + size,
        y + size
      );



    if (c === 0 || grid[i - 1] !== piece)
      line(
        x,
        y,
        x,
        y + size
      );



    if (c === 6 || grid[i + 1] !== piece)
      line(
        x + size,
        y,
        x + size,
        y + size
      );

  }
}



main();