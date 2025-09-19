import { MarkdownCard } from "./MarkdownCard";

export function App() {
  return (
    <main
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        padding: "8px",
      }}
    >
      <header style={{ padding: "8px 0" }}>
        <h1 style={{ fontSize: "1.25rem", margin: 0 }}>Flashcards</h1>
        <p style={{ margin: "4px 0 0", opacity: 0.8 }}>
          One Markdown card (more navigation soon)
        </p>
      </header>

      <MarkdownCard path="cards/hello.md" />
    </main>
  );
}
