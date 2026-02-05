import { useChess } from "@app/game/chess.tsx";
import type { Color, Move, Square } from "chess.js";
import { EngineError, Mode, type Promotable } from "@app/game/model.ts";
import type { Nil } from "@app/utils.ts";
import { Result } from "better-result";
import type { Game } from "@app/game/game.tsx";

export class GameAgainstLichessCloudEval implements Game {
  readonly tag = Mode.LICHESS_CLOUD_EVAL;
  private readonly chess = useChess();
  private readonly engine = new CloudChessEngine();
  private readonly youArePlayingAs: Color = Math.random() > 0.5 ? "w" : "b";

  readonly playingAs = () => this.youArePlayingAs;

  constructor() {
    if (this.youArePlayingAs === "b") {
      this.moveAsComputer(null);
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
      setTimeout(() => this.moveAsComputer({ from, to, promotion: promotion ?? void 0 }), 1);
      return res.value;
    }
  }

  private async moveAsComputer(userMove: ParsedMove | Nil) {
    if (this.chess.turn() === this.youArePlayingAs || this.chess.gameEnd()) {
      return;
    }

    const res = await Result.gen(() => this.tryPerformEngineMove(userMove));
    if (res.isErr()) {
      console.error("Failed to perform engine move", res.error);
      this.moveAsComputer(userMove);
    }
  }

  private async *tryPerformEngineMove(userMove: ParsedMove | Nil) {
    const res = yield* await Result.tryPromise({
      try: () => this.engine.handleUserMove(userMove, this.chess.fen()),
      catch: (c) => new EngineError(c),
    });
    console.log("Engine:", res);
    const { engineMove: move } = res;
    return yield* this.chess.move(
      move.from as Square,
      move.to as Square,
      move.promotion as Promotable | Nil,
    );
  }
}

interface ParsedMove {
  from: string;
  to: string;
  promotion?: string;
}

interface EvalData {
  bestMove: string;
  line: string[];
  eval: number;
}

interface EngineResponse {
  cached: boolean;
  engineMove: ParsedMove;
  eval?: number;
}

interface LichessEvalResponse {
  pvs: {
    moves: string;
    cp?: number;
    mate?: number;
  }[];
}

class CloudChessEngine {
  private bestLine: string[] = [];
  private lineIndex: number = 0;

  async handleUserMove(userMove: ParsedMove | Nil, fen: string): Promise<EngineResponse> {
    if (userMove) {
      const userUci = this.moveToUci(userMove);

      const expectedMove = this.bestLine[this.lineIndex]!;

      if (userUci === expectedMove && this.lineIndex + 1 < this.bestLine.length) {
        this.lineIndex++;
        const engineUci = this.bestLine[this.lineIndex]!;
        const engineMove = this.uciToMove(engineUci);

        this.lineIndex++;

        return {
          cached: true,
          engineMove,
        };
      }
    }

    const evalData = await this.fetchEval(fen);

    this.bestLine = evalData.line;
    this.lineIndex = 1;

    const engineMove = this.uciToMove(evalData.bestMove);

    return {
      cached: false,
      engineMove,
      eval: evalData.eval,
    };
  }

  private moveToUci(move: ParsedMove): string {
    return move.from + move.to + (move.promotion || "");
  }

  private uciToMove(uci: string): ParsedMove {
    return {
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci.length > 4 ? uci[4] : undefined,
    };
  }

  private async fetchEval(fen: string): Promise<EvalData> {
    const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Cloud eval not available for this position");
    }

    const data = (await response.json()) as LichessEvalResponse;
    const pv = data.pvs[0]!.moves.split(" ");

    return {
      bestMove: pv[0]!,
      line: pv,
      eval: data.pvs[0]!.cp ?? data.pvs[0]!.mate ?? 0,
    };
  }
}
