export type Nil = null | undefined;

export function isNil(v: unknown): v is Nil {
  return v == null;
}
