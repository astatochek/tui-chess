import type { Component, Setter } from "solid-js";
import { Overlay } from "@app/components/overlay.tsx";
import { type Game, GameFactory } from "@app/game/game.tsx";
import type { SelectOption } from "@opentui/core";
import { GameAgainstYourself } from "@app/game/game-agains-yourself.ts";
import type { Nil } from "@app/utils.ts";
import { GameAgainstComputer } from "@app/game/game-against-computer.ts";

enum Mode {
  AGAINST_YOURSELF,
  AGAINST_COMPUTER,
}

const TABS = [
  {
    name: "Against Yourself",
    value: Mode.AGAINST_YOURSELF,
    description: "Play for both White and Black at the same time.",
  },
  {
    name: "Against Computer",
    value: Mode.AGAINST_COMPUTER,
    description: "Play against a Computer that performs random moves",
  },
] satisfies SelectOption[];

export const ModeSelector: Component<{ select: Setter<GameFactory | Nil> }> = (props) => {
  function selectMode(mode: Mode) {
    if (mode === Mode.AGAINST_YOURSELF) {
      return props.select(new GameFactory(() => new GameAgainstYourself()));
    } else if (mode === Mode.AGAINST_COMPUTER) {
      return props.select(new GameFactory(() => new GameAgainstComputer()));
    }
  }
  return (
    <Overlay>
      <box width={70} padding={1} flexDirection="column">
        <box border>
          <text>Select Game Mode ↑↓</text>
        </box>
        <box paddingLeft={1} paddingRight={1}>
          <select
            options={TABS}
            focused
            height={2}
            width="auto"
            showDescription={true}
            onSelect={(index) => selectMode(TABS[index]!.value)}
          ></select>
        </box>
      </box>
    </Overlay>
  );
};
