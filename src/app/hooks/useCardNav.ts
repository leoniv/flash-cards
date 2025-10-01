// src/app/hooks/useCardNav.ts
import * as React from "react";
import type { Manifest, CardRef, DeckCounts } from "../types";
import { createNavigator, Navigator } from "../logic/navigator";
import { withBase, parseCardPath } from "../utils/url";
import { dueCards } from "../logic/due";
import { loadSrs, setState as srsSet, getState as srsGet } from "../logic/srsStore";
import { nextReview, type Grade } from "../logic/srs";

const ALL = "__all__";

type ReadyState = {
  ready: true;
  mode: "due" | "all";            // study mode
  deck: string;
  allCards: CardRef[];      // unfiltered
  list: CardRef[];          // filtered by deck
  nav: Navigator<CardRef>;
  current: CardRef;
  dueCount: number;               // total due (for ALL)
  totalCount: number;             // total cards (for ALL)
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

        const totalCount = data.cards.length;
        const initialDue = dueCards(data.cards);
        const startList = initialDue.length ? initialDue : data.cards;

        const nav = createNavigator<CardRef>(
          startList,
          startId ? (c) => c.id === startId : undefined
        );

        const current = nav.current();


        if (!cancelled) {
          setState({
            ready: true,
            mode: initialDue.length ? "due" : "all",
            deck: ALL,
            allCards: data.cards,
            list: startList,
            nav,
            current,
            dueCount: initialDue.length,
            totalCount
          });
        }
      } catch (e: any) {
        if (!cancelled) setState({ ready: false, error: e?.message ?? "Load failed" });
      }
    })();
    return () => { cancelled = true; };
  }, [startId]);

  // helpers
  const makeList = React.useCallback((all: CardRef[], deck: string, mode: "due" | "all"): CardRef[] => {
    const base = deck === ALL ? all : all.filter(c => c.deck === deck);
    return mode === "due" ? dueCards(base) : base;
  }, []);

  const setMode = React.useCallback((mode: "due" | "all") => {
    setState(s => {
      if (!s.ready) return s;
      const list = makeList(s.allCards, s.deck, mode);
      const fallback = (s.deck === ALL ? s.allCards : s.allCards.filter(c => c.deck === s.deck));
      const nav = createNavigator<CardRef>(list.length ? list : fallback, c => c.id === s.current.id);
      return { ...s, mode, list, nav, current: nav.current(), dueCount: dueCards(s.allCards).length };
    });
  }, [makeList]);

  // change deck
  const setDeck = React.useCallback((deck: string) => {
    setState((s) => {
      if (!s.ready) return s;
      const filtered = deck === ALL ? s.allCards : s.allCards.filter((c) => c.deck === deck);
      const nav = createNavigator<CardRef>(filtered, (c) => c.id === s.current.id);
      const current = nav.current();
      return { ...s, deck, list: filtered, nav, current };
    });
  }, [makeList]);

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

  // grading: schedule next time, then rebuild list (card may drop from "due")
  const grade = React.useCallback((g: Grade) => {
    setState(s => {
      if (!s.ready) return s;
      const now = Date.now();
      const store = loadSrs();
      const cur = s.current;
      const st = srsGet(store, cur.id);
      const nextSt = nextReview(now, st, g);
      srsSet(store, cur.id, nextSt);

      const list = makeList(s.allCards, s.deck, s.mode);
      if (!list.length) return { ...s, list, dueCount: dueCards(s.allCards).length };

      const idx = list.findIndex(c => c.id === cur.id);
      const target = idx >= 0 ? list[(idx + 1) % list.length] : list[0];
      const nav = createNavigator<CardRef>(list, c => c.id === target.id);

      return { ...s, list, nav, current: nav.current(), dueCount: dueCards(s.allCards).length };
    });
  }, [makeList]);

  const onNavigate = React.useCallback((href: string) => {
    setState((s) => {
      const ref = parseCardPath(href);
      if (!s.ready) return s
      if (s.mode == "due") {
        alert("Links navigaton is disabled in 'due' mode")
        return s
      }
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

  return { ...state, setDeck, setMode, grade, next, prev, rand, onNavigate, ALL } as const;
}
