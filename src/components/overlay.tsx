import type { ParentComponent } from "solid-js";

export const Overlay: ParentComponent = (props) => (
  <box
    position="absolute"
    top={0}
    left={0}
    width="100%"
    height="100%"
    justifyContent="center"
    alignItems="center"
  >
    {props.children}
  </box>
);
