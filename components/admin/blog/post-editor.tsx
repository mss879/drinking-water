"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { Placeholder } from "@tiptap/extensions";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, Eye, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { deletePost, savePost, type PostInput } from "@/app/actions/admin/blog";
import { EditorToolbar } from "@/components/admin/blog/editor-toolbar";
import { Badge } from "@/components/admin/ui/badge";
import { ConfirmDialog } from "@/components/admin/ui/dialog";
import { Field, Input, Textarea } from "@/components/admin/ui/field";
import { toast } from "@/components/admin/ui/toaster";
import { Button, buttonClasses } from "@/components/ui/button";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/admin/format";
import { blogExtensions } from "@/lib/blog/extensions";
import { slugify } from "@/lib/blog/text";
import { altFromFileName, uploadBlogImage } from "@/lib/blog/upload";
import type { BlogPost, PostStatus } from "@/lib/supabase/types";

type Form = {
  title: string;
  slug: string;
  excerpt: string;
  cover_url: string | null;
  cover_alt: string;
  cover_width: number | null;
  cover_height: number | null;
  category: string;
  author_name: string;
  /** "YYYY-MM-DDTHH:mm" in Sri Lanka time, for the date input. */
  published_at: string;
  featured: boolean;
  seo_title: string;
  seo_description: string;
};

/** ISO → "YYYY-MM-DDTHH:mm" in Sri Lanka time. */
function toLocal(iso: string | null) {
  if (!iso) return "";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Colombo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** "YYYY-MM-DDTHH:mm" in Sri Lanka time → ISO. */
function toIso(local: string) {
  return local ? new Date(`${local}:00+05:30`).toISOString() : null;
}

function formFrom(post: BlogPost): Form {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    cover_url: post.cover_url,
    cover_alt: post.cover_alt ?? "",
    cover_width: post.cover_width,
    cover_height: post.cover_height,
    category: post.category ?? "",
    author_name: post.author_name,
    published_at: toLocal(post.published_at),
    featured: post.featured,
    seo_title: post.seo_title ?? "",
    seo_description: post.seo_description ?? "",
  };
}

function statusOf(post: Pick<BlogPost, "status" | "published_at">) {
  if (post.status === "draft") return { label: "Draft", tone: "muted" as const };
  if (post.published_at && new Date(post.published_at) > new Date()) return { label: "Scheduled", tone: "soft" as const };
  return { label: "Published", tone: "solid" as const };
}

/**
 * Writing a post: the title, the rich-text body (images by button, paste or drop) and, alongside, its settings,
 * cover, publishing and search preview. Drafts save themselves every 20 seconds; Ctrl/Cmd+S saves any time; a
 * published post only changes when "Update" is pressed.
 */
export function PostEditor({ post: initial, categories }: { post: BlogPost; categories: string[] }) {
  const router = useRouter();
  const [post, setPost] = useState(initial);
  const [form, setForm] = useState<Form>(() => formFrom(initial));
  const [slugEdited, setSlugEdited] = useState(!initial.slug.startsWith("untitled-"));
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<Editor | null>(null);

  const insertImage = useCallback(
    async (file: File, at?: number) => {
      setUploading((n) => n + 1);
      try {
        const { url, width, height } = await uploadBlogImage(file, initial.id);
        const editor = editorRef.current;
        if (!editor) return;
        const node = { type: "image", attrs: { src: url, alt: altFromFileName(file.name), width, height } };
        if (at !== undefined) editor.chain().focus().insertContentAt(at, node).run();
        else editor.chain().focus().insertContent(node).run();
        setDirty(true);
      } catch (error) {
        toast(error instanceof Error ? error.message : "The image couldn’t be uploaded.", "error");
      } finally {
        setUploading((n) => n - 1);
      }
    },
    [initial.id],
  );
  const insertRef = useRef(insertImage);
  useEffect(() => {
    insertRef.current = insertImage;
  }, [insertImage]);

  const editor = useEditor({
    extensions: [...blogExtensions, Placeholder.configure({ placeholder: "Start writing. Use the toolbar for headings, lists, links and images." })],
    content: initial.content as object,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: { class: "article min-h-[24rem] py-6 focus:outline-none", "aria-label": "Article" },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((file) => file.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        files.forEach((file) => void insertRef.current(file));
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const files = Array.from(event.dataTransfer?.files ?? []).filter((file) => file.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        const at = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        files.forEach((file) => void insertRef.current(file, at));
        return true;
      },
    },
    onUpdate: () => setDirty(true),
  });
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const update = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  };

  const save = useCallback(
    (status: PostStatus, { quiet = false, after }: { quiet?: boolean; after?: () => void } = {}) => {
      const editorNow = editorRef.current;
      if (!editorNow) return;
      const input: PostInput = {
        ...form,
        slug: form.slug || slugify(form.title),
        content: editorNow.getJSON(),
        status,
        published_at: status === "published" && !form.published_at ? null : toIso(form.published_at),
      };
      startTransition(async () => {
        const result = await savePost(initial.id, input);
        if (!result.ok) {
          if (!quiet) toast(result.error, "error");
          return;
        }
        const saved = result.data!.post;
        setPost(saved);
        setForm((current) => ({ ...current, slug: saved.slug, published_at: toLocal(saved.published_at) }));
        setDirty(false);
        setSavedAt(new Date().toISOString());
        if (!quiet) {
          const now = statusOf(saved);
          toast(
            status === "draft"
              ? post.status === "published"
                ? "Unpublished: it’s a draft again."
                : "Draft saved."
              : now.label === "Scheduled"
                ? `Scheduled for ${formatDateTime(saved.published_at)}.`
                : post.status === "published"
                  ? "Post updated."
                  : "Published.",
          );
        }
        after?.();
        router.refresh();
      });
    },
    [form, initial.id, post.status, router],
  );

  // Ctrl/Cmd+S saves; drafts also save themselves every 20 seconds.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        save(post.status);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, post.status]);

  useEffect(() => {
    if (!dirty || post.status !== "draft" || pending) return;
    const timer = window.setTimeout(() => save("draft", { quiet: true }), 20_000);
    return () => window.clearTimeout(timer);
  }, [dirty, post.status, pending, save]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // The title box grows with its text.
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [form.title]);

  const state = statusOf(post);
  const scheduled = form.published_at && toIso(form.published_at)! > new Date().toISOString();
  const seoTitle = form.seo_title || form.title || "Untitled post";
  const seoDescription = form.seo_description || form.excerpt || "Add an excerpt or a search description.";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
      {/* Writing */}
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-deep hover:text-ink">
            <ArrowLeft aria-hidden className="size-4" /> All posts
          </Link>
          <Badge tone={state.tone}>{state.label}</Badge>
          <span className="text-[13px] text-muted" aria-live="polite">
            {pending ? "Saving…" : uploading ? "Uploading image…" : dirty ? "Unsaved changes" : savedAt ? `Saved ${formatDateTime(savedAt)}` : ""}
          </span>
        </div>

        <div className="card-line px-5 pt-6 pb-4 sm:px-10 sm:pt-10">
          <label htmlFor="post-title" className="sr-only">
            Title
          </label>
          <textarea
            ref={titleRef}
            id="post-title"
            rows={1}
            value={form.title}
            onChange={(event) => {
              const title = event.target.value.replace(/\n/g, " ");
              setForm((current) => ({ ...current, title, slug: slugEdited ? current.slug : slugify(title) }));
              setDirty(true);
            }}
            placeholder="Post title"
            maxLength={200}
            className="block w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-display text-[length:clamp(1.75rem,1.3rem+1.6vw,2.6rem)] leading-[1.1] font-bold tracking-[-0.025em] text-ink placeholder:text-mist focus:outline-none"
          />
          <div className="mt-6">
            {editor ? (
              <>
                <EditorToolbar editor={editor} onImage={(file) => void insertImage(file)} uploading={uploading > 0} />
                <EditorContent editor={editor} />
              </>
            ) : (
              <div className="grid min-h-[24rem] place-items-center text-sm text-muted">
                <LoaderCircle aria-hidden className="size-5 animate-spin text-deep" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings */}
      <aside className="grid gap-4 xl:sticky xl:top-6">
        <section className="card-line grid gap-4 p-5">
          <h2 className="font-display font-bold text-ink">Publishing</h2>
          <Field
            label={post.status === "published" ? "Published on" : "Publish on"}
            htmlFor="post-date"
            hint={post.status === "published" ? "Sri Lanka time." : "Leave empty to publish now, or pick a later time to schedule it."}
          >
            <Input id="post-date" type="datetime-local" value={form.published_at} onChange={(e) => update("published_at", e.target.value)} />
          </Field>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
            <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} className="size-4 accent-deep" />
            Feature it at the top of the blog
          </label>
          <div className="grid gap-2">
            <Button type="button" onClick={() => save("published")} loading={pending} className="w-full">
              {post.status === "published" ? "Update" : scheduled ? "Schedule" : "Publish"}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => save("draft")}>
                {post.status === "published" ? "Unpublish" : "Save draft"}
              </Button>
              <a
                href={`/admin/preview/blog/${initial.id}`}
                target="_blank"
                rel="noopener"
                onClick={() => {
                  if (dirty) save(post.status, { quiet: true });
                }}
                className={buttonClasses({ variant: "outline", size: "sm" })}
              >
                <Eye aria-hidden className="size-4" /> Preview
              </a>
            </div>
          </div>
        </section>

        <section className="card-line grid gap-4 p-5">
          <h2 className="font-display font-bold text-ink">Post details</h2>
          <Field label="Web address" htmlFor="post-slug" hint={`${site.url.replace(/^https?:\/\//, "")}/blog/${form.slug || "…"}`}>
            <Input
              id="post-slug"
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                update("slug", slugify(e.target.value) || e.target.value.toLowerCase());
              }}
              maxLength={120}
            />
          </Field>
          {post.status === "published" && form.slug !== post.slug && (
            <p className="rounded-chip bg-tint px-3 py-2 text-[13px] text-ink">The old address will redirect to the new one, so existing links keep working.</p>
          )}
          <Field label="Excerpt" htmlFor="post-excerpt" hint={`${form.excerpt.length}/400 · shown on the blog and in search results`}>
            <Textarea id="post-excerpt" value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} maxLength={400} className="min-h-24" />
          </Field>
          <Field label="Category" htmlFor="post-category" hint="Readers can filter the blog by category.">
            <Input id="post-category" list="post-categories" value={form.category} onChange={(e) => update("category", e.target.value)} maxLength={60} />
            <datalist id="post-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </Field>
          <Field label="Author" htmlFor="post-author">
            <Input id="post-author" value={form.author_name} onChange={(e) => update("author_name", e.target.value)} maxLength={80} />
          </Field>
        </section>

        <CoverField
          postId={initial.id}
          url={form.cover_url}
          alt={form.cover_alt}
          onChange={(cover) => {
            setForm((current) => ({ ...current, ...cover }));
            setDirty(true);
          }}
        />

        <section className="card-line grid gap-4 p-5">
          <h2 className="font-display font-bold text-ink">Search engines</h2>
          <div className="rounded-chip border border-line p-3.5">
            <p className="truncate text-[12px] text-muted">{site.url.replace(/^https?:\/\//, "")} › blog › {form.slug || "…"}</p>
            <p className={cn("mt-1 line-clamp-1 text-[17px] text-deep", seoTitle.length > 60 && "line-clamp-2")}>{seoTitle} | LUSAKO</p>
            <p className="mt-1 line-clamp-2 text-[13px] text-muted">{seoDescription}</p>
          </div>
          <Field label="Search title" htmlFor="post-seo-title" hint={`${form.seo_title.length}/60 recommended · leave empty to use the post title`}>
            <Input id="post-seo-title" value={form.seo_title} onChange={(e) => update("seo_title", e.target.value)} maxLength={120} />
          </Field>
          <Field label="Search description" htmlFor="post-seo-description" hint={`${form.seo_description.length}/155 recommended · leave empty to use the excerpt`}>
            <Textarea
              id="post-seo-description"
              value={form.seo_description}
              onChange={(e) => update("seo_description", e.target.value)}
              maxLength={300}
              className="min-h-20"
            />
          </Field>
        </section>

        <Button type="button" variant="ghost" onClick={() => setConfirmDelete(true)} className="justify-self-start">
          <Trash2 aria-hidden className="size-4" /> Delete post
        </Button>
      </aside>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        pending={pending}
        title="Delete this post?"
        description="The post and its uploaded images will be removed for good."
        onConfirm={() =>
          startTransition(async () => {
            const result = await deletePost(initial.id);
            if (!result.ok) return toast(result.error, "error");
            setDirty(false);
            toast("Post deleted.");
            router.push("/admin/blog");
          })
        }
      />
    </div>
  );
}

function CoverField({
  postId,
  url,
  alt,
  onChange,
}: {
  postId: string;
  url: string | null;
  alt: string;
  onChange: (cover: Partial<Pick<Form, "cover_url" | "cover_alt" | "cover_width" | "cover_height">>) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <section className="card-line grid gap-4 p-5">
      <div>
        <h2 className="font-display font-bold text-ink">Cover image</h2>
        <p className="mt-0.5 text-[13px] text-muted">Shown in black &amp; white on the website, like every photo there. Wide images work best.</p>
      </div>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- a just-uploaded image, before any optimisation exists
        <img src={url} alt="" className="aspect-[16/9] w-full rounded-chip object-cover grayscale" />
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="grid aspect-[16/9] w-full cursor-pointer place-items-center rounded-chip border border-dashed border-mist text-sm font-semibold text-deep transition-colors hover:border-deep hover:bg-tint"
        >
          <span className="inline-flex items-center gap-2">
            {busy ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <ImagePlus aria-hidden className="size-4" />}
            {busy ? "Uploading…" : "Upload a cover"}
          </span>
        </button>
      )}
      {url && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" loading={busy} onClick={() => input.current?.click()}>
            Replace
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ cover_url: null, cover_width: null, cover_height: null })}>
            Remove
          </Button>
        </div>
      )}
      <Field label="Image description" htmlFor="cover-alt" hint="What the photo shows, for people who can't see it.">
        <Input id="cover-alt" value={alt} onChange={(e) => onChange({ cover_alt: e.target.value })} maxLength={300} />
      </Field>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            const uploaded = await uploadBlogImage(file, postId);
            onChange({ cover_url: uploaded.url, cover_width: uploaded.width, cover_height: uploaded.height, ...(alt ? {} : { cover_alt: altFromFileName(file.name) }) });
          } catch (error) {
            toast(error instanceof Error ? error.message : "The image couldn’t be uploaded.", "error");
          } finally {
            setBusy(false);
          }
        }}
      />
    </section>
  );
}
