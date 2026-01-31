import type { Component } from "solid-js";
import { useChess } from "@app/game/chess-store.tsx";

export const Board: Component = () => {
  const chess = useChess();

  return (
    <box alignItems="center" justifyContent="center" flexGrow={1}>
      <box flexDirection="column">
        <box flexDirection="row" alignItems="flex-start" justifyContent="flex-start">
          <box
            width={6}
            height={3}
            backgroundColor="green"
            alignItems="center"
            justifyContent="center"
          >
            <text>♟️</text>
          </box>
          <box
            width={6}
            height={3}
            backgroundColor="yellow"
            alignItems="center"
            justifyContent="center"
          >
            <text>♟️</text>
          </box>
          <box
            width={6}
            height={3}
            backgroundColor="green"
            alignItems="center"
            justifyContent="center"
          >
            <text>♟️</text>
          </box>
        </box>
        <box flexDirection="row" alignItems="flex-start" justifyContent="flex-start">
          <box
            width={6}
            height={3}
            backgroundColor="yellow"
            alignItems="center"
            justifyContent="center"
          >
            <text>♟️</text>
          </box>
          <box
            width={6}
            height={3}
            backgroundColor="green"
            alignItems="center"
            justifyContent="center"
          >
            <text>♟️</text>
          </box>
          <box
            width={6}
            height={3}
            backgroundColor="yellow"
            alignItems="center"
            justifyContent="center"
          >
            <text>♟️</text>
          </box>
        </box>
      </box>
    </box>
  );
};
