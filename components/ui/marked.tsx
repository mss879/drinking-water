import { Fragment, type ReactNode } from "react";
import { Highlight } from "@/components/ui/highlight";
import { fill, runs } from "@/content/copy/schema";

/**
 * Renders admin-editable text (content/copy): the *marked* phrase goes through `mark` (brand-blue <Highlight> unless
 * the slot says otherwise) and {tokens} are filled from `values`. Plain runs stay plain strings, so word-split headings
 * still animate word by word.
 */
export function marked(
  text: string,
  {
    mark = (phrase: string) => <Highlight>{phrase}</Highlight>,
    values = {},
  }: { mark?: (phrase: string, index: number) => ReactNode; values?: Record<string, string | number> } = {},
): ReactNode {
  const parts = runs(fill(text, values));
  if (parts.length === 1 && !parts[0].marked) return parts[0].text;
  let marks = 0;
  return parts.map((part, i) => (part.marked ? <Fragment key={i}>{mark(part.text, marks++)}</Fragment> : part.text));
}

/** Paragraphs from multi-line admin text: one <p> per blank-line-separated block. */
export function paragraphs(text: string, className?: string, values: Record<string, string | number> = {}): ReactNode {
  return fill(text, values)
    .split(/\n{2,}/)
    .map((block, i) => (
      <p key={i} className={className}>
        {block}
      </p>
    ));
}
