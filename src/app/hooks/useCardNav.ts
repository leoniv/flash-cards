import * as React from "react";
import { createNavigator, Navigator } from "../logic/navigator";
import { withBase } from "../utils/url";

type State =
  | { ready: false; error?: string }
  | { ready: true; nav: Navigator; currentPath: string };

export function useCardNav(startPath?: string): State & {
  next: () => void;
  prev: () => void;
  rand: () => void;
  list: string[] | undefined;
} {
  const [state, setState] = React.useState<State>({ ready: false });

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(withBase("cards-manifest.json"));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { cards: string[] };
        if (!data.cards?.length) throw new Error("Empty cards list");
        const nav = createNavigator(data.cards, startPath);
        if (!cancelled) {
          setState({ ready: true, nav, currentPath: nav.current() });
        }
      } catch (e: any) {
        if (!cancelled)
          console.error("Loading manifest failed: " + e.message)
          setState({ ready: false, error: e?.message ?? "Load failed" });
      }
    })();

    return () => { cancelled = true; };
  }, [startPath]);

  const next = React.useCallback(() => {
    setState(s => {
      if (!("ready" in s) || !s.ready) return s;
      const p = s.nav.next();
      return { ...s, currentPath: p };
    });
  }, []);

  const prev = React.useCallback(() => {
    setState(s => {
      if (!("ready" in s) || !s.ready) return s;
      const p = s.nav.prev();
      return { ...s, currentPath: p };
    });
  }, []);

  const rand = React.useCallback(() => {
    setState(s => !s.ready ? s : { ...s, currentPath: s.nav.rand() });
  }, []);

  const list = state.ready ? state.nav.list : undefined;

  return { ...state, next, prev, rand, list } as any;
}
