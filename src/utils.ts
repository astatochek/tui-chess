import { type Accessor } from "solid-js";
import { useKeyboard, useRenderer } from "@opentui/solid";

export type Nil = null | undefined;

export function isNil(v: unknown): v is Nil {
  return v == null;
}

export type PropsAsSignals<T extends Record<string, any>> = {
  readonly [K in keyof T]: Accessor<T[K]>;
};
export function propsToSignals<T extends Record<string, any>>(props: T): PropsAsSignals<T> {
  return Object.keys(props).reduce((acc, key) => {
    acc[key] = () => props[key];
    return acc;
  }, {} as any);
}

export type PublicFields<T extends object> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
};

export function useConsole() {
  const renderer = useRenderer();
  renderer.useConsole = true;
  renderer.console.show();

  useKeyboard((key) => {
    if (key.ctrl && key.name === "space") {
      renderer.console.toggle();
    }
  });
}
