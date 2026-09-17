type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

/** Structured data, rendered the way the Next.js 16 JSON-LD guide recommends. */
export function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
