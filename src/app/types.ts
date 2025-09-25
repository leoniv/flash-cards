export type CardRef = { id: string; deck: string; path: string };
export type Manifest = { cards: CardRef[] };
export type DeckCounts = Record<string, number>;
