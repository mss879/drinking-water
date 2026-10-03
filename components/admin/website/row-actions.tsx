"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/admin/ui/toaster";
import type { ActionResult } from "@/lib/admin/auth";
import { cn } from "@/lib/cn";

const iconButton =
  "grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-deep hover:text-deep disabled:cursor-default disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink";

/**
 * Move up / move down and show / hide for one row of a Website list. Each calls its Server Action and refreshes the
 * list; failures appear as a toast.
 */
export function RowActions({
  name,
  published,
  first,
  last,
  onMove,
  onPublish,
  className,
}: {
  name: string;
  published?: boolean;
  first: boolean;
  last: boolean;
  onMove: (direction: "up" | "down") => Promise<ActionResult>;
  onPublish?: (published: boolean) => Promise<ActionResult>;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<ActionResult>) =>
    startTransition(async () => {
      const result = await action();
      if (!result.ok) toast(result.error, "error");
      else if (result.message) toast(result.message);
      router.refresh();
    });

  return (
    <div className={cn("flex items-center gap-1.5", pending && "opacity-60", className)}>
      {onPublish && (
        <button
          type="button"
          className={iconButton}
          disabled={pending}
          aria-label={published ? `Hide ${name} from the website` : `Show ${name} on the website`}
          title={published ? "Hide from the website" : "Show on the website"}
          onClick={() => run(() => onPublish(!published))}
        >
          {published ? <Eye aria-hidden className="size-4" /> : <EyeOff aria-hidden className="size-4" />}
        </button>
      )}
      <button type="button" className={iconButton} disabled={pending || first} aria-label={`Move ${name} up`} onClick={() => run(() => onMove("up"))}>
        <ArrowUp aria-hidden className="size-4" />
      </button>
      <button type="button" className={iconButton} disabled={pending || last} aria-label={`Move ${name} down`} onClick={() => run(() => onMove("down"))}>
        <ArrowDown aria-hidden className="size-4" />
      </button>
    </div>
  );
}
