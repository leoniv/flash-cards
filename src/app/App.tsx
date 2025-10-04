import { MarkdownCard } from "./MarkdownCard";
import { Layout } from "./Layout";
import { useCardNav } from "./hooks/useCardNav";
import { DeckCounts } from "./types";
import { dueCards } from "./logic/due";

export function App() {
  const nav = useCardNav();
  const { ready, ALL } = nav;

  const deckCounts: DeckCounts = {};
  if (ready) {
    if (nav.mode == "all") {
      for (const c of nav.allCards) deckCounts[c.deck] = (deckCounts[c.deck] ?? 0) + 1
    } else {
      for (const c of dueCards(nav.allCards)) deckCounts[c.deck] = (deckCounts[c.deck] ?? 0) + 1
    }
  }
  const totalAll = ready ? Object.values(deckCounts).reduce((a, b) => a + b, 0) : 0;

  const gradingButtons =
    <div className="nav__actions">
      <button className="grade__btn" onClick={() => nav.grade("again")}>Again</button>
      <button className="grade__btn" onClick={() => nav.grade("hard")}>Hard</button>
      <button className="grade__btn" onClick={() => nav.grade("good")}>Good</button>
      <button className="grade__btn" onClick={() => nav.grade("easy")}>Easy</button>
    </div>

  const navigateAll =
    <div className="nav__actions">
      <button className="nav__btn" onClick={nav.prev}> ← Prev </button>
      <button className="nav__btn" onClick={nav.rand}>🎲 Rand</button>
      <button className="nav__btn" onClick={nav.next}> Next → </button>
    </div>

  const NavActions = !ready ? null : nav.mode === "due" ? gradingButtons : navigateAll

  const modePiker =
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ opacity: .85 }}>Study mode</span>
      <select value={ready ? nav.mode : "due"} onChange={e => nav.setMode(e.target.value as "due" | "all")} style={{ padding: 8, borderRadius: 10 }}>
        <option value="due">Due first ({ready ? nav.dueCount : 0})</option>
        <option value="all">All cards ({ready ? nav.totalCount : 0})</option>
      </select>
    </label>

  const deckPiker = ready ? (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ opacity: 0.85 }}>Deck</span>
      <select value={nav.deck} onChange={(e) => nav.setDeck(e.target.value)} style={{ padding: 8, borderRadius: 10 }}>
        <option value={ALL}>All decks ({totalAll})</option>
        {Object.keys(deckCounts).map((d) => (
          <option key={d} value={d}>
            {d} ({deckCounts[d]})
          </option>
        ))}
      </select>
    </label>) : null


  const Controls = ready ? (
    <div style={{ display: "grid", gap: 12 }}>
      {modePiker}
      {deckPiker}
    </div>
  ) : null;

  return (
    <Layout NavActions={NavActions} Controls={Controls}>
      {!ready ? (
        <p style={{ opacity: 0.7 }}>Loading cards…</p>
      ) : (
        <MarkdownCard
          path={nav.current.path}
          onNavigate={nav.onNavigate}
        />
      )}
    </Layout>
  );
}
