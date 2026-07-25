import { createContext, useContext, type ReactNode } from "react";
import type { WorldRenderContext } from "./types";

const Context = createContext<WorldRenderContext | null>(null);

export function WorldRendererProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: WorldRenderContext;
}) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useWorldRendererContext(): WorldRenderContext {
  const value = useContext(Context);

  if (!value) {
    throw new Error("useWorldRendererContext must be used inside WorldRendererProvider");
  }

  return value;
}
