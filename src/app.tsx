import { type Component } from "solid-js";
import { ChessContextProvider } from "@app/game/chess.tsx";
import { useConsole } from "@app/utils.ts";
import { CursorContextProvider } from "@app/game/cursor.tsx";
import { Main } from "@app/components/main.tsx";
import { GameContextProvider } from "@app/game/game.tsx";
import { GameAgainstYourself } from "@app/game/game-agains-yourself.ts";

export const App: Component = () => {
  useConsole();

  return (
    <ChessContextProvider>
      <GameContextProvider game={new GameAgainstYourself()}>
        <CursorContextProvider>
          <Main />
        </CursorContextProvider>
      </GameContextProvider>
    </ChessContextProvider>
  );
};
