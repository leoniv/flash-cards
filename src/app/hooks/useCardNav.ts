// src/app/hooks/useCardNav.ts
import * as React from "react";
import type { Manifest, CardRef, DeckCounts } from "../types";
import { createNavigator, Navigator } from "../logic/navigator";
import { withBase, parseCardPath } from "../utils/url";
import { log } from "console";

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
};

type State =
  | { ready: false; error?: string }
  | ReadyState;

function filterCards(
  all: CardRef[],
  deck: string
): CardRef[] {
  let base = deck === ALL ? all : all.filter(c => c.deck === deck);
  return base;
}

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
        const filtered = filterCards(data.cards, ALL);

        const nav = createNavigator<CardRef>(
          filtered.length ? filtered : data.cards,
          startId ? (c) => c.id === startId : undefined
        );

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
      return { ...s, deck, list: filtered, nav, current };
    });
  }, []);

  // navigation helpers (make sure to mark viewed)
  const next = React.useCallback(() => {
    setState((s) => {
      if (!s.ready) return s;
      const item = s.nav.next();
      return { ...s, current: item };
    });
  }, []);
  const prev = React.useCallback(() => {
    setState((s) => {
      if (!s.ready) return s;
      const item = s.nav.prev();
      return { ...s, current: item };
    });
  }, []);
  const rand = React.useCallback(() => {
    setState((s) => {
      if (!s.ready) return s;
      const item = s.nav.rand();
      return { ...s, current: item };
    });
  }, []);

  const onNavigate = React.useCallback((href: string) => {
    setState((s) => {
      const ref = parseCardPath(href);
      if (!s.ready) return s
      const idx = s.allCards.findIndex(x => x.id == ref.id)
      if (idx >= 0) {
        const filtered = s.allCards.filter((c) => c.deck === s.allCards[idx].deck);
        const nav = createNavigator<CardRef>(filtered, (c) => c.id === s.current.id);
        const item = nav.setBy(
          x => x.id == ref.id,
          () => console.error(`Card not found, id: ${ref.id}, path: ${ref.path}.`)
        );
        return { ...s, nav, deck: item.deck, current: item };
      } else {
        console.error(`Card not found, id: ${ref.id}, path: ${ref.path}.`)
        return s
      }
    });
  }, []);

  return { ...state, setDeck, next, prev, rand, onNavigate, ALL } as const;
}
