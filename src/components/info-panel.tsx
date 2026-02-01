import { type Component, createSignal, onMount } from "solid-js";
import { useChess } from "@app/game/chess.tsx";
import { useKeyboard, useTimeline } from "@opentui/solid";

export const InfoPanel: Component = () => {
  const chess = useChess();
  return <text>Turn: {chess.turn() === "w" ? "WHITE" : "BLACK"}</text>;
};

export function useCollapsiblePanel() {
  const [width, setWidth] = createSignal(0);
  const MAX_WIDTH = 20;
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
