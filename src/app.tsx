import { type Component } from "solid-js";
import { ChessContextProvider } from "@app/game/chess.tsx";
import { useConsole } from "@app/utils.ts";
import { CursorContextProvider } from "@app/game/cursor.tsx";
import { Main } from "@app/components/main.tsx";

export const App: Component = () => {
  useConsole();

  return (
    <ChessContextProvider>
      <CursorContextProvider>
        <Main />
      </CursorContextProvider>
    </ChessContextProvider>
  );
};
