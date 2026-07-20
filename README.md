# The Whole Year Puzzle — Solver

An exact-cover solver for Palmetto Puzzle Works' *Whole Year Puzzle*,
written in Rust and compiled to WebAssembly. Pick any month/day and it
enumerates **every** valid arrangement of the 9 pieces, right in the
browser.

## How it works

The board (7x7 grid, 43 usable cells) and all 9 pieces are hard-coded in
`src/lib.rs`. All rotations/reflections of each piece are generated, then
every legal placement on the board is precomputed as a 49-bit mask. Solving
a given date is a straightforward exact-cover backtracking search (in the
spirit of Knuth's Algorithm X) that finds every way to tile the 41
non-target cells with all 9 pieces. It runs in well under 100ms per date.

## Local development

Requires the [Rust toolchain](https://rustup.rs) and
[`wasm-pack`](https://rustwasm.github.io/wasm-pack/installer/).

```bash
rustup target add wasm32-unknown-unknown
cargo install wasm-pack

# run the Rust unit tests (native target)
cargo test

# build the wasm package into www/pkg
wasm-pack build --release --target web --out-dir www/pkg

# serve www/ locally (ES module imports need an http server, not file://)
cd www
python3 -m http.server 8080
# visit http://localhost:8080
```
