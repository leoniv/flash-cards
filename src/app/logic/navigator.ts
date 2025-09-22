export interface Navigator<T> {
  list: T[];
  index: number;
  current(): T;
  next(): T;
  prev(): T;
  setBy(pred: (t: T) => boolean): T; // jump by predicate (e.g., id/path)
  rand(): T;
}

export function createNavigator<T>(list: T[], start?: (t: T) => boolean): Navigator<T> {
  if (!Array.isArray(list) || list.length === 0) throw new Error("Navigator requires a non-empty list");

  let idx = 0;
  if (start) {
    const i = list.findIndex(start);
    if (i >= 0) idx = i;
  }

  return {
    get list() { return list; },
    get index() { return idx; },
    current() { return list[idx]; },
    next() { idx = (idx + 1) % list.length; return list[idx]; },
    prev() { idx = (idx - 1 + list.length) % list.length; return list[idx]; },
    setBy(pred) { const i = list.findIndex(pred); if (i >= 0) idx = i; return list[idx]; },
    rand() {
      if (list.length <= 1) return list[idx];
      let r; do { r = Math.floor(Math.random() * list.length); } while (r === idx);
      idx = r; return list[idx];
    },
  };
}
