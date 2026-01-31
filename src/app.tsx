import type { Component } from "solid-js";
import { Board } from "@app/components/board.tsx";
import { ChessContextProvider } from "@app/game/chess-store.tsx";

export const App: Component = () => {
  return (
    <ChessContextProvider>
      <Board></Board>
    </ChessContextProvider>
  );
};
