import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  type ParentComponent,
  useContext,
} from "solid-js";
import { Chess, type Square } from "chess.js";
import { identity, isNil } from "@app/utils.ts";
import { Board, BOARD_SIZE, ColoredSquare, MoveError, Pos } from "@app/game/model.ts";
import { Result } from "better-result";

export function useChess() {
  const ctx = useContext(ChessContext);
  if (isNil(ctx)) {
    throw new Error(`ChessContextProvider was not used`);
  }
  return ctx;
}

export const ChessContextProvider: ParentComponent = (props) => (
  <ChessContext.Provider value={ChessStoreConstructor()}>{props.children}</ChessContext.Provider>
);

const ChessContext = createContext<ChessStore>();

type ChessStore = ReturnType<typeof ChessStoreConstructor>;

function ChessStoreConstructor() {
  const [chess, setChess] = createSignal(new Chess(), { equals: false });
  const board = createMemo<Board>(
    (prev) => prev.update(Board.toBoard(chess().board())),
    Board.toBoard(chess().board()),
    { equals: false },
  );
  const turn = () => chess().turn();
  function moves(square: Square) {
    return chess().moves({ square, verbose: true });
  }
  function* move(from: Square, to: Square) {
    const prev = chess();
    const move = yield* Result.try({
      try: () => prev.move({ from, to }),
      catch: (e) => new MoveError(e),
    });
    setChess(identity);
    return move;
  }

  createEffect(() => console.log("Turn:", turn()));
  return { board, turn, moves, move };
}
