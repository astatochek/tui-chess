import {
  createContext,
  createMemo,
  createSignal,
  type ParentComponent,
  useContext,
} from "solid-js";
import { Chess, type Square } from "chess.js";
import { isNil } from "@app/utils.ts";
import { Board, BOARD_SIZE, ColoredSquare, Pos } from "@app/game/model.ts";

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
    return chess().moves({ square });
  }
  function move(from: Square, to: Square) {
    setChess((prev) => {
      prev.move({ from, to });
      return prev;
    });
  }
  return { board, turn, moves, move };
}
