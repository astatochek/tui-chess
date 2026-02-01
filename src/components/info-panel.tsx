import { type Component, createSignal, For, onMount } from "solid-js";
import { useChess } from "@app/game/chess.tsx";
import { useKeyboard, useTimeline } from "@opentui/solid";
import { SQUARE_COLORS } from "@app/components/board-square.tsx";

export const InfoPanel: Component = () => {
  const chess = useChess();
  return (
    <box marginLeft={1}>
      <box height={2} border={["bottom"]} justifyContent="center" alignItems="center" width="100%">
        <text wrapMode="none">CURRENT TURN: {chess.turn() === "w" ? "WHITE" : "BLACK"}</text>
      </box>
      <scrollbox maxHeight="100%" stickyStart="bottom">
        <For each={chess.history()}>
          {(move, index) => (
            <text wrapMode="none">
              [{`${chess.history().length - index()}`.padStart(3, "0")}] [
              {(chess.history().length - index()) % 2 === 1 ? "WHITE" : "BLACK"}]: {move}
            </text>
          )}
        </For>
      </scrollbox>
    </box>
  );
};

export function useCollapsiblePanel() {
  const [width, setWidth] = createSignal(0);
  const MAX_WIDTH = 30;
  const duration = 100;

  onMount(() => {
    const timeline = useTimeline({
      duration,
      loop: false,
    });
    timeline.add(
      { width: width() },
      {
        width: MAX_WIDTH,
        duration,
        ease: "linear",
        onUpdate: (animation) => {
          setWidth(animation.targets[0].width);
        },
      },
    );
  });

  useKeyboard((key) => {
    if (key.name === "p") {
      const target = width() > 0 ? 0 : MAX_WIDTH;
      const timeline = useTimeline({
        duration,
        loop: false,
      });
      timeline.add(
        { width: width() },
        {
          width: target,
          duration,
          ease: "linear",
          onUpdate: (animation) => {
            setWidth(animation.targets[0].width);
          },
        },
      );
    }
  });

  return { width };
}
