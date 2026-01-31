import { type Component, For } from "solid-js";
import { useChess } from "@app/game/chess.tsx";
import { BoardSquare } from "@app/components/board-square.tsx";

export const Board: Component = () => {
  const chess = useChess();
  return (
    <box alignItems="center" justifyContent="center" flexGrow={1}>
      <box flexDirection="column">
        <For each={chess.board().asRows()}>
          {(row) => (
            <box flexDirection="row">
              <For each={row}>{(square) => <BoardSquare {...square} />}</For>
            </box>
          )}
        </For>
        <box flexDirection="row" alignItems="flex-start" justifyContent="flex-start"></box>
      </box>
    </box>
  );
};
