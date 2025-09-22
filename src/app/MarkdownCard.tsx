import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { withBase } from "./utils/url";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

type Props = {
  /** Path under static/ (copied to site root), e.g. "cards/hello.md" */
  path: string;
  /** Optional className for outer container */
  className?: string;
};

const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "details", "summary"],
  attributes: {
    ...(defaultSchema.attributes || {}),
    details: [["open"]], // allow <details open>
    summary: []
  }
};
export function MarkdownCard({ path, className }: Props) {
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
    <article className={className}>
      {loading && <p style={{ opacity: 0.7 }}>Loading…</p>}
      {error && (
        <p style={{ color: "crimson" }}>
          Couldn’t load <code>{path}</code>: {error}
        </p>
      )}
      {!loading && !error && content && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[
            rehypeRaw,                         // parse raw HTML in MD
            [rehypeSanitize, schema],          // sanitize it safely
            [rehypeKatex, { strict: false }],  // math
            [rehypeHighlight, { ignoreMissing: true }],
            [rehypeKatex, { strict: false }]
          ]}
        >{content}</ReactMarkdown>
      )}
    </article>
  );
}
