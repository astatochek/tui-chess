import { type Component, Show } from "solid-js";
import { Board } from "@app/components/board.tsx";
import { InfoPanel, useCollapsiblePanel } from "@app/components/info-panel.tsx";
import { useCursor } from "@app/game/cursor.tsx";
import { Portal, useRenderer } from "@opentui/solid";
import { PromotionSelect } from "@app/components/promotion-select.tsx";
import { useChess } from "@app/game/chess.tsx";

export const Main: Component = () => {
  const panel = useCollapsiblePanel();
  const cursor = useCursor();
  const renderer = useRenderer();
  const chess = useChess();

  return (
    <box width="100%" height="100%" flexDirection="row">
      <box flexDirection="column" flexGrow={1} alignItems="center" justifyContent="flex-start">
        <ascii_font marginTop={1} font="tiny" text="TUI CHESS" />
        <Board />
      </box>
      <box width={panel.width()} border={["left"]}>
        <InfoPanel />
      </box>
      <Show when={cursor.showPromotionDialog()}>
        <Portal mount={renderer.root}>
          <PromotionSelect color={chess.turn()} />
        </Portal>
      </Show>
    </box>
  );
};
