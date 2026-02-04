import type { Game } from "@app/game/game.tsx";
import { useChess } from "@app/game/chess.tsx";
import type { Color, Move, Square } from "chess.js";
import type { Promotable } from "@app/game/model.ts";
import type { Nil } from "@app/utils.ts";
import { Result } from "better-result";

export class GameAgainstComputer implements Game {
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
      setTimeout(() => this.moveAsComputer(), 500);
      return res.value;
    }
  }

  private moveAsComputer(): void {
    if (this.chess.turn() === this.youArePlayingAs || this.chess.gameEnd()) {
      return;
    }
    const moves = this.chess.allMoves();
    const move = moves[Math.floor(Math.random() & moves.length)]!;
    const res = Result.gen(() =>
      this.chess.move(move.from, move.to, move.promotion as Promotable | Nil),
    );
    if (res.isErr()) {
      console.error("Failed to perform a move a Computer:", res.error);
      this.moveAsComputer();
    }
  }
}
