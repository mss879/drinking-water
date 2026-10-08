/**
 * Editable page text. Each page declares its text as blocks in content/copy/<page>.ts: a key, how the admin names it,
 * its fields and their defaults (the website's wording as designed). The website reads a block with getCopy()
 * (lib/cms/content.ts), which lays what the admin saved over the defaults field by field. Anything missing or invalid
 * falls back to the default, so a page always renders as designed. The admin's Page text section builds its forms
 * from the same declarations and checks every save with checkBlock() below.
 *
 * In the text itself:
 * - *asterisks* mark the words a heading sets in brand blue (or bold, where the design says so); each field says how
 *   many it has room for.
 * - {tokens} such as {name} or {price} are filled in by the page; a field lists the tokens it must keep.
 */

export type Marks = "one" | "optional" | "none";

export type TextField = {
  kind: "text";
  label: string;
  /** Most characters allowed: about today's longest wording plus a fifth, so the layout holds. */
  max: number;
  /** A paragraph (keeps line breaks) rather than a single line. */
  multiline?: boolean;
  /** How many *marked* phrases the design has room for: exactly one, at most one, or none (the default). */
  marks?: Marks;
  /** Tokens the text must keep, e.g. ["{price}"]. */
  tokens?: string[];
  /** May be left empty (the page then leaves it out). */
  optional?: boolean;
  hint?: string;
};

export type ListField = {
  kind: "list";
  label: string;
  /** How many lines are allowed. A fixed count (e.g. [4, 4]) keeps icons and grid columns matched. */
  count: readonly [number, number];
  /** Most characters per line. */
  max: number;
  marks?: Marks;
  tokens?: string[];
  /** What one line is called in the admin ("Phrase", "Line"). */
  itemLabel?: string;
  /** Names for each line in the admin, when every position means something (an icon, a link, a plan). */
  itemNames?: readonly string[];
  /** false: the lines keep their places (their icons or links follow position), so they can't be reordered. */
  reorder?: boolean;
  hint?: string;
};

export type CardsField = {
  kind: "cards";
  label: string;
  count: readonly [number, number];
  /** The fields of each card, e.g. { title: {...}, body: {...} }. */
  item: Record<string, TextField>;
  /** What one card is called in the admin ("Step", "Benefit"). */
  itemLabel?: string;
  /** Names for each card in the admin, when every position means something (an icon, a link, a plan). */
  itemNames?: readonly string[];
  /** false: the cards keep their places (their icons or links follow position), so they can't be reordered. */
  reorder?: boolean;
  hint?: string;
};

export type Field = TextField | ListField | CardsField;

export type CopyValue = string | string[] | Record<string, string>[];
export type CopyData = Record<string, CopyValue>;

type FieldFor<V> = V extends string
  ? TextField
  : V extends string[]
    ? ListField
    : V extends Record<string, string>[]
      ? Omit<CardsField, "item"> & { item: { [K in keyof V[number]]: TextField } }
      : never;

export type Block<D extends CopyData = CopyData> = {
  /** "<page>.<name>", e.g. "home.hero". Saved under this key, so never rename one that has shipped. */
  key: string;
  label: string;
  description?: string;
  fields: { [K in keyof D]: FieldFor<D[K]> };
  defaults: D;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyBlock = Block<any>;

/** Declares a block. The field definitions are checked against the defaults' shape. */
export function defineBlock<D extends CopyData>(block: { key: string; label: string; description?: string; fields: NoInfer<Block<D>["fields"]>; defaults: D }): Block<D> {
  return block;
}

/**
 * A page's search title and description (the "<page>.seo" block). Titles over 60 characters drop the " | LUSAKO"
 * suffix (lib/seo.ts), and search results cut descriptions at about 160.
 */
export function seoBlock(page: string, defaults: { title: string; description: string }) {
  return defineBlock({
    key: `${page}.seo`,
    label: "Search & sharing",
    description:
      "The title and description Google and social cards show for this page. Keep the title under 60 characters (longer ones drop “ | LUSAKO”) and the description between 120 and 160.",
    fields: {
      title: { kind: "text", label: "Title", max: 70 },
      description: { kind: "text", label: "Description", max: 165 },
    },
    defaults,
  });
}

// ---------------------------------------------------------------- checking --

type Checked<T> = { ok: true; value: T } | { ok: false; error: string };

const MARKED = /\*([^*\n]+)\*/g;
const TOKEN = /\{[a-zA-Z]+\}/g;

function checkString(
  value: unknown,
  rules: { max: number; multiline?: boolean; marks?: Marks; tokens?: string[]; optional?: boolean },
): Checked<string> {
  if (typeof value !== "string") return { ok: false, error: "Enter some text." };
  const text = rules.multiline
    ? value
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((line) => line.replace(/[ \t]+/g, " ").trim())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : value.replace(/\s+/g, " ").trim();
  if (!text) return rules.optional ? { ok: true, value: "" } : { ok: false, error: "This can’t be empty." };
  if (text.length > rules.max) return { ok: false, error: `Keep it to ${rules.max} characters so it fits the design (it’s ${text.length} now).` };

  const marks = text.match(MARKED)?.length ?? 0;
  if (text.replace(MARKED, "").includes("*")) return { ok: false, error: "Every * needs a partner: wrap the highlighted words like *this*." };
  const allowed = rules.marks ?? "none";
  if (allowed === "one" && marks !== 1) return { ok: false, error: "Wrap exactly one phrase in *asterisks*: it’s the part shown in blue." };
  if (allowed === "optional" && marks > 1) return { ok: false, error: "Only one phrase can be highlighted with *asterisks*." };
  if (allowed === "none" && marks > 0) return { ok: false, error: "This text can’t have a highlight. Remove the * signs." };

  const tokens = rules.tokens ?? [];
  const missing = tokens.find((token) => !text.includes(token));
  if (missing) return { ok: false, error: `Keep ${missing} in the text: the website fills it in.` };
  const unknown = (text.match(TOKEN) ?? []).find((token) => !tokens.includes(token));
  if (unknown) return { ok: false, error: `${unknown} isn’t filled in here. Remove the curly brackets.` };
  return { ok: true, value: text };
}

/** Checks one field's value against its definition. */
export function checkField(field: Field, value: unknown): Checked<CopyValue> {
  if (field.kind === "text") return checkString(value, field);

  const [min, max] = field.count;
  if (!Array.isArray(value)) return { ok: false, error: "Something went wrong with this list. Reload and try again." };
  if (value.length < min || value.length > max) {
    return { ok: false, error: min === max ? `This needs exactly ${min}.` : `This needs between ${min} and ${max}.` };
  }

  if (field.kind === "list") {
    const lines: string[] = [];
    for (const [i, line] of value.entries()) {
      const checked = checkString(line, field);
      if (!checked.ok) return { ok: false, error: `${field.itemLabel ?? "Line"} ${i + 1}: ${checked.error}` };
      lines.push(checked.value);
    }
    return { ok: true, value: lines };
  }

  const cards: Record<string, string>[] = [];
  for (const [i, card] of value.entries()) {
    if (!card || typeof card !== "object" || Array.isArray(card)) return { ok: false, error: "Something went wrong with this list. Reload and try again." };
    const clean: Record<string, string> = {};
    for (const [name, def] of Object.entries(field.item)) {
      const checked = checkString((card as Record<string, unknown>)[name], def);
      if (!checked.ok) return { ok: false, error: `${field.itemLabel ?? "Item"} ${i + 1}, ${def.label.toLowerCase()}: ${checked.error}` };
      clean[name] = checked.value;
    }
    cards.push(clean);
  }
  return { ok: true, value: cards };
}

const same = (a: CopyValue, b: CopyValue) => JSON.stringify(a) === JSON.stringify(b);

/**
 * What the website shows for a block: each saved field that still passes its checks, over the default. Saved text from
 * an older version of a block (a renamed field, a changed count) quietly falls back to the default.
 */
export function copyFrom<D extends CopyData>(block: Block<D>, saved: unknown): D {
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return block.defaults;
  const result = { ...block.defaults };
  for (const name of Object.keys(block.fields) as (keyof D & string)[]) {
    if (!(name in saved)) continue;
    const checked = checkField(block.fields[name] as Field, (saved as Record<string, unknown>)[name]);
    if (checked.ok) result[name] = checked.value as D[typeof name];
  }
  return result;
}

/**
 * Checks a whole block from the admin. Returns only the fields that differ from the defaults (so a later change to a
 * default still reaches every field nobody edited), or the first problem per field.
 */
export function checkBlock<D extends CopyData>(block: Block<D>, input: unknown): { changes: Partial<D>; errors: Record<string, string> } {
  const changes: Partial<D> = {};
  const errors: Record<string, string> = {};
  const values = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
  for (const name of Object.keys(block.fields) as (keyof D & string)[]) {
    if (!(name in values)) continue;
    const checked = checkField(block.fields[name] as Field, values[name]);
    if (!checked.ok) errors[name] = checked.error;
    else if (!same(checked.value, block.defaults[name])) changes[name] = checked.value as D[typeof name];
  }
  return { changes, errors };
}

// --------------------------------------------------------------- rendering --

/** The text with its *marks* and {tokens} removed or filled: for titles, descriptions and screen-reader labels. */
export function plain(text: string, values: Record<string, string | number> = {}) {
  return fill(text, values).replace(MARKED, "$1");
}

/** Fills {tokens} in. Unknown tokens are left as they are. */
export function fill(text: string, values: Record<string, string | number>) {
  return text.replace(TOKEN, (token) => {
    const value = values[token.slice(1, -1)];
    return value === undefined ? token : String(value);
  });
}

/**
 * Text split at its {tokens}, each filled in as a piece of its own. Rendered as an array, every piece stays its own
 * text, as in the JSX the text replaced (`Buy the {label}, installed by LUSAKO`). Unknown tokens are left as they are.
 */
export function pieces(text: string, values: Record<string, string | number>): string[] {
  return text
    .split(/(\{[a-zA-Z]+\})/)
    .filter(Boolean)
    .map((part) => {
      const value = /^\{[a-zA-Z]+\}$/.test(part) ? values[part.slice(1, -1)] : undefined;
      return value === undefined ? part : String(value);
    });
}

/** Splits marked text into plain and *marked* runs, for components/ui/marked.tsx. */
export function runs(text: string): { text: string; marked: boolean }[] {
  const parts: { text: string; marked: boolean }[] = [];
  let last = 0;
  for (const match of text.matchAll(MARKED)) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), marked: false });
    parts.push({ text: match[1], marked: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), marked: false });
  return parts;
}
