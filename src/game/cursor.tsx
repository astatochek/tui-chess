import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  type ParentComponent,
  useContext,
} from "solid-js";
import { isNil, type Nil } from "@app/utils.ts";
import { Pos } from "@app/game/model.ts";
import { useChess } from "@app/game/chess.tsx";
import { useKeyboard } from "@opentui/solid";
import { Result } from "better-result";

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
  const held = createMemo(() => {
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
    if (key.name === "k" || key.name === "up" || key.name === "w") {
      setHoverPos((pos) => pos.up());
    }
    if (key.name === "j" || key.name === "down" || key.name === "s") {
      setHoverPos((pos) => pos.down());
    }
    if (key.name === "l" || key.name === "right" || key.name === "d") {
      setHoverPos((pos) => pos.right());
    }
    if (key.name === "h" || key.name === "left" || key.name === "a") {
      setHoverPos((pos) => pos.left());
    }
    if (key.name === "space") {
      const res = Result.gen(holdOrTryMove);
      if (res.isErr()) {
        console.error(res.error);
      }
    }
  });

  function* holdOrTryMove() {
    console.log("Holding handler");
    const holdingSquare = held()?.square;
    const canHold = chess.turn() === hovered().pieceColor;
    if (canHold) {
      setHoldingPos(hoverPos());
      console.log("Available moves:", chess.moves(held()!.square));
      return Result.ok();
    }
    if (!isNil(holdingSquare)) {
      console.log("Attempting to move from:", holdingSquare);
      yield* chess.move(holdingSquare, hovered().square);
      setHoldingPos(void 0);
      console.log("Moved to:", hovered().square);
    }
    return Result.ok();
  }

  createEffect(() => console.log("Holding:", held(), holdingPos()));
  createEffect(() => console.log("Hover:", hovered(), holdingPos()));

  return { hovered, held };
}

type CursorStore = ReturnType<typeof CursorConstructor>;
const CursorContext = createContext<CursorStore>();
