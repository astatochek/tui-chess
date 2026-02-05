import solidPlugin from "@opentui/solid/bun-plugin";

await Bun.build({
  entrypoints: ["./src/index.tsx"],
  plugins: [solidPlugin],
  compile: {
    target: "bun-windows-x64",
    outfile: "./tui-chess-win",
  },
});
