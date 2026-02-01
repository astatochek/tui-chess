import { type Component, createSignal, For, Show } from "solid-js";
import type { Color, PieceSymbol } from "chess.js";
import { PIECE_ICONS } from "@app/components/board-square.tsx";
import { useKeyboard } from "@opentui/solid";
import { useCursor } from "@app/game/cursor.tsx";

const PROMOTE_TO = ["q", "r", "b", "n"] as const satisfies PieceSymbol[];
type Promotable = (typeof PROMOTE_TO)[number];

export const PromotionSelect: Component<{ color: Color }> = (props) => {
  const [selected, setSelected] = createSignal<Promotable>(PROMOTE_TO[0]);
  const cursor = useCursor();

  useKeyboard((key) => {
    if (key.name === "l" || key.name === "right" || key.name === "d") {
      setSelected((prev) => PROMOTE_TO[(PROMOTE_TO.indexOf(prev) + 1) % PROMOTE_TO.length]!);
    }
    if (key.name === "h" || key.name === "left" || key.name === "a") {
      setSelected(
        (prev) =>
          PROMOTE_TO[(PROMOTE_TO.length + PROMOTE_TO.indexOf(prev) - 1) % PROMOTE_TO.length]!,
      );
    }
  });

  return (
    <box border flexDirection="row" alignItems="center" justifyContent="flex-start">
      <text>Promote to:</text>
      <For each={PROMOTE_TO}>
        {(piece) => (
          <text fg="white">
            <Show when={selected() === piece} fallback={PIECE_ICONS[props.color][piece]}>
              <u>
                <b>{PIECE_ICONS[props.color][piece]}</b>
              </u>
            </Show>{" "}
          </text>
        )}
      </For>
    </box>
  );
};
