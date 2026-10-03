import type { JSONContent } from "@tiptap/core";

/** "Pure water at home: UF or RO?" → "pure-water-at-home-uf-or-ro". */
export function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** All the text of a node, in reading order. */
export function plainText(node: JSONContent | null | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  const inner = (node.content ?? []).map(plainText);
  const block = ["paragraph", "heading", "blockquote", "listItem", "codeBlock"].includes(node.type ?? "");
  return inner.join(block ? "" : " ") + (block ? "\n" : "");
}

/** At about 200 words a minute, never less than one minute. */
export function readingMinutes(doc: JSONContent | null | undefined) {
  const words = plainText(doc).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export type TocEntry = { id: string; text: string; level: 2 | 3 };

/** The H2 and H3 headings, with unique ids, for the table of contents (the renderer uses the same ids). */
export function headings(doc: JSONContent | null | undefined): TocEntry[] {
  const seen = new Map<string, number>();
  const entries: TocEntry[] = [];
  const walk = (node: JSONContent) => {
    if (node.type === "heading") {
      const text = plainText(node).trim();
      const base = slugify(text) || "section";
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const level = Number(node.attrs?.level);
      if (text && (level === 2 || level === 3)) entries.push({ id: count ? `${base}-${count + 1}` : base, text, level });
      return;
    }
    node.content?.forEach(walk);
  };
  if (doc) walk(doc);
  return entries;
}

/** The first couple of sentences, for listings when no excerpt was written. */
export function autoExcerpt(doc: JSONContent | null | undefined, max = 180) {
  const text = plainText(doc).replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}
