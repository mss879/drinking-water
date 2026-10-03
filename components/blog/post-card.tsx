import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PostMeta } from "@/components/blog/post-meta";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import type { PostSummary } from "@/lib/blog/queries";

/** A post in a listing: the cover in black & white, its category, title, excerpt and date. */
export function PostCard({ post, featured = false, className }: { post: PostSummary; featured?: boolean; className?: string }) {
  return (
    <article
      className={cn(
        "group/card relative flex h-full flex-col overflow-hidden rounded-card-xl border border-line bg-white transition-[border-color,box-shadow] duration-300 hover:border-brand hover:shadow-soft",
        featured && "lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]",
        className,
      )}
    >
      <div className={cn("relative aspect-[16/10] overflow-hidden bg-tint-2", featured && "lg:aspect-auto lg:min-h-[22rem]")}>
        {post.cover_url ? (
          <Image
            src={post.cover_url}
            alt={post.cover_alt ?? ""}
            fill
            sizes={featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            data-no-parallax
            className="object-cover grayscale transition-transform duration-700 ease-out group-hover/card:scale-[1.04]"
          />
        ) : (
          <span aria-hidden className="absolute inset-0 grid place-items-center">
            <Image src="/brand/lusako-mark.svg" alt="" width={56} height={56} className="opacity-40" />
          </span>
        )}
      </div>
      <div className={cn("flex flex-1 flex-col p-6 sm:p-7", featured && "lg:justify-center lg:p-10")}>
        {post.category && (
          <div>
            <Pill variant="tint">{post.category}</Pill>
          </div>
        )}
        <h3 className={cn("mt-4 font-display font-bold text-ink text-balance", featured ? "text-[length:clamp(1.5rem,1.2rem+1vw,2.1rem)] leading-[1.15]" : "text-h3")}>
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-card-xl focus-visible:after:outline-2 focus-visible:after:outline-deep">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className={cn("mt-3 text-[15px] leading-relaxed text-muted", !featured && "line-clamp-3")}>{post.excerpt}</p>}
        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <PostMeta publishedAt={post.published_at} minutes={post.reading_minutes} />
          <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-deep text-white transition-transform duration-300 group-hover/card:rotate-45">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </article>
  );
}
