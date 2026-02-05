import type { Game } from "@app/game/game.tsx";
import { useChess } from "@app/game/chess.tsx";
import type { Color, Move, Square } from "chess.js";
import { EngineError, Mode, type Promotable } from "@app/game/model.ts";
import type { Nil } from "@app/utils.ts";
import { Result } from "better-result";
import { Game as EngineGame } from "js-chess-engine";

export class GameAgainstJsChessEngine implements Game {
  readonly tag = Mode.AGAINST_CHESS_JS_ENGINE;
  private readonly chess = useChess();
  private readonly youArePlayingAs: Color = Math.random() > 0.5 ? "w" : "b";

  readonly playingAs = () => this.youArePlayingAs;

  constructor() {
    if (this.youArePlayingAs === "b") {
      this.moveAsComputer();
    }
  }

  canMove(): boolean {
    return this.chess.turn() === this.youArePlayingAs && !this.chess.gameEnd();
  }

  move(from: Square, to: Square, promotion: Promotable | Nil): Move | Nil {
    const res = Result.gen(() => this.chess.move(from, to, promotion));
    if (res.isErr()) {
      console.error(res.error);
    } else {
      setTimeout(() => this.moveAsComputer(), 1);
      return res.value;
    }
  }

  private async moveAsComputer() {
    if (this.chess.turn() === this.youArePlayingAs || this.chess.gameEnd()) {
      return;
    }

    const res = await Result.gen(() => this.tryPerformEngineMove());
    if (res.isErr()) {
      console.error("Failed to perform engine move", res.error);
      this.moveAsComputer();
    }
  }

  private async *tryPerformEngineMove() {
    const move = yield* await Result.tryPromise({
      try: () => this.getEngineMove(this.chess.fen(), 3),
      catch: (c) => new EngineError(c),
    });
    return yield* this.chess.move(move.from, move.to, move.promotion);
  }

  private async getEngineMove(fen: string, level: 1 | 2 | 3 | 4 | 5): Promise<ChessEngineMove> {
    const game = new EngineGame(fen);

    const moveResult = game.ai({ level });

    // moveResult is like { "E2": "E4" }
    const [from, to] = Object.entries(moveResult.move)[0] as [string, string];

    // Convert to lowercase for chess.js compatibility
    const fromSquare = from.toLowerCase() as Square;
    const toSquare = to.toLowerCase() as Square;

    // Detect promotion
    let promotion: "q" | "r" | "b" | "n" | undefined;

    // Get board state to check for pawn promotion
    const board = game.exportJson();
    const piece = board.pieces[from];

    // If it's a pawn moving to the last rank
    if (piece && piece.toLowerCase() === "p") {
      const targetRank = toSquare[1];
      if (targetRank === "8" || targetRank === "1") {
        promotion = "q";
      }
    }

    return {
      from: fromSquare,
      to: toSquare,
      promotion,
    };
  }
}

type ChessEngineMove = {
  from: Square;
  to: Square;
  promotion?: Promotable;
};
