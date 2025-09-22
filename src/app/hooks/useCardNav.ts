// src/app/hooks/useCardNav.ts
import * as React from "react";
import type { Manifest, CardRef } from "../types";
import { createNavigator, Navigator } from "../logic/navigator";
import { withBase } from "../utils/url";

const ALL = "__all__";

type ReadyState = {
  ready: true;
  deck: string;                 // current deck filter, ALL by default
  decks: string[];              // e.g., ["algorithms","sql"]
  list: CardRef[];              // filtered list (by deck)
  nav: Navigator<CardRef>;
  current: CardRef;
};

type State =
  | { ready: false; error?: string }
  | ReadyState;

export function useCardNav(startId?: string) {
  const [state, setState] = React.useState<State>({ ready: false });

  // initial load
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(withBase("cards-manifest.json"));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Manifest = await res.json();
        if (!data.cards?.length) throw new Error("Empty manifest");

        // compute decks
        const decks = Array.from(new Set(data.cards.map(c => c.deck))).sort();

        // start list = ALL
        const list = data.cards.slice();

        const nav = createNavigator<CardRef>(
          list,
          startId ? (c) => c.id === startId : undefined
        );

        if (!cancelled) {
          setState({
            ready: true,
            deck: ALL,
            decks,
            list,
            nav,
            current: nav.current(),
          });
        }
      } catch (e: any) {
        console.error(e)
        if (!cancelled) setState({ ready: false, error: e?.message ?? "Load failed" });
      }
    })();
    return () => { cancelled = true; };
  }, [startId]);

  const applyDeck = React.useCallback((deck: string) => {
    setState(s => {
      if (!s.ready) return s;
      const full = s.nav.list; // original list is not stored separately; keep a copy:
      // Better: store unfiltered separately. Quick fix: reconstruct from current and decks is insufficient.
      // We'll stash unfiltered in a ref:
      return s; // placeholder replaced below
    });
  }, []);

  // keep unfiltered list in a ref to rebuild filters
  const unfilteredRef = React.useRef<CardRef[] | null>(null);
  React.useEffect(() => {
    if (state.ready) unfilteredRef.current = state.nav.list.slice();
  }, [state.ready]);

  const setDeck = React.useCallback((deck: string) => {
    setState(s => {
      if (!s.ready) return s;
      const all = unfilteredRef.current ?? s.nav.list;
      const filtered = deck === ALL ? all : all.filter(c => c.deck === deck);
      const nav = createNavigator<CardRef>(filtered, (c) => c.id === s.current.id);
      return { ...s, deck, list: filtered, nav, current: nav.current() };
    });
  }, []);

  const next = React.useCallback(() => {
    setState(s => !s.ready ? s : ({ ...s, current: s.nav.next() }));
  }, []);
  const prev = React.useCallback(() => {
    setState(s => !s.ready ? s : ({ ...s, current: s.nav.prev() }));
  }, []);
  const rand = React.useCallback(() => {
    setState(s => !s.ready ? s : ({ ...s, current: s.nav.rand() }));
  }, []);

  return {
    ...state,
    setDeck,
    decks: state.ready ? state.decks : [],
    deck: state.ready ? state.deck : ALL,
    next, prev, rand,
  } as const;
}
