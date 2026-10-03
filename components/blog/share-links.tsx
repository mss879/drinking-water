"use client";

import { useState } from "react";
import { Check, Link2, MessageCircle, Share2 } from "lucide-react";

const pill =
  "inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-ink transition-colors hover:border-deep hover:text-deep";

/** Share a post on WhatsApp (the way most people here share), Facebook, LinkedIn or X, or copy its link. */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const targets = [
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}`, icon: MessageCircle },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, icon: Share2 },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, icon: Share2 },
    { label: "X", href: `https://x.com/intent/post?url=${enc(url)}&text=${enc(title)}`, icon: Share2 },
  ];
  return (
    <div>
      <p className="label">Share</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {targets.map(({ label, href, icon: Icon }) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noopener noreferrer" className={pill}>
              <Icon aria-hidden className="size-4 text-deep" />
              {label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
        <li>
          <button
            type="button"
            className={pill}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              } catch {}
            }}
          >
            {copied ? <Check aria-hidden className="size-4 text-deep" /> : <Link2 aria-hidden className="size-4 text-deep" />}
            <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
