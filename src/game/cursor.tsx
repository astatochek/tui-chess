import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  type ParentComponent,
  useContext,
} from "solid-js";
import { isNil, type Nil } from "@app/utils.ts";
import { BOARD_SIZE, Pos, type Promotable } from "@app/game/model.ts";
import { useChess } from "@app/game/chess.tsx";
import { useKeyboard } from "@opentui/solid";
import { Result } from "better-result";
import { firstValueFrom, Subject } from "rxjs";

export function useCursor() {
  const ctx = useContext(CursorContext);
  if (isNil(ctx)) {
    throw new Error(`CursorContextProvider was not used`);
  }
  return ctx;
}

export const CursorContextProvider: ParentComponent = (props) => {
  return (
    <CursorContext.Provider value={CursorConstructor()}>{props.children}</CursorContext.Provider>
  );
};

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

  const moves = createMemo(() => {
    const from = held() ?? hovered();
    if (!from) {
      return [];
    }
    return chess.moves(from.square).map((m) => m.to);
  });

  useKeyboard((key) => {
    if (key.ctrl || key.shift) {
      return;
    }
    if (showPromotionDialog() || chess.gameEnd()) {
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
      Result.gen(holdOrTryMove).then((res) => {
        if (res.isErr()) {
          console.error(res.error);
        }
      });
    }
  });

  async function* holdOrTryMove() {
    console.log("Holding handler");
    const holdingSquare = held()?.square;
    const canHold = chess.turn() === hovered().pieceColor;
    if (canHold) {
      const isHoldingTheHovered = hovered().square === holdingSquare;
      setHoldingPos(isHoldingTheHovered ? void 0 : hoverPos());
      return Result.ok();
    }
    if (!isNil(holdingSquare)) {
      const isPromotion =
        held()?.piece === "p" && (hoverPos().x === 0 || hoverPos().x === BOARD_SIZE - 1);
      let promotion: Promotable | Nil = void 0;
      if (isPromotion) {
        console.log("Selecting a promotion");
        setShowPromotionDialog(true);
        promotion = await firstValueFrom(promoted);
        console.log("Promoted to:", promotion);
      }
      console.log("Attempting to move from:", holdingSquare);
      yield* chess.move(holdingSquare, hovered().square, promotion);
      setHoldingPos(void 0);
      console.log("Moved to:", hovered().square);
    }
    return Result.ok();
  }

  createEffect(() => console.log("Holding:", held(), holdingPos()));
  createEffect(() => console.log("Hover:", hovered(), holdingPos()));

  const [showPromotionDialog, setShowPromotionDialog] = createSignal(false);

  const promoted = new Subject<Promotable>();

  function promoteTo(p: Promotable) {
    promoted.next(p);
    setShowPromotionDialog(false);
  }

  return { hovered, held, moves, showPromotionDialog, promoteTo };
}

type CursorStore = ReturnType<typeof CursorConstructor>;
const CursorContext = createContext<CursorStore>();
