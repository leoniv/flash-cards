// src/app/types.ts
export type CardRef = {
  id: string;        // "algorithms/two-pointer-1"
  deck: string;      // "algorithms"
  path: string;      // "cards/algorithms/two-pointer-1.md"
};

export type Manifest = { cards: CardRef[] };
