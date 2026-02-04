import {
  createContext,
  createMemo,
  createSignal,
  type ParentComponent,
  useContext,
} from "solid-js";
import { Chess, type Move, type Square } from "chess.js";
import { identity, isNil, type Nil } from "@app/utils.ts";
import { Board, GameEnd, MoveError, type Promotable } from "@app/game/model.ts";
import { Err, Result } from "better-result";

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

const FEN = {
  NEXT_MOVE_IS_A_PROMOTION: "4k3/P7/8/8/8/8/8/4K3 w - - 0 1",
  WHITE_MATE_IN_ONE: "4k3/8/5Q2/8/8/8/8/4KR2 w - - 0 1",
  BLACK_MATE_IN_ONE: "k7/8/8/8/8/5qn1/8/4K3 b - - 0 1",
  STALEMATE_IN_ONE: "k7/8/1QK5/8/8/8/8/8 w - - 0 1",
} as const;

function ChessStoreConstructor() {
  const [chess, setChess] = createSignal(new Chess(FEN.WHITE_MATE_IN_ONE), {
    equals: false,
  });
  const board = createMemo<Board>(
    (prev) => prev.update(Board.toBoard(chess().board())),
    Board.toBoard(chess().board()),
    { equals: false },
  );
  const turn = () => chess().turn();
  const history = () => [...chess().history()].reverse();

  function moves(square: Square) {
    return chess().moves({ square, verbose: true });
  }
  function* move(from: Square, to: Square, promotion: Promotable | Nil) {
    const prev = chess();
    const move = yield* Result.try({
      try: () => prev.move({ from, to, promotion: promotion ?? void 0 }),
      catch: (e) => new MoveError(e),
    });
    setChess(identity);
    return Result.ok(move);
  }

  const gameEnd = createMemo(() => {
    const game = chess();
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        return game.turn() === "w" ? new GameEnd.BlackWins() : new GameEnd.WhiteWins();
      } else {
        return new GameEnd.Draw();
      }
    }
  });

  return { board, turn, moves, move, history, gameEnd };
}
