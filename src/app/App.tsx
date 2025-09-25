import { MarkdownCard } from "./MarkdownCard";
import { Layout } from "./Layout";
import { useCardNav } from "./hooks/useCardNav";

export function App() {
  const { ready, current, deck,
    decks, deckCounts, list,
    setDeck, next, prev, rand,
    onNavigate, ALL
  } = useCardNav();

  const totalAll = ready ? Object.values(deckCounts).reduce((a, b) => a + b, 0) : 0;
  const totalDeck = deck === ALL ? totalAll : (ready ? deckCounts[deck] : 0);

  const Controls = ready ? (
    <div style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ opacity: 0.85 }}>Deck</span>
        <select value={deck} onChange={(e) => setDeck(e.target.value)} style={{ padding: 8, borderRadius: 10 }}>
          <option value={ALL}>All decks ({totalAll})</option>
          {decks.map((d) => (
            <option key={d} value={d}>
              {d} ({deckCounts[d]})
            </option>
          ))}
        </select>
      </label>
    </div>
  ) : null;

  return (
    <Layout onNext={next} onPrev={prev} onRand={rand} Controls={Controls}>
      {!ready ? (
        <p style={{ opacity: 0.7 }}>Loading cards…</p>
      ) : (
        <MarkdownCard
          path={current.path}
          onNavigate={onNavigate}
        />
      )}
    </Layout>
  );
}
