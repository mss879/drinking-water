"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { saveChatSettings } from "@/app/actions/admin/chats";
import { Field, Input, Textarea } from "@/components/admin/ui/field";
import { Panel } from "@/components/admin/ui/panel";
import { toast } from "@/components/admin/ui/toaster";
import { TextListEditor } from "@/components/admin/website/list-editors";
import { Button } from "@/components/ui/button";
import { chatLimits, priceModes, type ChatSettings } from "@/lib/chat/config";
import type { ChatPriceMode } from "@/lib/supabase/types";

function Check({ checked, onChange, label, hint }: { checked: boolean; onChange: (value: boolean) => void; label: string; hint: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[15px] text-ink">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 size-4 accent-[var(--color-deep)]" />
      <span>
        {label}
        <span className="block text-[13px] text-muted">{hint}</span>
      </span>
    </label>
  );
}

export type ChatServices = { openai: boolean; model: string; email: boolean; from: string; salesEmail: string };

/** The chat assistant's settings: whether it shows and answers, how it greets visitors, what it may quote, extra instructions and alerts. */
export function ChatSettingsForm({ initial, services }: { initial: ChatSettings; services: ChatServices }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof ChatSettings>(key: K, value: ChatSettings[K]) => setForm((current) => ({ ...current, [key]: value }));
  const count = (value: string, max: number) => `${value.trim().length}/${max}`;

  return (
    <form
      className="grid gap-5 lg:grid-cols-2 lg:items-start"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await saveChatSettings({ ...form, alertEmail: form.alertEmail ?? "" });
          if (!result.ok) return toast(result.error, "error");
          toast(result.message ?? "Saved.");
          router.refresh();
        });
      }}
    >
      <div className="grid gap-5">
        <Panel title="On the website" description="The round chat button sits above the WhatsApp button on every page.">
          <div className="grid gap-5">
            <Check
              checked={form.widgetEnabled}
              onChange={(value) => set("widgetEnabled", value)}
              label="Show the chat on the website"
              hint="Off hides the chat button for everyone. Chats already saved stay in Chats."
            />
            <Check
              checked={form.aiEnabled}
              onChange={(value) => set("aiEnabled", value)}
              label="The assistant answers"
              hint="Off turns the assistant off in every chat: visitors can still write, and each chat waits for your team (live chat). To stop it in one chat only, take that chat over."
            />
            <Field label="Assistant’s name" htmlFor="chat-name" hint={count(form.assistantName, chatLimits.name)}>
              <Input id="chat-name" maxLength={chatLimits.name} value={form.assistantName} onChange={(event) => set("assistantName", event.target.value)} />
            </Field>
            <Field label="Greeting" htmlFor="chat-greeting" hint={`${count(form.greeting, chatLimits.greeting)} · the first message visitors see when they open the chat.`}>
              <Textarea
                id="chat-greeting"
                rows={3}
                maxLength={chatLimits.greeting}
                value={form.greeting}
                onChange={(event) => set("greeting", event.target.value)}
              />
            </Field>
            <Field
              label="Line beside the button (optional)"
              htmlFor="chat-teaser"
              hint={`${count(form.teaser, chatLimits.teaser)} · shown once per visit, on computers, a few seconds after the page opens. Leave empty for none.`}
            >
              <Input id="chat-teaser" maxLength={chatLimits.teaser} value={form.teaser} onChange={(event) => set("teaser", event.target.value)} />
            </Field>
            <TextListEditor
              label="Suggested questions"
              items={form.quickReplies}
              onChange={(items) => set("quickReplies", items.map((item) => item.slice(0, chatLimits.quickReply)))}
              placeholder="Which purifier suits my home?"
              max={chatLimits.quickReplies}
              addLabel="Add a question"
              hint="Up to four buttons under the greeting, so visitors can start with one tap."
            />
          </div>
        </Panel>

        <Panel title="Prices" description="Prices always come from Prices & quotes, AMC plans and Parts, never from the assistant’s imagination.">
          <fieldset className="grid gap-3">
            <legend className="sr-only">Which prices the assistant may quote</legend>
            {(Object.keys(priceModes) as ChatPriceMode[]).map((mode) => (
              <label
                key={mode}
                className="flex cursor-pointer items-start gap-3 rounded-card-sm border border-line p-3.5 text-[15px] text-ink transition-colors has-checked:border-deep has-checked:bg-tint"
              >
                <input
                  type="radio"
                  name="price-mode"
                  value={mode}
                  checked={form.priceMode === mode}
                  onChange={() => set("priceMode", mode)}
                  className="mt-1 size-4 accent-[var(--color-deep)]"
                />
                <span>
                  {priceModes[mode].label}
                  <span className="block text-[13px] text-muted">{priceModes[mode].hint}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="mt-5">
            <Check
              checked={form.contactFirst}
              onChange={(value) => set("contactFirst", value)}
              label="Ask for a name and phone number before quoting purifier prices"
              hint="The assistant asks first, and still gives the price if the visitor would rather not share them."
            />
          </div>
        </Panel>
      </div>

      <div className="grid gap-5">
        <Panel
          title="What the assistant knows"
          description="It reads your products, prices, rental plans, AMC plans, parts, FAQs and contact details from this admin, so a change there reaches it straight away."
        >
          <Field
            label="Extra instructions (optional)"
            htmlFor="chat-instructions"
            hint={
              <>
                {count(form.instructions, chatLimits.instructions)} · for example a current offer, areas you deliver to, or anything to say or avoid. The assistant may
                repeat what’s written here, so don’t put anything confidential in it.
              </>
            }
          >
            <Textarea
              id="chat-instructions"
              rows={8}
              maxLength={chatLimits.instructions}
              className="min-h-48"
              placeholder="For example: Free installation in Colombo until 31 December. We don’t deliver to the Northern Province yet."
              value={form.instructions}
              onChange={(event) => set("instructions", event.target.value)}
            />
          </Field>
        </Panel>

        <Panel title="Leads and alerts" description="Qualified visitors go straight into the CRM’s New Leads, linked to their chat.">
          <div className="grid gap-5">
            <Field
              label="Email alerts to"
              htmlFor="chat-alert"
              hint={`New chat leads and visitors asking for a person are emailed here. Empty: ${services.salesEmail || "the sales email in Contact & social"}.`}
            >
              <Input
                id="chat-alert"
                type="email"
                inputMode="email"
                placeholder={services.salesEmail}
                value={form.alertEmail ?? ""}
                onChange={(event) => set("alertEmail", event.target.value || null)}
              />
            </Field>
            <Check
              checked={form.emailQuotes}
              onChange={(value) => set("emailQuotes", value)}
              label="Email visitors their quote when they ask for it"
              hint="Sent from your email domain, with the WhatsApp and phone numbers to reply on."
            />
            <dl className="grid gap-2 rounded-card-sm bg-tint p-4 text-[13px]">
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-muted">OpenAI (the assistant)</dt>
                <dd className="font-semibold text-ink">{services.openai ? `Connected · ${services.model}` : "Not set up: add OPENAI_API_KEY"}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-muted">Email (alerts and quotes)</dt>
                <dd className="font-semibold text-ink">{services.email ? `Connected · from ${services.from}` : "Not set up: add RESEND_API_KEY"}</dd>
              </div>
            </dl>
          </div>
        </Panel>

      </div>

      <div className="lg:col-span-2">
        <Button type="submit" loading={pending} className="w-full sm:w-auto">
          Save assistant settings
        </Button>
      </div>
    </form>
  );
}
