import { MarkdownCard } from "./MarkdownCard";
import { Layout } from "./Layout";
import { useCardNav } from "./hooks/useCardNav";

export function App() {
  const { ready, current, deck, decks, setDeck, next, prev, rand } = useCardNav();

  const Controls = ready ? (
    <div style={{ display: "grid", gap: 10 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ opacity: 0.8 }}>Deck</span>
        <select
          value={deck}
          onChange={(e) => setDeck(e.target.value)}
          style={{ padding: "8px", borderRadius: 10 }}
        >
          <option value="__all__">All decks</option>
          {decks.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </label>
      {/* optional: counts */}
      <small style={{ opacity: 0.7 }}>
        {deck === "__all__" ? "All" : deck}: {ready ? current ? "showing 1 card (of many)" : "" : ""}
      </small>
    </div>
  ) : null;

  return (
    <Layout onNext={next} onPrev={prev} onRand={rand} Controls={Controls}>
        {!ready ? (
          <p style={{ opacity: 0.7 }}>Loading cards…</p>
        ) : (
          <MarkdownCard path={current.path} />
        )}
    </Layout>
  );
}
