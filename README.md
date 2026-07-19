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

## Deploying to GitHub Pages

This repo includes `.github/workflows/deploy.yml`, which builds the wasm
package and publishes the `www/` folder to GitHub Pages automatically on
every push to `main`.

One-time setup in your GitHub repo:

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Push to `main` (or run the workflow manually from the **Actions** tab).

Your site will be live at:
- `https://<username>.github.io/` if this is your `<username>.github.io` repo, or
- `https://<username>.github.io/<repo-name>/` if it's a regular project repo.

All paths in `index.html`/`main.js` are relative, so both cases work
without changes.
