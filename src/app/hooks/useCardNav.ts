// src/app/hooks/useCardNav.ts
import * as React from "react";
import type { Manifest, CardRef, DeckCounts } from "../types";
import { createNavigator, Navigator } from "../logic/navigator";
import { loadProgress, markViewed, markRevealed, type ProgressStore } from "../logic/progress";
import { withBase } from "../utils/url";

const ALL = "__all__";

type ReadyState = {
  ready: true;
  deck: string;
  decks: string[];
  deckCounts: DeckCounts;
  allCards: CardRef[];      // unfiltered
  list: CardRef[];          // filtered by deck
  nav: Navigator<CardRef>;
  current: CardRef;
  progress: ProgressStore;
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

        const deckCounts: DeckCounts = {};
        for (const c of data.cards) deckCounts[c.deck] = (deckCounts[c.deck] ?? 0) + 1;

        const decks = Object.keys(deckCounts).sort();

        const nav = createNavigator<CardRef>(
          data.cards,
          startId ? (c) => c.id === startId : undefined
        );

        const progress = loadProgress();
        const current = nav.current();


        if (!cancelled) {
          setState({
            ready: true,
            deck: ALL,
            decks,
            deckCounts,
            allCards: data.cards,
            list: data.cards,
            nav,
            current,
            progress: markViewed(progress, current.id), // mark first view
          });
        }
      } catch (e: any) {
        if (!cancelled) setState({ ready: false, error: e?.message ?? "Load failed" });
      }
    })();
    return () => { cancelled = true; };
  }, [startId]);

  // keep unfiltered list in a ref to rebuild filters
  const unfilteredRef = React.useRef<CardRef[] | null>(null);
  React.useEffect(() => {
    if (state.ready) unfilteredRef.current = state.nav.list.slice();
  }, [state.ready]);


  // change deck
  const setDeck = React.useCallback((deck: string) => {
    setState((s) => {
      if (!s.ready) return s;
      const filtered = deck === ALL ? s.allCards : s.allCards.filter((c) => c.deck === deck);
      const nav = createNavigator<CardRef>(filtered, (c) => c.id === s.current.id);
      const current = nav.current();
      return { ...s, deck, list: filtered, nav, current, progress: markViewed(s.progress, current.id) };
    });
  }, []);

  // navigation helpers (make sure to mark viewed)
  const next = React.useCallback(() => {
    setState((s) => {
      if (!s.ready) return s;
      const item = s.nav.next();
      return { ...s, current: item, progress: markViewed(s.progress, item.id) };
    });
  }, []);
  const prev = React.useCallback(() => {
    setState((s) => {
      if (!s.ready) return s;
      const item = s.nav.prev();
      return { ...s, current: item, progress: markViewed(s.progress, item.id) };
    });
  }, []);
  const rand = React.useCallback(() => {
    setState((s) => {
      if (!s.ready) return s;
      const item = s.nav.rand();
      return { ...s, current: item, progress: markViewed(s.progress, item.id) };
    });
  }, []);

  // mark revealed (call this when any <details> opens)
  const markRevealedById = React.useCallback((id: string) => {
    setState((s) => (!s.ready ? s : { ...s, progress: markRevealed(s.progress, id) }));
  }, []);

  return { ...state, setDeck, next, prev, rand, markRevealedById, ALL } as const;
}
