import { CardRef } from "@app/types";

export function withBase(p: string) {
  const base = import.meta.env.BASE_URL ?? "/";
  return (base.endsWith("/") ? base : base + "/") + p.replace(/^\/+/, "");
}

export function parseCardPath(cardPath: string): CardRef {
  const path = cardPath
    .replace(/^(.+\/)?static\//gm, "");
  const id = path.replace(/^cards\//, "").replace(/\.md$/, "");
  const decks = id.split("/")
  const deck = decks.length > 1 ? decks[0] : "common"
  return {
    id,
    path,
    deck
  };
}
