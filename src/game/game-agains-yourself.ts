import type { Game } from "@app/game/game.tsx";
import { useChess } from "@app/game/chess.tsx";
import type { Move, Square } from "chess.js";
import { Mode, type Promotable } from "@app/game/model.ts";
import type { Nil } from "@app/utils.ts";
import { Result } from "better-result";

export class GameAgainstYourself implements Game {
  readonly tag = Mode.AGAINST_YOURSELF;
  private readonly chess = useChess();

  readonly playingAs = () => this.chess.turn();

  canMove(): boolean {
    return !this.chess.gameEnd();
  }

  move(from: Square, to: Square, promotion: Promotable | Nil): Move | Nil {
    const res = Result.gen(() => this.chess.move(from, to, promotion));
    if (res.isErr()) {
      console.error(res.error);
    } else {
      return res.value;
    }
  }
}
