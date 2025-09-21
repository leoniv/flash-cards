import { MarkdownCard } from "./MarkdownCard";
import { Layout } from "./Layout";
import { useCardNav } from "./hooks/useCardNav";

export function App() {
  const { ready, currentPath, next, prev, rand /*, list, error */ } = useCardNav();

  const Controls = (
    <div style={{ display: "grid", gap: 10 }}>
      {/* TODO: Put filters/search/etc. here later */}
      <small style={{ opacity: 0.7 }}>More controls coming…</small>
    </div>
  );

  return (
    <Layout onNext={next} onPrev={prev} onRand={rand} Controls={Controls}>
        {!ready ? (
          <p style={{ opacity: 0.7 }}>Loading cards…</p>
        ) : (
          <MarkdownCard path={currentPath} />
        )}
    </Layout>
  );
}
