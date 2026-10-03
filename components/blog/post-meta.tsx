import { cn } from "@/lib/cn";

const dateFormat = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", day: "numeric", month: "long", year: "numeric" });

export function formatPostDate(iso: string | null) {
  return iso ? dateFormat.format(new Date(iso)) : "";
}

/** "2 October 2026 · 4 min read", with an optional author. */
export function PostMeta({
  publishedAt,
  minutes,
  author,
  tone = "light",
  className,
}: {
  publishedAt: string | null;
  minutes: number;
  author?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 text-[13px]", tone === "dark" ? "text-white/70" : "text-muted", className)}>
      {publishedAt && <time dateTime={publishedAt}>{formatPostDate(publishedAt)}</time>}
      <span aria-hidden>·</span>
      <span>{minutes} min read</span>
      {author && (
        <>
          <span aria-hidden>·</span>
          <span>{author}</span>
        </>
      )}
    </p>
  );
}
