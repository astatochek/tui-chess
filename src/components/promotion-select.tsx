import { type Component, createSignal, For, Show } from "solid-js";
import type { Color } from "chess.js";
import { PIECE_ICONS, SQUARE_COLORS } from "@app/components/board-square.tsx";
import { useKeyboard } from "@opentui/solid";
import { useCursor } from "@app/game/cursor.tsx";
import { type Promotable, PROMOTE_TO } from "@app/game/model.ts";
import { Overlay } from "@app/components/overlay.tsx";
import { useChess } from "@app/game/chess.tsx";

export const PromotionSelect: Component<{ color: Color }> = (props) => {
  const [selected, setSelected] = createSignal<Promotable>(PROMOTE_TO[0]);
  const cursor = useCursor();
  const chess = useChess();

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
    if (key.name === "space") {
      cursor.promoteTo(selected());
    }
  });

  return (
    <Overlay>
      <box
        backgroundColor="black"
        border
        padding={1}
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
      >
        <box flexDirection="row" gap={1}>
          <For each={PROMOTE_TO}>
            {(piece) => (
              <box
                width={6}
                height={3}
                border={selected() === piece}
                backgroundColor={SQUARE_COLORS[cursor.hovered().squareColor]}
                alignItems="center"
                justifyContent="center"
              >
                <text fg={chess.turn() === "w" ? "white" : "black"}>
                  {PIECE_ICONS[chess.turn()][piece]}
                </text>
              </box>
            )}
          </For>
        </box>
      </box>
    </Overlay>
  );
};
