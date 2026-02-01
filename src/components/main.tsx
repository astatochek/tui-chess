import { type Component } from "solid-js";
import { Board } from "@app/components/board.tsx";
import { InfoPanel, useCollapsiblePanel } from "@app/components/info-panel.tsx";

export const Main: Component = () => {
  const panel = useCollapsiblePanel();
  return (
    <box width="100%" height="100%" flexDirection="row">
      <box flexDirection="column" flexGrow={1} alignItems="center" justifyContent="flex-start">
        <ascii_font marginTop={1} font="tiny" text="TUI CHESS" />
        <Board />
      </box>
      <box width={panel.width()} border={["left"]}>
        <InfoPanel />
      </box>
    </box>
  );
};
