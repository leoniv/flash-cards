import { MarkdownCard } from "./MarkdownCard";
import { Layout } from "./Layout";
import { useCardNav } from "./hooks/useCardNav";

export function App() {
  const { ready, current, deck,
    decks, deckCounts, list,
    setDeck, next, prev, rand, progress,
    markRevealedById, doResetProgress,
    setOnlyUnseen, onlyUnseen,
    onNavigate, ALL
  } = useCardNav();

  const totalAll = ready ? Object.values(deckCounts).reduce((a, b) => a + b, 0) : 0;
  const totalDeck = deck === ALL ? totalAll : (ready ? deckCounts[deck] : 0);

  const viewedInDeck = ready
    ? (deck === ALL
      ? Object.keys(progress.viewed).length
      : Object.keys(progress.viewed).filter((id) => id.startsWith(deck + "/")).length)
    : 0;

  const revealedInDeck = ready
    ? (deck === ALL
      ? Object.keys(progress.revealed).length
      : Object.keys(progress.revealed).filter((id) => id.startsWith(deck + "/")).length)
    : 0;

  const pct = totalDeck ? Math.min(100, Math.round((viewedInDeck / totalDeck) * 100)) : 0;


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

      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" checked={onlyUnseen} onChange={(e) => setOnlyUnseen(e.target.checked)} />
        Only unseen in this deck
      </label>

      {/* Progress */}
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          Viewed {viewedInDeck}/{totalDeck}{deck !== ALL ? ` in ${deck}` : ""} · Revealed {revealedInDeck}
        </div>
        <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.12)" }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: "#3b82f6" }} />
        </div>
      </div>
      <button
        onClick={doResetProgress}
        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#e6e7e9" }}
      >
        Reset progress
      </button>
      {/* Optional: small hint if nothing matches */}
      {onlyUnseen && list.length === 0 && (
        <small style={{ opacity: 0.8 }}>All caught up in this deck 🎉</small>
      )}
    </div>
  ) : null;

  return (
    <Layout onNext={next} onPrev={prev} onRand={rand} Controls={Controls}>
      {!ready ? (
        <p style={{ opacity: 0.7 }}>Loading cards…</p>
      ) : (
        <MarkdownCard
          path={current.path}
          onAnyDetailsOpen={() => markRevealedById(current.id)}
          onNavigate={onNavigate}
        />
      )}
    </Layout>
  );
}
