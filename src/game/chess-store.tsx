import {
  createContext,
  createMemo,
  createSignal,
  type ParentComponent,
  useContext,
} from "solid-js";
import { Chess } from "chess.js";
import { isNil } from "@app/utils.ts";

type ChessStore = ReturnType<typeof ChessStoreConstructor>;

function ChessStoreConstructor() {
  const [chess, setChess] = createSignal(new Chess(), { equals: () => false });
  const board = createMemo(() => chess().board());
  return { chess, board };
}

const ChessContext = createContext<ChessStore>();

export const ChessContextProvider: ParentComponent = (props) => (
  <ChessContext.Provider value={ChessStoreConstructor()}>{props.children}</ChessContext.Provider>
);

export function useChess() {
  const ctx = useContext(ChessContext);
  if (isNil(ctx)) {
    throw new Error(`ChessContextProvider was not used`);
  }
  return ctx;
}
