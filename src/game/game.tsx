import type { Promotable } from "@app/game/model.ts";
import { type Color, Move, type Square } from "chess.js";
import { isNil, type Nil } from "@app/utils.ts";
import { type Accessor, createContext, type ParentComponent, useContext } from "solid-js";

export type Game = {
  move: (from: Square, to: Square, promotion: Promotable | Nil) => Move | Nil;
  playingAs: Accessor<Color>;
  canMove: () => boolean;
};

export class GameFactory {
  constructor(private readonly fn: () => Game) {}

  create(): Game {
    return this.fn();
  }
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (isNil(ctx)) {
    throw new Error(`GameContextProvider was not used`);
  }
  return ctx;
}

export const GameContextProvider: ParentComponent<{ gameFactory: GameFactory }> = (props) => {
  return (
    <GameContext.Provider value={props.gameFactory.create()}>{props.children}</GameContext.Provider>
  );
};

const GameContext = createContext<Game>();
