export interface Navigator {
  readonly list: string[];
  readonly index: number;
  current(): string;
  next(): string;
  prev(): string;
  setByPath(path: string): string; // sets index to this path if present
  rand(): string;
}

export function createNavigator(list: string[], startPath?: string): Navigator {
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("Navigator requires a non-empty list");
  }

  let idx = 0;
  if (startPath) {
    const found = list.indexOf(startPath);
    if (found >= 0) idx = found;
  }

  const nav: Navigator = {
    get list() { return list; },
    get index() { return idx; },
    current() { return list[idx]; },
    next() { idx = (idx + 1) % list.length; return list[idx]; },
    prev() { idx = (idx - 1 + list.length) % list.length; return list[idx]; },
    setByPath(path: string) {
      const i = list.indexOf(path);
      if (i >= 0) idx = i;
      return list[idx];
    },
    rand() {
      if (list.length <= 1) return list[idx];
      let r: number;
      do {
        r = Math.floor(Math.random() * list.length);
      } while (r === idx);       // avoid repeating same card
      idx = r;
      return list[idx];
    }
  };
  return nav;
}
