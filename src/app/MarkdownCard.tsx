import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { withBase } from "./utils/url";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { CardRef } from "./types";

type Props = {
  path: string;
  className?: string;
  onNavigate: (s: string) => void;
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
export function MarkdownCard({ path, className, onNavigate }: Props) {
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

          components={{
            a({ href, children, ...props }) {
              if (!href) return <a {...props}>{children}</a>;
              // detect relative link to another .md under cards/
              if (href.endsWith(".md") && !href.startsWith("http")) {
                return (
                  <a
                    href={href}
                    onClick={(e) => {
                        e.preventDefault();
                        onNavigate(href);
                      }
                    }
                  >
                    {children}
                  </a>
                );
              }
              // default: external link
              return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
            }
          }}
        >{content}</ReactMarkdown>
      )}
    </article>
  );
}
