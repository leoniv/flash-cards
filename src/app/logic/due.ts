import type { CardRef } from "../types";
import { loadSrs, getState } from "./srsStore";

export function dueCards(all: CardRef[], deck?: string): CardRef[] {
  const store = loadSrs();
  const now = Date.now();
  const pool = deck ? all.filter(c => c.deck === deck) : all;
  return pool.filter(c => getState(store, c.id).due <= now);
}
