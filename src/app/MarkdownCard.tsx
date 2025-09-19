import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Utility: build a path that respects Vite's base ("/" in dev, "./" in build)
function withBase(p: string) {
  const base = import.meta.env.BASE_URL ?? "/";
  // ensure exactly one slash between base and path
  return (base.endsWith("/") ? base : base + "/") + p.replace(/^\/+/, "");
}

type Props = {
  /** Path under static/ (copied to site root), e.g. "cards/hello.md" */
  path?: string;
  /** Optional className for outer container */
  className?: string;
};

export function MarkdownCard({ path = "cards/hello.md", className }: Props) {
  const [content, setContent] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(withBase(path))
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} for ${path}`);
        }
        return res.text();
      })
      .then((text) => {
        if (!cancelled) {
          setContent(text);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError((e as Error).message || "Failed to load card");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return (
    <article
      className={className}
      style={{
        margin: "0 auto",
        padding: "16px",
        maxWidth: 720,
        lineHeight: 1.5,
      }}
    >
      {loading && <p style={{ opacity: 0.7 }}>Loading…</p>}
      {error && (
        <p style={{ color: "crimson" }}>
          Couldn’t load <code>{path}</code>: {error}
        </p>
      )}
      {!loading && !error && content && (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      )}
    </article>
  );
}
