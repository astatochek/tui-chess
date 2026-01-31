import { render } from "@opentui/solid";
import { App } from "@app/app.tsx";
import { ConsolePosition } from "@opentui/core";

render(() => <App></App>, {
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 30,
  },
});
