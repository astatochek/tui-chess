import { type Component, For } from "solid-js";
import { useChess } from "@app/game/chess.tsx";
import { BoardSquare } from "@app/components/board-square.tsx";
import { useGame } from "@app/game/game.tsx";
import { BOARD_SIZE, COLS } from "@app/game/model.ts";

export const Board: Component = () => {
  const chess = useChess();
  const game = useGame();

  return (
    <box alignItems="center" justifyContent="center" flexGrow={1}>
      <box flexDirection={game.playingAs() === "w" ? "column" : "column-reverse"}>
        <Letters location="top" />
        <For each={chess.board().asRows()}>
          {(row, index) => (
            <box
              flexDirection={game.playingAs() === "w" ? "row" : "row-reverse"}
              alignItems="center"
            >
              <box padding={1}>
                <text>{BOARD_SIZE - index()}</text>
              </box>
              <For each={row}>{(square) => <BoardSquare {...square} />}</For>
              <box padding={1}>
                <text>{BOARD_SIZE - index()}</text>
              </box>
            </box>
          )}
        </For>
        <Letters location="bottom" />
      </box>
    </box>
  );
};

const Letters: Component<{ location: "top" | "bottom" }> = (props) => {
  const game = useGame();
  return (
    <box flexDirection={game.playingAs() === "w" ? "row" : "row-reverse"}>
      <box paddingLeft={1} paddingRight={1}>
        <text> </text>
      </box>
      {COLS.map((col) => (
        <box
          width={6}
          justifyContent={
            (game.playingAs() === "w") === (props.location === "top") ? "flex-end" : "flex-start"
          }
          alignItems="center"
        >
          <text>{col}</text>
        </box>
      ))}
      <box paddingLeft={1} paddingRight={1}>
        <text> </text>
      </box>
    </box>
  );
};
