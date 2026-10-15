"use client";

import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const linkClass = "font-semibold text-deep underline decoration-brand/40 underline-offset-2 hover:decoration-deep";

/**
 * The assistant's and the team's replies, rendered from markdown (bold, lists, links). Raw HTML and images are
 * never rendered, and links go only to the website's own pages (in the same tab, so the chat stays open), https
 * pages (a new tab), phone numbers and email addresses.
 */
export function ChatMarkdown({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  const components: Components = {
    p: ({ children }) => <p className="[&:not(:first-child)]:mt-2">{children}</p>,
    ul: ({ children }) => <ul className="mt-2 grid list-disc gap-1 pl-5 marker:text-brand first:mt-0">{children}</ul>,
    ol: ({ children }) => <ol className="mt-2 grid list-decimal gap-1 pl-5 marker:font-semibold marker:text-deep first:mt-0">{children}</ol>,
    li: ({ children }) => <li className="pl-0.5">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    a: ({ href, children }) => {
      if (href?.startsWith("/") && !href.startsWith("//")) {
        return (
          <Link href={href} onClick={onNavigate} className={linkClass}>
            {children}
          </Link>
        );
      }
      if (href && /^(https:|mailto:|tel:)/i.test(href)) {
        const external = href.toLowerCase().startsWith("https:");
        return (
          <a href={href} {...(external && { target: "_blank", rel: "noopener noreferrer" })} className={linkClass}>
            {children}
          </a>
        );
      }
      return <>{children}</>;
    },
    h1: ({ children }) => <p className="font-semibold text-ink [&:not(:first-child)]:mt-2">{children}</p>,
    h2: ({ children }) => <p className="font-semibold text-ink [&:not(:first-child)]:mt-2">{children}</p>,
    h3: ({ children }) => <p className="font-semibold text-ink [&:not(:first-child)]:mt-2">{children}</p>,
    h4: ({ children }) => <p className="font-semibold text-ink [&:not(:first-child)]:mt-2">{children}</p>,
    code: ({ children }) => <code className="rounded bg-tint px-1 text-[0.95em]">{children}</code>,
    pre: ({ children }) => <div className="mt-2 overflow-x-auto">{children}</div>,
    blockquote: ({ children }) => <div className="mt-2 border-l-2 border-mist pl-3">{children}</div>,
    table: ({ children }) => <div className="mt-2 overflow-x-auto"><table className="w-full text-left text-[13px]">{children}</table></div>,
    th: ({ children }) => <th className="border-b border-line py-1 pr-3 font-semibold">{children}</th>,
    td: ({ children }) => <td className="border-b border-line py-1 pr-3">{children}</td>,
    img: () => null,
    hr: () => null,
  };

  return (
    <Markdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
      {text}
    </Markdown>
  );
}
