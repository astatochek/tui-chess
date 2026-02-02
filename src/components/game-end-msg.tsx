import { type Component } from "solid-js";
import { GameEnd } from "@app/game/model.ts";
import { Overlay } from "@app/components/overlay.tsx";

export const GameEndMsg: Component<{ end: GameEnd.Any }> = (props) => (
  <Overlay>
    <box
      backgroundColor="black"
      border
      padding={1}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <ascii_font font="tiny" text={props.end.msg} />
    </box>
  </Overlay>
);
