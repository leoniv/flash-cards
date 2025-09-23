const KEY = "fc-progress-v1";

export type ProgressStore = {
  viewed: Record<string, true>;
  revealed: Record<string, true>;
};

export function loadProgress(): ProgressStore {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { viewed: {}, revealed: {} };
    const j = JSON.parse(raw);
    return { viewed: j.viewed ?? {}, revealed: j.revealed ?? {} };
  } catch {
    return { viewed: {}, revealed: {} };
  }
}

export function saveProgress(p: ProgressStore) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function markViewed(p: ProgressStore, id: string): ProgressStore {
  if (p.viewed[id]) return p;
  const next = { ...p, viewed: { ...p.viewed, [id]: true } };
  saveProgress(next);
  return next;
}

export function markRevealed(p: ProgressStore, id: string): ProgressStore {
  if (p.revealed[id]) return p;
  const next = { ...p, revealed: { ...p.revealed, [id]: true } };
  saveProgress(next);
  return next;
}

export function resetProgress(): ProgressStore {
  const fresh = { viewed: {}, revealed: {} };
  saveProgress(fresh);
  return fresh;
}
