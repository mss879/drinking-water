"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { Mail, MessageCircle, Phone, SquareKanban, Trash2 } from "lucide-react";
import {
  deleteInquiries,
  markInquiriesRead,
  moveInquiriesToCrm,
  saveInquiryNotes,
  setInquiryStatus,
} from "@/app/actions/admin/inquiries";
import type { InquiryDetailData } from "@/components/admin/inquiries/inquiries-view";
import { Badge, inquiryStatuses } from "@/components/admin/ui/badge";
import { ConfirmDialog, Dialog } from "@/components/admin/ui/dialog";
import { Field, Select, Textarea } from "@/components/admin/ui/field";
import { toast } from "@/components/admin/ui/toaster";
import { Button, ButtonLink, buttonClasses } from "@/components/ui/button";
import { formatDateTime, whatsappNumber } from "@/lib/admin/format";
import { detailRows, formTypeLabels } from "@/lib/admin/inquiries";
import type { InquiryStatus } from "@/lib/supabase/types";

const regionNames = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
const channelLabels: Record<string, string> = {
  direct: "Direct",
  organic: "Search",
  social: "Social",
  referral: "Another website",
  email: "Email",
  paid: "Paid ads",
  ai: "AI assistant",
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3 py-2 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 font-medium break-words text-ink">{children}</dd>
    </div>
  );
}

/** One inquiry in full: what they asked for, how to reach them, where they came from, and what to do next. */
export function InquiryDetail({ data, onClose }: { data: InquiryDetailData; onClose: () => void }) {
  const { inquiry, leadId, session } = data;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status);
  const [notes, setNotes] = useState(inquiry.admin_notes ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const markedRead = useRef(false);

  // Opening an unread inquiry marks it read (and updates the badge).
  useEffect(() => {
    if (inquiry.read_at || markedRead.current) return;
    markedRead.current = true;
    void markInquiriesRead([inquiry.id]).then((result) => {
      if (result.ok) router.refresh();
    });
  }, [inquiry.id, inquiry.read_at, router]);

  const wa = whatsappNumber(inquiry.phone);
  const firstName = inquiry.name.split(" ")[0];
  const utm = (inquiry.utm ?? {}) as Record<string, string>;
  const details = detailRows(inquiry, data.catalogue);

  function run(action: () => Promise<{ ok: boolean; error?: string; message?: string }>, done?: () => void) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        if (result.message) toast(result.message);
        done?.();
        router.refresh();
      } else toast(result.error ?? "Something went wrong.", "error");
    });
  }

  return (
    <Dialog
      open
      side
      onClose={onClose}
      title={inquiry.name}
      description={
        <>
          {inquiry.reference} · {formatDateTime(inquiry.created_at)}
        </>
      }
    >
      <div className="grid gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="white">{formTypeLabels[inquiry.form_type]}</Badge>
          {leadId && (
            <Badge tone="soft">
              <SquareKanban aria-hidden className="size-3" />
              In CRM
            </Badge>
          )}
        </div>

        {/* Reach them */}
        <div className="grid grid-cols-3 gap-2">
          {inquiry.phone ? (
            <a href={`tel:${inquiry.phone.replace(/\s/g, "")}`} className={buttonClasses({ variant: "outline", size: "sm" })}>
              <Phone aria-hidden className="size-4" />
              Call
            </a>
          ) : (
            <span />
          )}
          {wa ? (
            <a
              href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi ${firstName}, this is LUSAKO about your request ${inquiry.reference}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ variant: "outline", size: "sm" })}
            >
              <MessageCircle aria-hidden className="size-4" />
              WhatsApp
            </a>
          ) : (
            <span />
          )}
          {inquiry.email ? (
            <a
              href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Your LUSAKO request ${inquiry.reference}`)}`}
              className={buttonClasses({ variant: "outline", size: "sm" })}
            >
              <Mail aria-hidden className="size-4" />
              Email
            </a>
          ) : (
            <span />
          )}
        </div>

        <section>
          <h3 className="font-display text-[15px] font-bold text-ink">Contact</h3>
          <dl className="mt-1 divide-y divide-line">
            {inquiry.phone && <Row label="Phone">{inquiry.phone}</Row>}
            {inquiry.email && <Row label="Email">{inquiry.email}</Row>}
            {inquiry.company && <Row label="Company">{inquiry.company}</Row>}
            {inquiry.location && <Row label="Location">{inquiry.location}</Row>}
          </dl>
        </section>

        {(inquiry.message || details.length > 0) && (
          <section>
            <h3 className="font-display text-[15px] font-bold text-ink">Request</h3>
            {inquiry.message && (
              <p className="mt-2 rounded-card-sm bg-tint px-4 py-3 text-[15px] leading-relaxed whitespace-pre-line text-ink">{inquiry.message}</p>
            )}
            {details.length > 0 && (
              <dl className="mt-2 divide-y divide-line">
                {details.map((row) => (
                  <Row key={row.label} label={row.label}>
                    {row.value}
                  </Row>
                ))}
              </dl>
            )}
          </section>
        )}

        <section>
          <h3 className="font-display text-[15px] font-bold text-ink">Where they came from</h3>
          <dl className="mt-1 divide-y divide-line">
            {inquiry.page_path && <Row label="Sent from">{inquiry.page_path}</Row>}
            {utm.landing_path && <Row label="First page">{utm.landing_path}</Row>}
            {session && <Row label="Channel">{channelLabels[session.channel] ?? session.channel}</Row>}
            {(inquiry.referrer || session?.referrer_host) && <Row label="Referrer">{session?.referrer_host ?? inquiry.referrer}</Row>}
            {utm.utm_campaign && <Row label="Campaign">{utm.utm_campaign}</Row>}
            {(utm.utm_source || utm.utm_medium) && <Row label="Source / medium">{[utm.utm_source, utm.utm_medium].filter(Boolean).join(" / ")}</Row>}
            {session && (
              <Row label="Device">{[session.device && session.device[0].toUpperCase() + session.device.slice(1), session.browser, session.os].filter(Boolean).join(" · ")}</Row>
            )}
            {session?.country && (
              <Row label="Location">
                {[session.city, regionNames?.of(session.country) ?? session.country].filter(Boolean).join(", ")}
                {session.geo_source === "timezone" && <span className="font-normal text-muted"> (estimated)</span>}
              </Row>
            )}
            {session && <Row label="Pages that visit">{session.pageviews}</Row>}
            {!session && !inquiry.page_path && <p className="py-2 text-sm text-muted">No visit data for this one.</p>}
          </dl>
        </section>

        <section className="grid gap-4">
          <Field label="Status" htmlFor="inquiry-status">
            <Select
              id="inquiry-status"
              value={status}
              disabled={pending}
              onChange={(event) => {
                const next = event.target.value as InquiryStatus;
                setStatus(next);
                run(() => setInquiryStatus([inquiry.id], next));
              }}
            >
              {Object.entries(inquiryStatuses).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Internal notes" htmlFor="inquiry-notes" hint="Only admins see these.">
            <Textarea id="inquiry-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={5000} />
          </Field>
          <div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending || notes === (inquiry.admin_notes ?? "")}
              onClick={() => run(() => saveInquiryNotes(inquiry.id, notes))}
            >
              Save notes
            </Button>
          </div>
        </section>

        <div className="flex flex-wrap gap-2 border-t border-line pt-5">
          {leadId ? (
            <ButtonLink href={`/admin/crm?lead=${leadId}`} arrow>
              View in CRM
            </ButtonLink>
          ) : (
            <Button type="button" disabled={pending} onClick={() => run(() => moveInquiriesToCrm([inquiry.id]))}>
              <SquareKanban aria-hidden className="size-4" />
              Move to CRM
            </Button>
          )}
          <Button type="button" variant="ghost" disabled={pending} onClick={() => setConfirmDelete(true)} className="ml-auto">
            <Trash2 aria-hidden className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        pending={pending}
        title="Delete this inquiry?"
        description={leadId ? "It will be removed for good. Its lead stays in the CRM." : "It will be removed for good."}
        onConfirm={() =>
          run(
            () => deleteInquiries([inquiry.id]),
            () => {
              setConfirmDelete(false);
              onClose();
            },
          )
        }
      />
    </Dialog>
  );
}
