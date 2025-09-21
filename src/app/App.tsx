import { MarkdownCard } from "./MarkdownCard";
import { Layout } from "./Layout";

export function App() {
  const handleNext = () => {
    // TODO: plug in your card-switching logic
    // e.g., go to next path from a list
    console.log("Next clicked");
  };

  const Controls = (
    <div style={{ display: "grid", gap: 10 }}>
      {/* Put filters/search/etc. here later */}
      <small style={{ opacity: 0.7 }}>More controls coming…</small>
    </div>
  );

  return (
    <Layout onNext={handleNext} Controls={Controls}>
        <MarkdownCard path="cards/hello.md" />
    </Layout>
  );
}
