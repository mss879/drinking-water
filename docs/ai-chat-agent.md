# LUSAKO Assistant: AI chat agent technical documentation

> **Last updated:** 9 October 2026
> **Author:** ARC AI
> **Project:** `drinking-water` (Next.js), drinkingwater.lk

---

## 1. Overview

The **LUSAKO Assistant** is the round chat button on every page of drinkingwater.lk. It is an AI sales agent that:

- Answers questions about LUSAKO's purifiers, renting, corporate hydration, AMC plans, filters and parts, using **what the admin publishes** (products, prices, AMC plans, parts, FAQs, contact details), read live from Supabase.
- **Gives prices** from the admin's Prices & quotes, AMC plans and Parts. Totals are **worked out in code** by the `get_quote` tool, never by the model.
- **Qualifies leads** (name, phone or email, need, location) and **puts them in the CRM** (New Leads, source "Website chat"), linked to the conversation.
- **Emails the visitor their quote** through Resend when they ask, and **emails the team** about new chat leads and visitors who want a person.
- Saves **every message** (visitor, AI, team) in Supabase. Admins read every conversation in **Admin › Chats**.
- **Hands over to a person**: visitors can press "Talk to a person", the AI calls `request_human` when it should, and an admin can **take over** any chat. That **switches the AI off for that chat** until it is handed back. A global switch turns the AI off everywhere (live chat only).
- Falls back gracefully: if an email fails, the quote is given in the chat; if the model fails, the visitor gets a holding reply with the WhatsApp number, and their message is already saved.

---

## 2. Technology stack and exact versions

| Package | Version | Purpose |
|---|---|---|
| `next` | `16.3.8` | App Router, route handler `app/api/chat/route.ts`, Server Actions for the admin |
| `react` / `react-dom` | `19.3.0` | UI |
| `ai` | `6.0.302` | Vercel AI SDK v6: `generateText`, `tool`, `stepCountIs` |
| `@ai-sdk/openai` | `3.0.124` | OpenAI provider for AI SDK v6 |
| OpenAI model | `gpt-4o-mini` | Default model; set `OPENAI_MODEL` to change it |
| `zod` | `4.6.5` | Tool input schemas |
| `resend` | `6.32.1` | Quote emails to visitors, alerts to the team |
| `@supabase/supabase-js` | `2.117.2` | Chats, messages, settings, CRM |
| `react-markdown` | `10.1.0` | Renders the assistant's replies (bold, lists, links) |
| `remark-gfm` | `4.0.1` | GitHub Flavored Markdown for `react-markdown` |

> [!IMPORTANT]
> **AI SDK v6** (the same major version as the Sponge agent). Tools use **`inputSchema`** (not `parameters`) and multi-step runs need **`stopWhen: stepCountIs(n)`**. See section 9. npm's `latest` for `ai` is now 7.x; this project deliberately stays on v6 (`ai@^6`, `@ai-sdk/openai@^3`).

There is no framer-motion: the widget animates with CSS, like the rest of the site.

---

## 3. File map

```
drinking-water/
├── app/
│   ├── api/chat/route.ts                    ← the brain: POST (send a message), GET (poll for new messages)
│   ├── actions/admin/chats.ts               ← admin actions: take over, reply, hand back, close, delete, add to CRM, settings
│   └── admin/(panel)/chats/
│       ├── page.tsx                         ← Admin › Chats (inbox + conversation)
│       └── settings/page.tsx                ← Admin › Chats › Assistant settings
├── components/
│   ├── chat/
│   │   ├── chat-launcher.tsx                ← the floating button (tiny; loads the panel on first open)
│   │   ├── chat-panel.tsx                   ← the chat window (messages, polling, Talk to a person)
│   │   └── chat-markdown.tsx                ← safe markdown for replies
│   ├── admin/chats/                         ← inbox, conversation, settings form, badges, agent name
│   ├── admin/shell/live-chats.tsx           ← live "visitor wants a person" toasts + the Chats badge
│   └── layout/site-chrome.tsx               ← renders the chat button on every public page
├── lib/chat/
│   ├── ai-context.ts                        ← the system prompt (role, rules, pricing, lead qualification, handover)
│   ├── knowledge.ts                         ← builds the knowledge from the admin's live content and prices
│   ├── quote.ts                             ← the price calculator behind get_quote (pure code)
│   ├── tools.ts                             ← get_quote, save_lead, email_quote, request_human
│   ├── store.ts                             ← chats and messages for the visitor's side (secret check, limits)
│   ├── settings.ts / config.ts              ← the assistant's settings
│   ├── email.ts / email-template.ts         ← Resend sending and the HTML emails
│   ├── saved.ts / types.ts                  ← what the browser keeps (chat id + secret) and shared types
├── supabase/migrations/20261009180000_ai_chat_agent.sql   ← chat tables, settings, CRM link (migration 10)
└── docs/ai-chat-agent.md                    ← this file
```

---

## 4. File-by-file breakdown

### 4.1 `app/api/chat/route.ts`: the API brain

**`POST /api/chat`** with `{ sessionId?, token?, message, action?: "person", page?, attribution? }`:

1. Refuses requests from other websites (`Origin` / `Sec-Fetch-Site`), bots (`isbot`) and bodies over 8 KB.
2. Rate limits with `public.rate_limit_hit` (migration 8): 120 messages per 10 minutes and 40 new chats per hour per connection (generous, because Sri Lankan mobile networks put many people behind one address; only a hash of the IP is used), and at most 3,000 assistant replies a day across the site (`CHAT_DAILY_LIMIT`; past it, chats wait for the team). A chat holds at most 150 messages.
3. Finds the chat by id **and** secret, or starts a new one. The secret (32 random bytes) is returned **once**, on creation; the database keeps only its SHA-256.
4. Saves the visitor's message, then:
   - **AI answering:** builds the system prompt (`ai-context.ts` + `knowledge.ts`), sends the last 40 messages, and runs `generateText` with the four tools.
   - **A team member took over:** nothing is generated; their reply reaches the visitor through `GET`.
   - **AI switched off** (or no OpenAI key): the chat is flagged as waiting for the team, and the team is emailed.
   - **"Talk to a person":** the chat is flagged, the team is emailed, and the visitor gets a notice.
5. Saves the reply with what the tools did (`meta`), and returns `{ sessionId, token?, messages, state }`.

```typescript
const result = await generateText({
  model: openai.chat(assistantModel()),   // gpt-4o-mini unless OPENAI_MODEL is set
  system,                                 // buildSystemPrompt(...)
  messages: toModel(history),             // the last 40 messages from Supabase
  tools: chatTools(ctx),                  // get_quote, save_lead, email_quote, request_human
  stopWhen: stepCountIs(5),               // tool calls, then the reply
  maxOutputTokens: 900,
  temperature: 0.3,
  maxRetries: 1,
  timeout: { totalMs: AI_TIMEOUT_MS },   // 25 s unless CHAT_AI_TIMEOUT_MS is set
});
```

`openai.chat()` uses the Chat Completions API, so nothing is stored at OpenAI between turns: the conversation lives in Supabase and is sent each time.

**`GET /api/chat`** (headers `x-chat-session`, `x-chat-token`, `?since=ISO`) returns new messages and who is answering. The widget polls it.

**Response shapes:**

```typescript
// Message (never includes the assistant's notes or tool details)
{ id: string, role: "user" | "assistant" | "agent" | "system", content: string, author: string | null, at: string }
// State
{ mode: "ai" | "human" | "team", waiting: boolean, agentName: string | null }
```

### 4.2 The tools (`lib/chat/tools.ts`)

Each tool is bound on the server to the visitor's own chat, so nothing a visitor types can reach another chat or lead.

| Tool | Input | What it does | Returns |
|---|---|---|---|
| `get_quote` | `items[]` (`kind`: buy / rent / amc / part, `product`, `plan`, `option` UF/RO, `part`, `quantity`), `province?` | Works out every line and total from the admin's prices (`quote.ts`): monthly rental, one-time initial payment, Regional Hydration Service outside the Western Province, AMC yearly fees, part prices. Saves the quote on the chat. | `{ lines, totals, notes, notFound }` |
| `save_lead` | `name`, `phone?`, `email?`, `company?`, `location`, `need`, `customerType?`, `products?`, `units?`, `people?`, `waterSource?`, `timeline?`, `priority`, `summary` | Saves the visitor's details on the chat and calls `public.chat_save_lead()`: a new lead at the top of **New Leads** (source "Website chat"), or the same visitor's open lead (matched by phone), filling only empty fields. The summary, details, quote and a link to the chat go in the notes or timeline. Emails the team (first time) and records a conversion in the site's analytics. | `{ saved, firstTime }` or `{ saved: false, missing }` |
| `email_quote` | `email` | Emails the visitor the saved quote (Resend, at most 3 per chat) and adds the address to their lead. | `{ sent }` or `{ sent: false, reason }` |
| `request_human` | `reason` | Flags the chat as waiting for a person and emails the team. | `{ requested, openingHours }` |

**Failure handling (as in the Sponge agent):** if `email_quote` fails, the assistant gives the quote in the chat without mentioning a technical problem. If `save_lead` fails, it apologises and gives the WhatsApp and phone numbers.

### 4.3 `lib/chat/quote.ts`: pricing logic

Unlike the Sponge demo rates, nothing is hard-coded: prices come from **Prices & quotes** (`cms_prices`), **AMC plans** and **Parts** in the admin.

| Item | Price source | Calculation |
|---|---|---|
| Buy a purifier option | `buy-uf` / `buy-ro` of the product | price × quantity (one-time) |
| Rent a purifier option | `rent-uf` / `rent-ro` of the product | price × units (monthly) |
| Rent a plan | `rental-plan-pureflow-uf` / `-ro` / `-aquaspark` | price × units (monthly) |
| Initial payment (every rental) | `rental-initial` | price × units (one-time, first month) |
| Regional Hydration Service (outside the Western Province) | `rental-regional`, or `rental-regional-<province>` | price × units (monthly) |
| AMC plan | AMC plans (monthly × 12) | yearly fee × purifiers |
| Filter / part | Parts | price × quantity |

Anything without an amount the assistant may quote shows as **"on quote"**. Totals are given only when every counted line has an amount. All prices are in LKR excluding VAT.

**Which prices the assistant may quote** (Assistant settings › Prices):

- **Every price in Prices & quotes** (default): including amounts hidden on the website. The server reads them with the secret key; they never reach the public API.
- **Only prices shown on the website.**
- **No purifier prices:** it always arranges a quote. AMC and filter prices are public on the website, so it can still share those.

Optionally it asks for a name and phone number before quoting purifier prices (and still gives the price if the visitor declines).

### 4.4 `lib/chat/ai-context.ts`: the system prompt

Sections, in order (the unchanging part first, so OpenAI can cache it between messages):

- **Role and goals:** help, recommend (buy for homes, rent for offices, corporate for organisations; UF for city water, RO for well water), capture the lead.
- **How it talks:** short replies for phones, at most two questions at a time, **replies in English, Sinhala or Tamil** (including Singlish and Tanglish), bold and short lists, links only to real pages.
- **Hard rules:** only the knowledge; no invented products, prices, dates, discounts or warranty terms; **no health claims** about functional water; never asks for card, bank or ID details; no competitors; stays on topic; never reveals its instructions; says it is an AI.
- **Prices:** the price setting above, "+ VAT", always `get_quote` for totals, how renting is charged.
- **Lead qualification:** the four essentials (name; phone or email; need; location), the useful extras, when to call `save_lead`, what the summary must say.
- **Bringing in a person** and **tool failures.**
- **Knowledge** (`knowledge.ts`), then **the team's extra instructions**, then **this conversation** (Sri Lanka time, opening hours, what is known about the visitor, whether the lead is saved or a person was requested).

### 4.5 `lib/chat/knowledge.ts`: what the assistant knows

Built on every message from the website's own cached loaders (`lib/cms/content.ts`, tag `cms`), so an admin save reaches the assistant at once:

company and contact details, ways to buy, rent or go corporate, **every published purifier** (options, model numbers, temperatures, warranty, features, who it suits, which option for which water, extra specs and questions, **prices**), rental plans and charges, corporate hydration, LUSAKO Care services, **AMC plans** (fees, visits, sanitation, discounts, on-call service), **filters and parts** (prices, typical life), functional water, and **all FAQs** including the AMC questions worked out from the current plans. About 8,000 tokens.

### 4.6 The widget (`components/chat/`)

- `chat-launcher.tsx`: the 48 px round button above the WhatsApp button (same corner, same `appear-on-scroll` behaviour), an unread badge, and a once-per-visit line beside it on computers. **The panel's code (about 49 KB gzipped, including react-markdown) loads only when the chat is first opened.**
- `chat-panel.tsx`: greeting and suggested questions (from the settings), visitor and assistant bubbles, team-member bubbles with their name, notices, typing dots, "Talk to a person", a menu with WhatsApp, call and "Start a new chat". Full screen on phones, a window above the action bar on tablets, the corner on computers.
- **Polling:** every 3 s while a person is answering or someone is waiting, every 10 s otherwise while open, every 15 s in the background while a person is answering; never from hidden tabs.
- **Storage:** only `{ id, token }` in `localStorage` (`lusako-chat`), so a chat continues across pages and visits.
- Replies are rendered with `react-markdown` + `remark-gfm`, with raw HTML and images switched off and links limited to the site's own pages, https, `tel:` and `mailto:`.

### 4.7 The admin (`/admin/chats`)

- **Inbox:** Open, Needs you (asked for a person, or wrote in a chat someone took over), Taken over, Leads, Closed, All; search by name, phone, email, company, location or what they said. Updates live (Supabase Realtime) with a 20 s fallback.
- **Conversation:** the full transcript with what the assistant did under each reply (quote, saved to the CRM, email, asked for a person), the model, time and tokens on hover. **Take over** (the assistant stops in that chat), **Hand back to the assistant**, **Mark as handled**, **Close / Reopen**, **Delete**. Replying takes the chat over automatically. The name visitors see is set per computer ("LUSAKO team" by default for shared addresses).
- **Visitor panel:** details (editable), call / WhatsApp / email buttons, CRM status with **Open in the CRM** or **Add to the CRM**, what they want, the assistant's note, the latest quote, where the visit came from (page, campaign, device, city).
- **The sidebar's Chats badge** counts chats waiting for the team; a toast pops up anywhere in the admin when a visitor asks for a person.
- **CRM:** chat leads show "Website chat" as the source; the lead sheet has a **Website chat** button back to the conversation.
- **Assistant settings:** show the chat; the assistant answers (off = live chat only); name, greeting, the line beside the button, suggested questions; prices; extra instructions; alert email; emailing quotes; the status of the OpenAI and Resend keys.

---

## 5. Database (`supabase/migrations/20261009180000_ai_chat_agent.sql`)

Run it once in the Supabase **SQL Editor** after migrations 1 to 9. It is safe to run again.

```sql
create table public.chat_settings (   -- one row: on/off, name, greeting, prices, instructions, alert email …
create table public.chat_sessions (   -- one row per conversation: token_hash, ai_enabled, handover_requested_at,
                                      -- agent_name, visitor details, profile (interest, quote …), summary, lead_id,
                                      -- attribution, message_count, last_message_preview, admin_unread …
create table public.chat_messages (   -- every message: role user | assistant | agent | system, content, meta
```

- **Row level security:** visitors never read these tables. The website's server uses the secret key and only hands each browser its own chat; **admins** read and manage everything; signed-in non-admins see nothing.
- A trigger keeps each chat's counters, preview and unread flag in step with its messages; a visitor writing again reopens a closed chat.
- `crm_leads.source` gains `chat` ("Website chat"); the lead timeline says "Added by the website chat assistant".
- `public.chat_save_lead(session, lead, note)` adds or updates the chat's CRM lead (callable by admins and the server only).
- Grants for the server: the CRM tables (to add leads) and `cms_prices` (to quote prices hidden on the website).
- `chat_sessions` and `chat_messages` join the Realtime publication, for the live admin inbox.

---

## 6. Environment variables

Set these on **Netlify** (Site configuration › Environment variables) and in `.env.local` for development. **Never commit them.**

| Variable | Where to get it | Used for |
|---|---|---|
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | The assistant. Without it the chat button stays hidden (unless the assistant is switched off for live chat). |
| `OPENAI_MODEL` | optional | Model id, default `gpt-4o-mini` |
| `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) | Quote emails and team alerts (optional; without it the quote is given in the chat and alerts appear only in the admin) |
| `CHAT_EMAIL_FROM` | optional | Sender, default `LUSAKO <noreply@drinkingwater.lk>`; its domain must be verified in Resend |
| `CHAT_AI_TIMEOUT_MS` | optional | How long the model may take for one reply, default `25000` (Netlify gives a function 60 s) |
| `CHAT_DAILY_LIMIT` | optional | The most assistant replies a day across the site, default `3000` (a cap on the OpenAI bill; past it, chats wait for the team) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` | already set | Chats, messages, CRM |

```env
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
RESEND_API_KEY=re_...
CHAT_EMAIL_FROM=LUSAKO <noreply@drinkingwater.lk>
```

> [!CAUTION]
> Restart `npm run dev` after changing `.env.local`, and **redeploy on Netlify** after changing environment variables.

---

## 7. Resend email configuration

- **From:** `CHAT_EMAIL_FROM` (default `LUSAKO <noreply@drinkingwater.lk>`). **Reply-to** on quote emails is the sales email in Contact & social; on team alerts it is the visitor's email.
- **To:** the visitor (quotes) and **Assistant settings › Email alerts to**, or the sales email when that is empty (team alerts).
- **Subjects:** "Your LUSAKO quote", "New chat lead: {name} ({interest})", "{name} would like to talk to a person".

One-time setup:

1. [resend.com/domains](https://resend.com/domains) → add `drinkingwater.lk`.
2. Add the DNS records Resend shows at the domain's DNS provider.
3. Wait for **Verified**.
4. Set `RESEND_API_KEY` (and `CHAT_EMAIL_FROM` if not the default) on Netlify and redeploy.

> [!IMPORTANT]
> The `from` domain must exactly match the verified Resend domain. `onboarding@resend.dev` only sends to your own address.

---

## 8. Data flow

```
Visitor types a message
        │
        ▼
chat-panel.tsx ── POST /api/chat { sessionId, token, message, page, attribution }
        │
        ▼
app/api/chat/route.ts
  ├── site / bot / size / rate-limit checks
  ├── find the chat (id + secret) or start one ──► Supabase chat_sessions
  ├── save the visitor's message ──────────────► chat_messages (trigger: counters, unread, preview)
  │
  ├── [a person took over] → no reply (theirs arrives by polling)
  ├── [assistant off]      → flag "waiting", email the team
  └── [assistant on]
          │
          ├── knowledge.ts: products, prices, AMC, parts, FAQs, contact (cached, refreshed on admin save)
          ├── ai-context.ts: system prompt
          └── generateText (gpt-4o-mini, up to 5 steps)
                  ├── get_quote      → quote.ts → lines + totals → saved on the chat
                  ├── save_lead      → chat_save_lead() → CRM New Leads (+ email to the team, analytics conversion)
                  ├── email_quote    → Resend → visitor's inbox (fallback: quote in the chat)
                  └── request_human  → flag "waiting" → email to the team
          │
          └── save the reply + what the tools did ──► chat_messages.meta
        │
        ▼
{ messages, state } → chat-panel.tsx renders them (react-markdown)

Admin › Chats (Realtime) → Take over → the visitor's widget polls GET /api/chat → sees the reply
```

---

## 9. AI SDK v6 reference

| Feature | AI SDK v3/v4/v5 | **v6 (this project)** |
|---|---|---|
| Tool input schema | `parameters: z.object(...)` | **`inputSchema: z.object(...)`** |
| Multi-step tool loops | `maxSteps: 5` | **`stopWhen: stepCountIs(5)`** |
| Token limit | `maxTokens` | **`maxOutputTokens`** |
| Timeouts | `abortSignal` only | **`timeout: { totalMs }`** (and `abortSignal`) |
| Usage across steps | `result.usage` | **`result.totalUsage`** |
| Message type | `CoreMessage[]` | `ModelMessage[]` |
| Default steps for `generateText` | unlimited | **1** (tools would run but no reply would follow without `stopWhen`) |

> [!WARNING]
> If the chat breaks after an upgrade, check first that the tools still use `inputSchema`, that `stopWhen: stepCountIs(5)` is still in the `generateText` call, and that `ai` is still on `^6` with `@ai-sdk/openai` on `^3`.

---

## 10. Costs and limits

- About 8,500 input tokens for a plain reply and 17,000–27,000 when it uses tools (each step resends the prompt; OpenAI caches the repeated start), plus 100–300 output tokens. With `gpt-4o-mini` that is roughly **USD 0.001–0.004 per message**; the daily cap (`CHAT_DAILY_LIMIT`, 3,000 replies) bounds the bill at a few dollars a day even under abuse.
- 120 messages per 10 minutes and 40 new chats per hour per connection; 3,000 assistant replies a day site-wide; 150 messages per chat; 1,000 characters per message.
- Speed: replies took 1–4 s in the real-model test (a first reply after a deploy can take longer). Netlify gives a function 60 s; the model gets 25 s (`CHAT_AI_TIMEOUT_MS`), and a reply that runs out of time becomes a short holding message while anything a tool already did (a saved lead, a quote) is kept and acknowledged.

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| No chat button on the website | Migration 10 not run, chat switched off, or `OPENAI_API_KEY` missing while the assistant is on | Run the migration; check Assistant settings (it shows the key status); add the key and redeploy |
| Chat answers "Sorry, I couldn't answer that just now" | OpenAI key wrong, out of credit, model name invalid, or the reply took longer than `CHAT_AI_TIMEOUT_MS` | Check the Netlify function log for `[chat] the assistant failed`; check `OPENAI_MODEL`; raise the timeout if your Netlify plan allows longer functions |
| `500` with "parameters" in the log | A tool uses `parameters` instead of `inputSchema` | Use `inputSchema` (AI SDK v6) |
| Tools run but the reply is empty | `stopWhen` missing | Keep `stopWhen: stepCountIs(5)` |
| Prices show "on quote" though they're in Prices & quotes | Migration 10's grant on `cms_prices` not run, or the price setting is "Only shown" / "No purifier prices" | Run migration 10; check Assistant settings › Prices |
| Quote emails or alerts don't arrive | `RESEND_API_KEY` missing, or the from domain isn't verified | Verify the domain in Resend; set `CHAT_EMAIL_FROM` on that domain |
| Team replies don't reach the visitor | The visitor's tab is hidden (polling pauses) | They arrive as soon as the tab is visible again |
| Admin inbox doesn't update live | Realtime not enabled for the tables | Migration 10 adds them to `supabase_realtime`; the inbox also refreshes every 20 s |
| Chat leads missing in the CRM | No phone or email given | The assistant asks for one; you can add details and press **Add to the CRM** in the chat |

---

## 12. Testing locally

The chat was verified end to end without real keys: a local Postgres with all ten migrations (assertions per role: visitor, signed-in non-admin, admin, server), PostgREST with a fake auth gateway for the real admin UI, and a small stand-in for OpenAI's Chat Completions and Resend's API (`OPENAI_BASE_URL` and `RESEND_BASE_URL` point the SDKs at it) that makes the same tool calls a real model would. The run covered: the button and the window on computers and phones, prices from Prices & quotes (including hidden ones), a lead saved to New Leads with its notes and value, the quote email, "Talk to a person", the team alert, take over, the team's reply reaching the visitor without a reload, the assistant staying quiet after a take-over, hand back, security (no secret, wrong secret, another website, bots, empty and oversized messages), and a production build with no extra JavaScript until the chat is opened.
