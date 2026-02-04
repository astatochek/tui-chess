import { type Component, createSignal, Show } from "solid-js";
import { ChessContextProvider } from "@app/game/chess.tsx";
import { type Nil, useConsole } from "@app/utils.ts";
import { CursorContextProvider } from "@app/game/cursor.tsx";
import { Main } from "@app/components/main.tsx";
import { type Game, GameContextProvider, GameFactory } from "@app/game/game.tsx";
import { GameAgainstYourself } from "@app/game/game-agains-yourself.ts";
import { ModeSelector } from "@app/components/mode-selector.tsx";

export const App: Component = () => {
  if (process.env.DEV) {
    useConsole();
  }

  const [gameFactory, setGameFactory] = createSignal<GameFactory | Nil>(void 0);

  return (
    <Show when={gameFactory()} fallback={<ModeSelector select={setGameFactory} />}>
      <ChessContextProvider>
        <GameContextProvider gameFactory={gameFactory()!}>
          <CursorContextProvider>
            <Main />
          </CursorContextProvider>
        </GameContextProvider>
      </ChessContextProvider>
    </Show>
  );
};
