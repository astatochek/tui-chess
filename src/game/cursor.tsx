import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  type ParentComponent,
  useContext,
} from "solid-js";
import { isNil, type Nil } from "@app/utils.ts";
import type { Square } from "chess.js";
import { Pos } from "@app/game/model.ts";
import { useChess } from "@app/game/chess.tsx";
import { createElement, useKeyboard } from "@opentui/solid";

export function useCursor() {
  const ctx = useContext(CursorContext);
  if (isNil(ctx)) {
    throw new Error(`CursorContextProvider was not used`);
  }
  return ctx;
}

export const CursorContextProvider: ParentComponent = (props) => (
  <CursorContext.Provider value={CursorConstructor()}>{props.children}</CursorContext.Provider>
);

function CursorConstructor() {
  const chess = useChess();

  const [hoverPos, setHoverPos] = createSignal(Pos.rdn());
  const hovered = createMemo(() => chess.board().at(hoverPos()));

  const [holdingPos, setHoldingPos] = createSignal<Pos | Nil>(void 0);
  const holding = createMemo(() => {
    const pos = holdingPos();
    if (!pos) {
      return;
    }
    return chess.board().at(pos);
  });

  useKeyboard((key) => {
    if (key.ctrl || key.shift) {
      return;
    }
    if (key.name === "k" || key.name === "up") {
      setHoverPos((pos) => pos.up());
    }
    if (key.name === "j" || key.name === "down") {
      setHoverPos((pos) => pos.down());
    }
    if (key.name === "l" || key.name === "right") {
      setHoverPos((pos) => pos.right());
    }
    if (key.name === "h" || key.name === "left") {
      setHoverPos((pos) => pos.left());
    }
    if (key.name === "space") {
      const holdingSquare = holding()?.square;
      if (isNil(holdingSquare)) {
        const canHold = chess.turn() === hovered().pieceColor;
        if (canHold) {
          setHoldingPos(hoverPos());
        }
      } else {
        const moves = chess.moves(holdingSquare);
        if (moves.includes(hovered().square)) {
          chess.move(holdingSquare, hovered().square);
          setHoldingPos(void 0);
        }
      }
    }
  });

  return { hovered, holding };
}

type CursorStore = ReturnType<typeof CursorConstructor>;
const CursorContext = createContext<CursorStore>();
