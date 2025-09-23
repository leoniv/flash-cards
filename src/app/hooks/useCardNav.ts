// src/app/hooks/useCardNav.ts
import * as React from "react";
import type { Manifest, CardRef, DeckCounts } from "../types";
import { createNavigator, Navigator } from "../logic/navigator";
import { loadProgress, markViewed, markRevealed, resetProgress, type ProgressStore } from "../logic/progress";
import { withBase } from "../utils/url";

const ALL = "__all__";

type ReadyState = {
  ready: true;
  deck: string;
  decks: string[];
  onlyUnseen: boolean;
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

function filterCards(
  all: CardRef[],
  deck: string,
  onlyUnseen: boolean,
  progress: ProgressStore
): CardRef[] {
  let base = deck === ALL ? all : all.filter(c => c.deck === deck);
  if (onlyUnseen) base = base.filter(c => !progress.viewed[c.id]);
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
        const progress = loadProgress();
        const onlyUnseen = false;
        const filtered = filterCards(data.cards, ALL, onlyUnseen, progress);

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
            onlyUnseen,
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

  // helpers to rebuild navigator when filters/progress change
  function rebuild(s: ReadyState): ReadyState {
    const list = filterCards(s.allCards, s.deck, s.onlyUnseen, s.progress);
    if (list.length === 0) {
      // nothing left under current filter; keep current, empty list
      return { ...s, list, nav: s.nav, current: s.current };
    }
    const sameId = s.current.id;
    const nav = createNavigator<CardRef>(list, c => c.id === sameId);
    return { ...s, list, nav, current: nav.current() };
  }

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

 const setOnlyUnseen = React.useCallback((onlyUnseen: boolean) => {
    setState(s => {
      if (!s.ready) return s;
      const next = rebuild({ ...s, onlyUnseen });

      // If turning ON hides the current (already viewed), jump to first available.
      if (onlyUnseen && next.list.length) {
        const nav = createNavigator<CardRef>(next.list);
        return { ...next, nav, current: nav.current() };
      }
      return next;
    });
  }, []);

  const doResetProgress = React.useCallback(() => {
    setState(s => {
      if (!s.ready) return s;
      const progress = resetProgress();
      const rebuilt = rebuild({ ...s, progress });
      return rebuilt;
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

  return { ...state, setDeck, next, prev, rand, markRevealedById, doResetProgress, setOnlyUnseen, ALL } as const;
}
