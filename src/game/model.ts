import { Chess, type Color, type PieceSymbol, type Square } from "chess.js";
import type { Nil } from "@app/utils.ts";
import { Ok, Result, TaggedError } from "better-result";

export class ColoredSquare {
  readonly squareColor: Color;
  readonly square: Square;
  constructor(
    readonly pieceColor: Color | Nil,
    readonly piece: PieceSymbol | Nil,
    rowIdx: number,
    colIdx: number,
  ) {
    this.squareColor = (rowIdx + colIdx) % 2 === 0 ? "w" : "b";
    this.square = `${COLS[colIdx]!}${ROWS[rowIdx]!}`;
  }

  isEqual(another: ColoredSquare) {
    return (
      this.square === another.square &&
      this.pieceColor === another.pieceColor &&
      this.piece === another.piece &&
      this.squareColor === another.squareColor
    );
  }
}

export const BOARD_SIZE = 8;
export const COLS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
export const ROWS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

type Index = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export class Pos {
  private constructor(
    readonly x: Index,
    readonly y: Index,
  ) {}

  up(): Pos {
    if (this.x === 0) {
      return new Pos(this.x, this.y);
    } else {
      return new Pos((this.x - 1) as Index, this.y);
    }
  }

  down(): Pos {
    if (this.x === 7) {
      return new Pos(this.x, this.y);
    } else {
      return new Pos((this.x + 1) as Index, this.y);
    }
  }

  right(): Pos {
    if (this.y === 7) {
      return new Pos(this.x, this.y);
    } else {
      return new Pos(this.x, (this.y + 1) as Index);
    }
  }

  left(): Pos {
    if (this.y === 0) {
      return new Pos(this.x, this.y);
    } else {
      return new Pos(this.x, (this.y - 1) as Index);
    }
  }

  static rdn(): Pos {
    return new Pos(
      Math.floor(Math.random() * BOARD_SIZE) as Index,
      Math.floor(Math.random() * BOARD_SIZE) as Index,
    );
  }
}

export class Board {
  private constructor(private readonly board: ColoredSquare[][]) {}

  at(pos: Pos): ColoredSquare {
    return this.board[pos.x]![pos.y]!;
  }

  update(next: Board): Board {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (!next.board[i]![j]!.isEqual(this.board[i]![j]!)) {
          this.board[i]![j]! = next.board[i]![j]!;
          this.board[i] = [...this.board[i]!];
        }
      }
    }
    return this;
  }

  asRows(): readonly (readonly ColoredSquare[])[] {
    return this.board;
  }

  static toBoard(fromChess: ReturnType<Chess["board"]>): Board {
    return new Board(
      fromChess.map((row, rowIdx) =>
        row.map((square, colIdx) => {
          return new ColoredSquare(square?.color, square?.type, rowIdx, colIdx);
        }),
      ),
    );
  }
}

export class MoveError extends Error {
  constructor(e: unknown) {
    super(e instanceof Error ? e.message : JSON.stringify(e), { cause: e });
  }
}

export class EngineError extends Error {
  constructor(e: unknown) {
    super(e instanceof Error ? e.message : JSON.stringify(e), { cause: e });
  }
}

export const PROMOTE_TO = ["q", "r", "b", "n"] as const satisfies PieceSymbol[];
export type Promotable = (typeof PROMOTE_TO)[number];

export namespace GameEnd {
  export type Any = { tag: "white" | "black" | "draw"; msg: string };

  export class WhiteWins implements Any {
    readonly tag = "white";
    readonly msg = "White Wins!";
  }

  export class BlackWins implements Any {
    readonly tag = "black";
    readonly msg = "Black Wins!";
  }

  export class Draw implements Any {
    readonly tag = "draw";
    readonly msg = "Draw";
  }
}
