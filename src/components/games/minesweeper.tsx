"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { useEffect, useMemo, useReducer, useRef } from "react";

// Classic types and constants
type Mark = 0 | 1 | 2; // 0: none, 1: flag, 2: question
type Cell = { open: boolean; mark: Mark; count: number | null };
type GameConfig = { width: number; height: number; mines: number };
type Screen = "playing" | "won" | "lost";

type State = {
  screen: Screen;
  config: GameConfig;
  field: Cell[];
  generated: boolean;
  running: boolean;
  timerMs: number;
  openedSafeCount: number;
};

type Action =
  | { type: "RESET" }
  | { type: "GENERATE"; safeIndex: number }
  | { type: "OPEN"; index: number }
  | { type: "CYCLE_MARK"; index: number }
  | { type: "CHORD"; index: number }
  | {
      type: "APPLY";
      field?: Cell[];
      screen?: Screen;
      running?: boolean;
      generated?: boolean;
      openedSafeDelta?: number;
    };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESET":
      return initialState(state.config);
    case "GENERATE":
      return { ...state, generated: true, running: true, screen: "playing" };
    case "OPEN": {
      if (state.screen !== "playing") return state;
      const next = { ...state };
      const field = next.field.slice();
      const c = field[action.index];
      if (c.open || c.mark === 1) return state;
      next.field = field;
      return next;
    }
    case "CYCLE_MARK": {
      if (state.screen !== "playing") return state;
      const field = state.field.slice();
      const c = field[action.index];
      if (c.open) return state;
      c.mark = ((c.mark + 1) % 3) as Mark;
      return { ...state, field };
    }
    case "CHORD":
      return state; // handled in component using encrypted board to avoid exposing mines in state
    case "APPLY": {
      const next: State = { ...state };
      if (action.field) next.field = action.field;
      if (typeof action.screen !== "undefined") next.screen = action.screen;
      if (typeof action.running !== "undefined") next.running = action.running;
      if (typeof action.generated !== "undefined")
        next.generated = action.generated;
      if (typeof action.openedSafeDelta === "number")
        next.openedSafeCount = state.openedSafeCount + action.openedSafeDelta;
      return next;
    }
    default:
      return state;
  }
}

// Helpers
const buildEmptyField = (w: number, h: number): Cell[] =>
  Array.from({ length: w * h }, () => ({ open: false, mark: 0, count: null }));
const idxToXY = (i: number, w: number) => ({ x: i % w, y: Math.floor(i / w) });
const inBounds = (x: number, y: number, w: number, h: number) =>
  x >= 0 && y >= 0 && x < w && y < h;
const neighborDeltas = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
] as const;

function neighborsOf(index: number, width: number, height: number): number[] {
  const { x, y } = idxToXY(index, width);
  const out: number[] = [];
  for (const [dx, dy] of neighborDeltas) {
    const nx = x + dx;
    const ny = y + dy;
    if (inBounds(nx, ny, width, height)) out.push(ny * width + nx);
  }
  return out;
}

function countFlagsAround(
  field: Cell[],
  index: number,
  width: number,
  height: number,
): number {
  return neighborsOf(index, width, height).reduce(
    (acc, i) => acc + (field[i].mark === 1 ? 1 : 0),
    0,
  );
}
// Encrypted board held outside React state
type EncryptedBoard = {
  width: number;
  height: number;
  mines: number;
  enc: Uint8Array;
  key: Uint8Array;
  generated: boolean;
  generate: (safeIndex: number) => void;
  isMine: (index: number) => boolean;
  countAt: (index: number) => number;
};

function createEncryptedBoard(
  width: number,
  height: number,
  mines: number,
): EncryptedBoard {
  const total = width * height;
  const enc = new Uint8Array(total);
  const key = new Uint8Array(total);
  let generated = false;

  function ensureKey() {
    if (!generated) return;
    // keys already set during generate
  }

  function generate(safeIndex: number) {
    // Fill key with cryptographically-strong random bytes
    crypto.getRandomValues(key);
    const forbidden = new Set<number>([
      safeIndex,
      ...neighborsOf(safeIndex, width, height),
    ]);
    let placed = 0;
    while (placed < mines) {
      const idx = Math.floor(Math.random() * total);
      if (forbidden.has(idx)) continue;
      // write plaintext 1 into enc, will be XORed for storage
      if (((enc[idx] ^ key[idx]) & 1) === 0) {
        enc[idx] = key[idx] ^ 1;
        placed++;
      }
    }
    generated = true;
  }

  function isMine(index: number): boolean {
    if (!generated) return false;
    ensureKey();
    return ((enc[index] ^ key[index]) & 1) === 1;
  }

  function countAt(index: number): number {
    const { x, y } = idxToXY(index, width);
    let c = 0;
    for (const [dx, dy] of neighborDeltas) {
      const nx = x + dx,
        ny = y + dy;
      if (inBounds(nx, ny, width, height)) {
        const ni = ny * width + nx;
        if (isMine(ni)) c++;
      }
    }
    return c;
  }

  return {
    width,
    height,
    mines,
    enc,
    key,
    generated,
    generate,
    isMine,
    countAt,
  };
}

function floodOpenWithBoard(
  field: Cell[],
  index: number,
  board: EncryptedBoard,
): number {
  const width = board.width,
    height = board.height;
  const queue: number[] = [index];
  const seen = new Set<number>();
  let opened = 0;
  while (queue.length) {
    const cur = queue.shift()!;
    if (seen.has(cur)) continue;
    seen.add(cur);
    const c = field[cur];
    if (c.open || c.mark === 1) continue;
    if (board.isMine(cur)) continue; // safety
    c.open = true;
    const count = board.countAt(cur);
    c.count = count;
    opened++;
    if (count !== 0) continue;
    for (const ni of neighborsOf(cur, width, height)) {
      const n = field[ni];
      if (!n.open && n.mark !== 1) queue.push(ni);
    }
  }
  return opened;
}

function clampMines(width: number, height: number, mines: number): number {
  const max = Math.max(1, (width - 1) * (height - 1));
  const min = 10;
  return Math.max(min, Math.min(max, mines));
}

const initialState = (config: GameConfig): State => ({
  screen: "playing",
  config,
  field: buildEmptyField(config.width, config.height),
  generated: false,
  running: false,
  timerMs: 0,
  openedSafeCount: 0,
});

export default function Minesweeper() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const fixedConfig: GameConfig = { width: 16, height: 16, mines: 40 };
  const [state, dispatch] = useReducer(reducer, fixedConfig, initialState);
  const boardRef = useRef<EncryptedBoard>(
    createEncryptedBoard(
      fixedConfig.width,
      fixedConfig.height,
      fixedConfig.mines,
    ),
  );

  // Cell size responsive
  const [cellSizePx, setCellSizePx] = React.useState<number>(24);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const { width } = el.getBoundingClientRect();
      const cols = state.config.width;
      const gap = 2;
      const inner = Math.max(0, width - (cols - 1) * gap - 4);
      const tentative = Math.floor(inner / cols);
      setCellSizePx(Math.max(18, Math.min(40, tentative)));
    };
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    compute();
    return () => ro.disconnect();
  }, [state.config.width]);

  const flagsUsed = useMemo(
    () => state.field.reduce((acc, c) => acc + (c.mark === 1 ? 1 : 0), 0),
    [state.field],
  );
  const remainingMines = Math.max(0, state.config.mines - flagsUsed);

  const handleMouseDown = (idx: number) => (e: React.MouseEvent) => {
    if (state.screen !== "playing") return;
    // Both buttons pressed
    if (e.buttons & 1 && e.buttons & 2) {
      e.preventDefault();
      if (!state.generated) {
        boardRef.current.generate(idx);
        dispatch({ type: "GENERATE", safeIndex: idx });
      }
      const field = state.field.slice();
      const before = state.openedSafeCount;
      const { width, height } = state.config;
      const c = field[idx];
      if (!c.open || (c.count ?? 0) <= 0) return;
      const flags = countFlagsAround(field, idx, width, height);
      if (flags !== (c.count ?? 0)) return;
      const ns = neighborsOf(idx, width, height);
      let openedDelta = 0;
      for (const ni of ns) {
        const n = field[ni];
        if (!n.open && n.mark !== 1) {
          if (boardRef.current.isMine(ni)) {
            const revealed = field.slice();
            for (let i = 0; i < revealed.length; i++) {
              if (boardRef.current.isMine(i)) {
                revealed[i].open = true;
                revealed[i].count = null;
              }
            }
            dispatch({ type: "APPLY", field: revealed, screen: "lost" });
            return;
          }
          n.open = true;
          const cnt = boardRef.current.countAt(ni);
          n.count = cnt;
          openedDelta++;
          if (cnt === 0)
            openedDelta += floodOpenWithBoard(field, ni, boardRef.current);
        }
      }
      const totalSafe =
        state.config.width * state.config.height - state.config.mines;
      const after = before + openedDelta;
      if (after >= totalSafe) {
        dispatch({
          type: "APPLY",
          field,
          screen: "won",
          openedSafeDelta: openedDelta,
        });
      } else {
        dispatch({ type: "APPLY", field, openedSafeDelta: openedDelta });
      }
      return;
    }
    if (e.button === 0) {
      e.preventDefault();
      if (!state.generated) {
        boardRef.current.generate(idx);
        dispatch({ type: "GENERATE", safeIndex: idx });
      }
      const field = state.field.slice();
      const cell = field[idx];
      if (cell.open || cell.mark === 1) return;
      if (boardRef.current.isMine(idx)) {
        for (let i = 0; i < field.length; i++) {
          if (boardRef.current.isMine(i)) {
            field[i].open = true;
            field[i].count = null;
          }
        }
        dispatch({ type: "APPLY", field, screen: "lost" });
        return;
      }
      let openedDelta = 0;
      cell.open = true;
      const cnt = boardRef.current.countAt(idx);
      cell.count = cnt;
      openedDelta++;
      if (cnt === 0)
        openedDelta += floodOpenWithBoard(field, idx, boardRef.current);
      const totalSafe =
        state.config.width * state.config.height - state.config.mines;
      if (state.openedSafeCount + openedDelta >= totalSafe) {
        dispatch({
          type: "APPLY",
          field,
          screen: "won",
          openedSafeDelta: openedDelta,
        });
      } else {
        dispatch({ type: "APPLY", field, openedSafeDelta: openedDelta });
      }
    } else if (e.button === 2) {
      e.preventDefault();
      dispatch({ type: "CYCLE_MARK", index: idx });
    }
  };

  const handleContextMenu = (idx: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch({ type: "CYCLE_MARK", index: idx });
  };

  const longPressTimer = useRef<number | null>(null);
  const touchDown = (idx: number) => (e: React.PointerEvent) => {
    if (state.screen !== "playing") return;
    if (e.pointerType !== "touch") return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    longPressTimer.current = window.setTimeout(
      () => dispatch({ type: "CYCLE_MARK", index: idx }),
      450,
    );
  };
  const touchUp = (idx: number) => (e: React.PointerEvent) => {
    if (state.screen !== "playing") return;
    if (e.pointerType !== "touch") return;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      dispatch({ type: "OPEN", index: idx });
    }
  };

  // UI
  const TopBar = () => (
    <div className="flex items-center justify-between gap-2">
      <div className="px-2 py-0.5 border-2 border-foreground bg-input text-xs shadow-sm whitespace-nowrap">
        Mines: {state.config.mines} • Remaining: {remainingMines}
      </div>
      <Button
        size="sm"
        className="h-8 border-2 border-foreground"
        onClick={() => {
          boardRef.current = createEncryptedBoard(
            state.config.width,
            state.config.height,
            state.config.mines,
          );
          dispatch({ type: "RESET" });
        }}
      >
        Reset
      </Button>
    </div>
  );

  const Grid = () => (
    <div className="relative flex-1 min-h-0 overflow-hidden border-2 border-foreground bg-card">
      <div
        ref={containerRef}
        className="h-full w-full min-w-0 min-h-0 overflow-auto p-1"
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${state.config.width}, ${cellSizePx}px)`,
            gap: 2,
          }}
        >
          {state.field.map((cell, idx) => {
            const showBomb =
              state.screen === "lost" && boardRef.current.isMine(idx);
            const label = showBomb
              ? "mine"
              : cell.open
                ? String(cell.count ?? 0)
                : cell.mark === 1
                  ? "flag"
                  : cell.mark === 2
                    ? "maybe"
                    : "hidden";
            return (
              <button
                key={idx}
                onMouseDown={handleMouseDown(idx)}
                onContextMenu={handleContextMenu(idx)}
                onPointerDown={touchDown(idx)}
                onPointerUp={touchUp(idx)}
                className={cn(
                  "flex items-center justify-center border-2 border-foreground font-mono text-[12px] transition-colors select-none focus:outline-none",
                  cell.open || showBomb
                    ? "bg-muted"
                    : "bg-input hover:bg-muted",
                )}
                style={{ width: cellSizePx, height: cellSizePx }}
                aria-label={label}
              >
                {showBomb
                  ? "💣"
                  : cell.open
                    ? cell.count && cell.count > 0
                      ? cell.count
                      : ""
                    : cell.mark === 1
                      ? "🚩"
                      : cell.mark === 2
                        ? "?"
                        : ""}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-2 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <TopBar />
      <Grid />
      <div className="text-[11px] text-muted-foreground px-1">
        Left-click: open • Right-click: flag/question • Double-click or
        both-buttons: chord
      </div>
    </div>
  );
}
