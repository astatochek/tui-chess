import { type Component } from "solid-js";
import { Board } from "@app/components/board.tsx";
import { ChessContextProvider } from "@app/game/chess.tsx";
import { useConsole } from "@app/utils.ts";
import { CursorContextProvider } from "@app/game/cursor.tsx";

export const App: Component = () => {
  useConsole();

  return (
    <ChessContextProvider>
      <CursorContextProvider>
        <Board></Board>
      </CursorContextProvider>
    </ChessContextProvider>
  );
};
