//! Whole Year Puzzle solver.
//!
//! Board is a 7x7 grid (49 cells), row-major indexed 0..49.
//! Row 0: Jan..Jun (idx 0-5), idx 6 blocked.
//! Row 1: Jul..Dec (idx 7-12), idx 13 blocked.
//! Rows 2-5: days 1-28 (idx 14-41, 7 per row).
//! Row 6: days 29-31 at idx 44-46, idx 42,43,47,48 blocked.
//!
//! Solving = exact cover: place all 9 polyomino pieces (41 cells total) onto
//! the 43 playable cells, leaving exactly the target month cell and target
//! day cell uncovered.

use serde::Serialize;
use std::sync::OnceLock;
use wasm_bindgen::prelude::*;

const W: i32 = 7;
const H: i32 = 7;
const N: usize = (W * H) as usize; // 49
const NUM_PIECES: u8 = 9;

// ---------------------------------------------------------------------
// Board layout
// ---------------------------------------------------------------------

fn is_blocked(idx: usize) -> bool {
    matches!(idx, 6 | 13 | 42 | 43 | 47 | 48)
}

/// month is 0-11 (Jan=0 .. Dec=11)
fn month_to_idx(month: u8) -> usize {
    if month < 6 {
        month as usize
    } else {
        7 + (month as usize - 6)
    }
}

fn idx_to_month(idx: usize) -> Option<u8> {
    if idx < 6 {
        Some(idx as u8)
    } else if (7..=12).contains(&idx) {
        Some((idx - 1) as u8)
    } else {
        None
    }
}

/// day is 1-31
fn day_to_idx(day: u8) -> usize {
    if day <= 28 {
        13 + day as usize
    } else {
        44 + (day as usize - 29)
    }
}

fn idx_to_day(idx: usize) -> Option<u8> {
    if (14..=41).contains(&idx) {
        Some((idx - 13) as u8)
    } else if (44..=46).contains(&idx) {
        Some((idx - 44 + 29) as u8)
    } else {
        None
    }
}

fn playable_mask() -> u64 {
    let mut m = 0u64;
    for idx in 0..N {
        if !is_blocked(idx) {
            m |= 1 << idx;
        }
    }
    m
}

// ---------------------------------------------------------------------
// Pieces (offsets as (row, col)), ids 0-8, matching the physical puzzle
// ---------------------------------------------------------------------

fn piece_defs() -> [Vec<(i32, i32)>; 9] {
    [
        // 0: U-pentomino
        vec![(0, 0), (0, 2), (1, 0), (1, 1), (1, 2)],
        // 1: O-tetromino (square)
        vec![(0, 0), (0, 1), (1, 0), (1, 1)],
        // 2: X-pentomino (plus)
        vec![(0, 1), (1, 0), (1, 1), (1, 2), (2, 1)],
        // 3: S/Z-tetromino
        vec![(0, 0), (1, 0), (1, 1), (2, 1)],
        // 4: T-tetromino
        vec![(0, 0), (0, 1), (0, 2), (1, 1)],
        // 5: J-tetromino
        vec![(0, 0), (0, 1), (1, 0), (2, 0)],
        // 6: P-pentomino
        vec![(0, 1), (1, 0), (1, 1), (2, 0), (2, 1)],
        // 7: L-pentomino
        vec![(0, 0), (1, 0), (2, 0), (3, 0), (3, 1)],
        // 8: N-pentomino
        vec![(0, 0), (0, 1), (1, 1), (2, 1), (2, 2)],
    ]
}

fn rotate90(cells: &[(i32, i32)]) -> Vec<(i32, i32)> {
    cells.iter().map(|&(r, c)| (c, -r)).collect()
}

fn reflect(cells: &[(i32, i32)]) -> Vec<(i32, i32)> {
    cells.iter().map(|&(r, c)| (r, -c)).collect()
}

fn normalize(cells: &[(i32, i32)]) -> Vec<(i32, i32)> {
    let min_r = cells.iter().map(|c| c.0).min().unwrap();
    let min_c = cells.iter().map(|c| c.1).min().unwrap();
    let mut v: Vec<(i32, i32)> = cells.iter().map(|&(r, c)| (r - min_r, c - min_c)).collect();
    v.sort();
    v
}

fn all_orientations(base: &[(i32, i32)]) -> Vec<Vec<(i32, i32)>> {
    let mut variants = vec![];
    let mut cur = base.to_vec();
    for _ in 0..4 {
        variants.push(normalize(&cur));
        variants.push(normalize(&reflect(&cur)));
        cur = rotate90(&cur);
    }
    variants.sort();
    variants.dedup();
    variants
}

struct Placement {
    piece: u8,
    mask: u64,
}

fn gen_placements() -> Vec<Placement> {
    let mut placements = vec![];
    for (pid, base) in piece_defs().iter().enumerate() {
        for orient in all_orientations(base) {
            let max_r = orient.iter().map(|c| c.0).max().unwrap();
            let max_c = orient.iter().map(|c| c.1).max().unwrap();
            for base_r in 0..(H - max_r) {
                for base_c in 0..(W - max_c) {
                    let mut mask = 0u64;
                    let mut ok = true;
                    for &(dr, dc) in &orient {
                        let r = base_r + dr;
                        let c = base_c + dc;
                        let idx = (r * W + c) as usize;
                        if is_blocked(idx) {
                            ok = false;
                            break;
                        }
                        mask |= 1 << idx;
                    }
                    if ok {
                        placements.push(Placement {
                            piece: pid as u8,
                            mask,
                        });
                    }
                }
            }
        }
    }
    placements
}

fn placements() -> &'static Vec<Placement> {
    static P: OnceLock<Vec<Placement>> = OnceLock::new();
    P.get_or_init(gen_placements)
}

/// index -> list of placement indices that cover that cell
fn by_cell() -> &'static Vec<Vec<usize>> {
    static BC: OnceLock<Vec<Vec<usize>>> = OnceLock::new();
    BC.get_or_init(|| {
        let ps = placements();
        let mut bc: Vec<Vec<usize>> = vec![Vec::new(); N];
        for (i, p) in ps.iter().enumerate() {
            for b in 0..N {
                if p.mask & (1 << b) != 0 {
                    bc[b].push(i);
                }
            }
        }
        bc
    })
}

// ---------------------------------------------------------------------
// Solver
// ---------------------------------------------------------------------

const ALL_PIECES_MASK: u16 = (1 << NUM_PIECES) - 1;

fn build_grid(chosen: &[usize], target_mask: u64) -> Vec<i8> {
    let mut grid = vec![0i8; N];
    for idx in 0..N {
        grid[idx] = if is_blocked(idx) {
            -1
        } else if target_mask & (1 << idx) != 0 {
            -2
        } else {
            -3 // filled in below; sentinel shouldn't survive
        };
    }
    let ps = placements();
    for &pi in chosen {
        let p = &ps[pi];
        for idx in 0..N {
            if p.mask & (1 << idx) != 0 {
                grid[idx] = p.piece as i8;
            }
        }
    }
    grid
}

fn backtrack(
    play_mask: u64,
    used_mask: u64,
    used_pieces: u16,
    chosen: &mut Vec<usize>,
    solutions: &mut Vec<Vec<i8>>,
    target_mask: u64,
) {
    let remaining = play_mask & !used_mask;
    if remaining == 0 {
        if used_pieces == ALL_PIECES_MASK {
            solutions.push(build_grid(chosen, target_mask));
        }
        return;
    }
    let cell = remaining.trailing_zeros() as usize;
    let bc = by_cell();
    let ps = placements();
    for &pi in &bc[cell] {
        let p = &ps[pi];
        let pbit = 1u16 << p.piece;
        if used_pieces & pbit != 0 {
            continue;
        }
        if p.mask & used_mask != 0 {
            continue;
        }
        chosen.push(pi);
        backtrack(
            play_mask,
            used_mask | p.mask,
            used_pieces | pbit,
            chosen,
            solutions,
            target_mask,
        );
        chosen.pop();
    }
}

fn solve_all_internal(month: u8, day: u8) -> Vec<Vec<i8>> {
    let month_idx = month_to_idx(month.min(11));
    let day_idx = day_to_idx(day.clamp(1, 31));
    let target_mask = (1u64 << month_idx) | (1u64 << day_idx);
    let play_mask = playable_mask();

    let mut solutions = vec![];
    let mut chosen = Vec::with_capacity(NUM_PIECES as usize);
    backtrack(play_mask, target_mask, 0, &mut chosen, &mut solutions, target_mask);
    solutions
}

// ---------------------------------------------------------------------
// wasm-bindgen surface
// ---------------------------------------------------------------------

#[derive(Serialize)]
struct BoardCell {
    kind: &'static str,
    value: i32,
}

fn board_cells() -> Vec<BoardCell> {
    (0..N)
        .map(|idx| {
            if is_blocked(idx) {
                BoardCell { kind: "blocked", value: -1 }
            } else if let Some(m) = idx_to_month(idx) {
                BoardCell { kind: "month", value: m as i32 }
            } else if let Some(d) = idx_to_day(idx) {
                BoardCell { kind: "day", value: d as i32 }
            } else {
                unreachable!("every non-blocked cell is a month or day cell")
            }
        })
        .collect()
}

/// Returns an array of 49 { kind, value } objects describing the board.
#[wasm_bindgen]
pub fn get_board() -> JsValue {
    serde_wasm_bindgen::to_value(&board_cells()).unwrap()
}

/// Returns an array of solutions. Each solution is an array of 49 i8s:
/// -1 = blocked cell, -2 = open (uncovered target) cell, 0-8 = piece id.
#[wasm_bindgen]
pub fn solve_all(month: u8, day: u8) -> JsValue {
    let solutions = solve_all_internal(month, day);
    serde_wasm_bindgen::to_value(&solutions).unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn board_indices_match_known_solution() {
        // From the reference solver: July 19 -> month idx 7, day idx 32
        assert_eq!(month_to_idx(6), 7); // July = index 6 (0-based)
        assert_eq!(day_to_idx(19), 32);
        assert_eq!(day_to_idx(30), 45);
    }

    #[test]
    fn every_piece_has_at_least_one_placement() {
        let ps = placements();
        for pid in 0..NUM_PIECES {
            assert!(ps.iter().any(|p| p.piece == pid), "piece {pid} has no placements");
        }
    }

    #[test]
    fn finds_solutions_for_a_known_date() {
        // July 19th is the date solved in the reference blog post/solver.
        let sols = solve_all_internal(6, 19);
        assert!(!sols.is_empty(), "expected at least one solution for Jul 19");
        for grid in &sols {
            assert_eq!(grid.len(), N);
        }
    }

    #[test]
    fn every_day_has_a_solution() {
        for month in 0..12u8 {
            for day in 1..=31u8 {
                let sols = solve_all_internal(month, day);
                assert!(
                    !sols.is_empty(),
                    "no solution found for month {month} day {day}"
                );
            }
        }
    }
}
