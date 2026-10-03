/**
 * CSV that opens cleanly in Excel: a UTF-8 byte-order mark (so Sinhala and Tamil names survive), every cell
 * quoted, and cells that start like a formula (= + - @, tab, return) prefixed so a spreadsheet won't run them.
 */
export function toCsv(rows: (string | number | null | undefined)[][]) {
  const cell = (value: string | number | null | undefined) => {
    let text = value === null || value === undefined ? "" : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return `﻿${rows.map((row) => row.map(cell).join(",")).join("\r\n")}\r\n`;
}

export function csvResponse(filename: string, body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

/** 2026-10-02 14:05 in Sri Lanka time. */
export function csvDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Colombo", dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}
