import type { LeadSource } from "@/lib/analytics";

export type Lead = {
  reference: string;
  form: string;
  source: LeadSource;
  destination: string;
  submittedAt: string;
  values: Record<string, string>;
};

/**
 * Hands a lead to the sales or service team. Set LEAD_WEBHOOK_URL to forward every lead
 * as JSON to a CRM, email service or automation tool (HubSpot, Zapier, Make and so on).
 * Without it, leads are written to the server log.
 */
export async function deliverLead(lead: Lead) {
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!webhook) {
    console.info("[lead]", JSON.stringify(lead));
    return;
  }
  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Lead webhook responded with ${response.status}`);
}
