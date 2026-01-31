import { type Component, createMemo, createSignal } from "solid-js";
import { type Color, type PieceSymbol } from "chess.js";
import { type Nil, propsToSignals, type PublicFields } from "@app/utils.ts";
import { RGBA, StyledText } from "@opentui/core";
import type { ColoredSquare } from "@app/game/model.ts";
import { useCursor } from "@app/game/cursor.tsx";

const PIECE_ICONS = {
  w: {
    //p: "P",
    p: "♙",
    //r: "R",
    r: "♖",
    //n: "N",
    n: "♘",
    //b: "B",
    b: "♗",
    //k: "K",
    k: "♔",
    //q: "Q",
    q: "♕",
  },
  b: {
    //p: "P",
    p: "♟",
    //r: "R",
    r: "♜",
    //n: "N",
    n: "♞",
    //b: "B",
    b: "♝",
    //k: "K",
    k: "♚",
    //q: "Q",
    q: "♛",
  },
} as const satisfies Record<Color, Record<PieceSymbol, string>>;

const SQUARE_COLORS = {
  w: RGBA.fromHex("#DEBA90"),
  b: RGBA.fromHex("#BC7342"),
  w_under_cursor: RGBA.fromHex("#DEBA9073"),
  b_under_cursor: RGBA.fromHex("#BC734280"),
} as const satisfies Record<string, RGBA>;

function background(squareColor: Color, isUnderCursor: boolean): RGBA {
  if (!isUnderCursor) {
    return SQUARE_COLORS[squareColor];
  }
  return SQUARE_COLORS[`${squareColor}_under_cursor`];
}

export const BoardSquare: Component<PublicFields<ColoredSquare>> = (props) => {
  const { squareColor, piece, pieceColor, square } = propsToSignals(props);

  const cursor = useCursor();
  const isUnderCursor = createMemo(() => cursor.hovered().square === square());
  const isHolding = createMemo(() => cursor.held()?.square === square());

  return (
    <box
      width={6}
      height={3}
      border={isHolding()}
      backgroundColor={background(squareColor(), isUnderCursor())}
      alignItems="center"
      justifyContent="center"
    >
      <text fg={pieceColor() === "w" ? "white" : "black"}>
        {PIECE_ICONS?.[pieceColor()!]?.[piece()!] ?? ""}
      </text>
    </box>
  );
};
