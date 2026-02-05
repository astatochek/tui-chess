import { spawn, type Subprocess } from "bun";
import type { Nil } from "@app/utils.ts";
import type { Game } from "@app/game/game.tsx";
import { EngineError, Mode, type Promotable } from "@app/game/model.ts";
import { useChess } from "@app/game/chess.tsx";
import type { Color, Move, Square } from "chess.js";
import { Result } from "better-result";

const EXE_PATH = {
  WINDOWS: "src/assets/stockfish-windows-x86-64-avx2.exe",
  LINUX: "src/assets/stockfish-ubuntu-x86-64-avx2",
} as const;

function platform(): keyof typeof EXE_PATH {
  switch (process.platform) {
    case "win32":
      return "WINDOWS";
    case "linux":
      return "LINUX";
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
}

export class GameAgainstStockfish implements Game {
  readonly tag = Mode.AGAINST_STOCKFISH;
  private readonly chess = useChess();
  private readonly engine = new StockfishEngine(EXE_PATH[platform()]);
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

  private async moveAsComputer(userMove: ChessMove | Nil) {
    if (this.chess.turn() === this.youArePlayingAs || this.chess.gameEnd()) {
      return;
    }

    const res = await Result.gen(() => this.tryPerformEngineMove(userMove));
    if (res.isErr()) {
      console.error("Failed to perform engine move", res.error);
      this.moveAsComputer(userMove);
    }
  }

  private async *tryPerformEngineMove(userMove: ChessMove | Nil) {
    const move = yield* await Result.tryPromise({
      try: () => this.engine.getEngineMove(userMove, this.chess.fen()),
      catch: (c) => new EngineError(c),
    });
    console.log("Engine:", move);
    return yield* this.chess.move(
      move.from as Square,
      move.to as Square,
      move.promotion as Promotable | Nil,
    );
  }
}

interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
}

interface EngineMove extends ChessMove {
  san?: string;
}

class StockfishEngine {
  private process: Subprocess<"pipe", "pipe", "pipe">;
  private bestLine: ChessMove[] = [];
  private currentLineIndex: number = 0;
  private readonly readyPromise: Promise<void>;
  private responseBuffer: string = "";

  constructor(
    stockfishPath: string,
    private depth: number = 20,
  ) {
    this.process = spawn({
      cmd: [stockfishPath],
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });

    this.readyPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    this.sendCommand("uci");
    await this.waitFor("uciok");
    this.sendCommand("isready");
    await this.waitFor("readyok");
    //await this.setOption("Threads", 4);
    //await this.setOption("Hash", 256);
  }

  private sendCommand(command: string): void {
    const writer = this.process.stdin;
    writer.write(new TextEncoder().encode(command + "\n"));
  }

  private async waitFor(token: string): Promise<string[]> {
    const reader = this.process.stdout.getReader();
    const lines: string[] = [];

    try {
      while (true) {
        const { value, done } = await reader.read();
        console.log("Got:", new TextDecoder().decode(value));
        if (done) break;

        this.responseBuffer += new TextDecoder().decode(value);
        const bufferLines = this.responseBuffer.split("\n");

        // Keep incomplete line in buffer
        this.responseBuffer = bufferLines.pop() || "";

        for (const line of bufferLines) {
          lines.push(line);
          if (line.includes(token)) {
            reader.releaseLock();
            return lines;
          }
        }
      }
    } catch (error) {
      reader.releaseLock();
      throw error;
    }

    reader.releaseLock();
    return lines;
  }

  private parseUciMove(uciMove: string): ChessMove {
    const from = uciMove.substring(0, 2);
    const to = uciMove.substring(2, 4);
    const promotion = uciMove.length > 4 ? uciMove.substring(4, 5) : undefined;

    return { from, to, ...(promotion && { promotion }) };
  }

  private movesToUciFormat(move: ChessMove): string {
    return `${move.from}${move.to}${move.promotion || ""}`;
  }

  private movesEqual(move1: ChessMove, move2: ChessMove): boolean {
    return (
      move1.from === move2.from &&
      move1.to === move2.to &&
      (move1.promotion || "") === (move2.promotion || "")
    );
  }

  private parseBestLine(lines: string[]): ChessMove[] {
    // Find the last "bestmove" line and corresponding pv line
    let bestMove: string | null = null;
    let pvLine: string[] = [];

    for (const line of lines) {
      if (line.startsWith("bestmove")) {
        const parts = line.split(" ");
        bestMove = parts[1]!;
      }

      // Get the principal variation from the last info line with pv
      if (line.includes(" pv ")) {
        const pvIndex = line.indexOf(" pv ") + 4;
        const pvString = line.substring(pvIndex);
        pvLine = pvString.split(" ").filter((m) => m.length >= 4);
      }
    }

    if (pvLine.length > 0) {
      return pvLine.map((m) => this.parseUciMove(m));
    }

    if (bestMove) {
      return [this.parseUciMove(bestMove)];
    }

    return [];
  }

  private async calculateBestLine(fen: string): Promise<void> {
    await this.readyPromise;

    this.sendCommand(`position fen ${fen}`);
    this.sendCommand(`go depth ${this.depth}`);

    const lines = await this.waitFor("bestmove");
    this.bestLine = this.parseBestLine(lines);
    this.currentLineIndex = 0;
  }

  async getEngineMove(userMove: ChessMove | Nil, fen: string): Promise<EngineMove> {
    await this.readyPromise;

    // First turn - calculate new line
    if (!userMove) {
      await this.calculateBestLine(fen);

      if (this.bestLine.length === 0) {
        throw new Error("Engine failed to calculate a move");
      }

      const engineMove = this.bestLine[0]!;
      this.currentLineIndex = 1;
      return engineMove;
    }

    // Check if user's move matches expected move in best line
    const expectedUserMoveIndex = this.currentLineIndex;
    const expectedUserMove = this.bestLine[expectedUserMoveIndex];

    if (expectedUserMove && this.movesEqual(userMove, expectedUserMove)) {
      // User played the expected move, return next move from best line
      const engineMoveIndex = this.currentLineIndex + 1;

      if (engineMoveIndex < this.bestLine.length) {
        const engineMove = this.bestLine[engineMoveIndex]!;
        this.currentLineIndex = engineMoveIndex + 1;
        return engineMove;
      }
    }

    // User deviated from best line or line exhausted - recalculate
    await this.calculateBestLine(fen);

    if (this.bestLine.length === 0) {
      throw new Error("Engine failed to calculate a move");
    }

    const engineMove = this.bestLine[0]!;
    this.currentLineIndex = 1;
    return engineMove;
  }
}
