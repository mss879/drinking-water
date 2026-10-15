import type { SiteContact } from "@/content/site";
import { site } from "@/content/site";
import { priceText, quoteLines, quoteTotals, type Quote } from "@/lib/chat/quote";
import { telHref, whatsappHref } from "@/lib/contact";

/**
 * The chat's emails, as self-contained HTML (tables and inline styles, which every email app understands) with a
 * plain-text version. Brand colours only: deep blue buttons, brand blue accents, ink headings, grey text.
 */

const colors = { deep: "#0055A8", brand: "#278CF0", ink: "#0A0A0D", text: "#545454", tint: "#EDF5FE", line: "#D4E8FC", white: "#FFFFFF" };
const font = "Montserrat, 'Segoe UI', Helvetica, Arial, sans-serif";

export function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const nl2br = (value: string) => escapeHtml(value).replace(/\n/g, "<br>");

function button(href: string, label: string) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${colors.deep};color:${colors.white};font-family:${font};font-size:15px;font-weight:600;text-decoration:none;padding:13px 26px;border-radius:999px">${escapeHtml(label)}</a>`;
}

function layout({ preheader, body }: { preheader: string; body: string }) {
  const logo = new URL("/brand/lusako-logo.png", site.url).toString();
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LUSAKO</title></head>
<body style="margin:0;padding:0;background:${colors.tint}">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colors.tint}">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${colors.white};border:1px solid ${colors.line};border-radius:16px">
<tr><td style="padding:28px 32px 8px"><img src="${logo}" alt="LUSAKO" width="132" style="display:block;border:0;height:auto;width:132px"></td></tr>
<tr><td style="padding:8px 32px 32px;font-family:${font};font-size:15px;line-height:1.6;color:${colors.text}">${body}</td></tr>
</table>
<p style="margin:20px 0 0;font-family:${font};font-size:12px;line-height:1.6;color:${colors.text}">${escapeHtml(site.legalName)} · ${escapeHtml(site.descriptor)}<br><a href="${site.url}" style="color:${colors.deep}">${escapeHtml(new URL(site.url).host)}</a></p>
</td></tr>
</table>
</body>
</html>`;
}

function quoteTable(quote: Quote) {
  const rows = quote.lines
    .map(
      (line) => `<tr>
<td style="padding:12px 0;border-bottom:1px solid ${colors.line};font-family:${font};font-size:14px;color:${colors.ink};vertical-align:top">${line.alternative ? `<span style="color:${colors.deep};font-weight:600">Option · </span>` : ""}<strong>${escapeHtml(line.label)}</strong><br><span style="font-size:13px;color:${colors.text}">${escapeHtml(line.detail)}</span></td>
<td align="right" style="padding:12px 0 12px 16px;border-bottom:1px solid ${colors.line};font-family:${font};font-size:14px;color:${colors.ink};white-space:nowrap;vertical-align:top"><strong>${escapeHtml(priceText(line.amount))}</strong>${line.amount !== null && line.billing !== "one-time" ? `<br><span style="font-size:12px;color:${colors.text}">${line.billing === "monthly" ? "a month" : "a year"}</span>` : ""}</td>
</tr>`,
    )
    .join("");
  const totals = quoteTotals(quote);
  const totalRow = totals.length
    ? `<tr><td style="padding:14px 0 0;font-family:${font};font-size:14px;font-weight:700;color:${colors.ink}">Total</td><td align="right" style="padding:14px 0 0 16px;font-family:${font};font-size:15px;font-weight:700;color:${colors.deep}">${totals.map(escapeHtml).join("<br>")}</td></tr>`
    : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 8px">${rows}${totalRow}</table>`;
}

/** The quote a visitor asked for in the chat, sent to them. */
export function quoteEmail({ name, quote, contact }: { name: string | null; quote: Quote; contact: SiteContact }) {
  const first = name?.trim().split(/\s+/)[0] ?? "";
  const phone = contact.phones[0] ?? "";
  const notes = quote.notes.map((note) => `<li style="margin:0 0 6px">${escapeHtml(note)}</li>`).join("");
  const body = `
<h1 style="margin:16px 0 8px;font-family:Raleway,${font};font-size:24px;line-height:1.25;color:${colors.ink}">Your LUSAKO quote</h1>
<p style="margin:0">${first ? `Hi ${escapeHtml(first)}, thank` : "Thank"} you for chatting with us. Here is the quote we worked out together.</p>
${quoteTable(quote)}
<ul style="margin:16px 0 0;padding-left:18px;font-size:13px;color:${colors.text}">${notes}</ul>
<p style="margin:24px 0 0">Our team will be in touch to confirm the details${contact.hours ? ` (${escapeHtml(contact.hours)})` : ""}. Want to go ahead or have a question?</p>
<p style="margin:20px 0 0">${contact.whatsappSales ? button(whatsappHref(contact.whatsappSales), "Message us on WhatsApp") : button(`${site.url}/contact`, "Contact LUSAKO")}</p>
${phone ? `<p style="margin:16px 0 0;font-size:14px">Or call <a href="${escapeHtml(telHref(phone))}" style="color:${colors.deep};font-weight:600">${escapeHtml(phone)}</a>${contact.salesEmail ? `, or reply to <a href="mailto:${escapeHtml(contact.salesEmail)}" style="color:${colors.deep}">${escapeHtml(contact.salesEmail)}</a>` : ""}.</p>` : ""}`;

  const text = [
    `${first ? `Hi ${first}, thank` : "Thank"} you for chatting with LUSAKO. Here is the quote we worked out together:`,
    "",
    ...quote.lines.map((line) => `${line.alternative ? "Option: " : ""}${line.label} (${line.detail}): ${priceText(line.amount)}${line.amount !== null && line.billing !== "one-time" ? (line.billing === "monthly" ? " a month" : " a year") : ""}`),
    ...(quoteTotals(quote).length ? ["", `Total: ${quoteTotals(quote).join(", ")}`] : []),
    "",
    ...quote.notes.map((note) => `- ${note}`),
    "",
    `Questions? WhatsApp ${contact.whatsappSales || phone}${phone ? `, call ${phone}` : ""}${contact.salesEmail ? ` or email ${contact.salesEmail}` : ""}.`,
    "",
    `${site.legalName} · ${site.url}`,
  ].join("\n");

  return {
    subject: "Your LUSAKO quote",
    html: layout({ preheader: quoteTotals(quote).join(" · ") || "The quote from your chat with LUSAKO", body }),
    text,
    replyTo: contact.salesEmail || undefined,
  };
}

export type AlertDetails = {
  kind: "lead" | "person";
  chatUrl: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  location: string | null;
  interest: string | null;
  summary: string | null;
  reason: string | null;
  quote: Quote | null;
  /** The visitor's latest message, for requests for a person. */
  lastMessage: string | null;
};

/** Tells the team about a new chat lead, or that a visitor wants to talk to a person. */
export function teamAlertEmail(details: AlertDetails) {
  const who = details.name || "A website visitor";
  const subject =
    details.kind === "lead"
      ? `New chat lead: ${who}${details.interest ? ` (${details.interest})` : ""}`
      : `${who} would like to talk to a person`;
  const rows = (
    [
      ["Name", details.name],
      ["Phone", details.phone],
      ["Email", details.email],
      ["Company", details.company],
      ["Location", details.location],
      ["Looking for", details.interest],
      ["Why", details.reason],
      ["Last message", details.lastMessage],
    ] as const
  )
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;font-family:${font};font-size:13px;color:${colors.text};vertical-align:top;white-space:nowrap">${label}</td><td style="padding:6px 0;font-family:${font};font-size:14px;color:${colors.ink};font-weight:600">${nl2br(String(value))}</td></tr>`,
    )
    .join("");
  const body = `
<h1 style="margin:16px 0 8px;font-family:Raleway,${font};font-size:22px;line-height:1.3;color:${colors.ink}">${escapeHtml(
    details.kind === "lead" ? "A new lead from the website chat" : "A visitor asked for a person",
  )}</h1>
<p style="margin:0">${
    details.kind === "lead"
      ? "The chat assistant saved this visitor in the CRM (New Leads)."
      : "Open the chat and take over to reply to them there, or call them back."
  }</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0">${rows}</table>
${details.summary ? `<p style="margin:0 0 6px;font-size:13px;color:${colors.text}">The assistant’s note</p><p style="margin:0;padding:14px 16px;background:${colors.tint};border-radius:12px;color:${colors.ink}">${nl2br(details.summary)}</p>` : ""}
${details.quote ? `<p style="margin:20px 0 0;font-size:13px;color:${colors.text}">Quoted in the chat</p>${quoteTable(details.quote)}` : ""}
<p style="margin:24px 0 0">${button(details.chatUrl, "Open the chat")}</p>`;

  const text = [
    subject,
    "",
    ...(
      [
        ["Name", details.name],
        ["Phone", details.phone],
        ["Email", details.email],
        ["Company", details.company],
        ["Location", details.location],
        ["Looking for", details.interest],
        ["Why", details.reason],
        ["Last message", details.lastMessage],
      ] as const
    )
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`),
    ...(details.summary ? ["", `The assistant's note: ${details.summary}`] : []),
    ...(details.quote ? ["", "Quoted:", ...quoteLines(details.quote).map((line) => `- ${line}`), ...(quoteTotals(details.quote).length ? [`Total: ${quoteTotals(details.quote).join(", ")}`] : [])] : []),
    "",
    `Open the chat: ${details.chatUrl}`,
  ].join("\n");

  return { subject, html: layout({ preheader: subject, body }), text, replyTo: details.email || undefined };
}


/** Tells the team about a new inquiry from one of the website's forms (app/actions/leads.ts), with everything it says. */
export function inquiryAlertEmail({
  form,
  reference,
  name,
  rows,
  adminUrl,
  replyTo,
}: {
  /** The form's name, e.g. "Buy a purifier". */
  form: string;
  reference: string;
  name: string;
  /** Each answer with its field's label, in the form's order. */
  rows: [label: string, value: string][];
  adminUrl: string;
  replyTo?: string;
}) {
  const subject = `New inquiry: ${name} (${form}) · ${reference}`;
  const table = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;font-family:${font};font-size:13px;color:${colors.text};vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 0;font-family:${font};font-size:14px;color:${colors.ink};font-weight:600">${nl2br(value)}</td></tr>`,
    )
    .join("");
  const body = `
<h1 style="margin:16px 0 8px;font-family:Raleway,${font};font-size:22px;line-height:1.3;color:${colors.ink}">A new inquiry from the website</h1>
<p style="margin:0">${escapeHtml(form)} form · reference <strong style="color:${colors.ink}">${escapeHtml(reference)}</strong>. It’s saved in the admin’s Inquiries.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0">${table}</table>
<p style="margin:24px 0 0">${button(adminUrl, "Open in the admin")}</p>`;
  const text = [subject, "", ...rows.map(([label, value]) => `${label}: ${value}`), "", `Open in the admin: ${adminUrl}`].join("\n");
  return { subject, html: layout({ preheader: subject, body }), text, replyTo };
}
