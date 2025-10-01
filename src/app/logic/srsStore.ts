import { DEFAULT_STATE, type ReviewState } from "./srs";

const KEY = "fc-srs-v1";
export type SrsStore = Record<string, ReviewState>; // id -> state

export function loadSrs(): SrsStore {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}

export function saveSrs(s: SrsStore) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function getState(s: SrsStore, id: string): ReviewState {
  return s[id] ?? DEFAULT_STATE;
}

export function setState(s: SrsStore, id: string, st: ReviewState): SrsStore {
  const next = { ...s, [id]: st };
  saveSrs(next);
  return next;
}
