"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import { useRef, useState, type ReactNode } from "react";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Heading4,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  LoaderCircle,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  SquareCode,
  Strikethrough,
  TextCursorInput,
  Underline,
  Undo2,
} from "lucide-react";
import { Dialog } from "@/components/admin/ui/dialog";
import { Field, Input } from "@/components/admin/ui/field";
import { toast } from "@/components/admin/ui/toaster";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ALLOWED_LINK } from "@/lib/blog/extensions";

function Tool({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "grid size-9 shrink-0 cursor-pointer place-items-center rounded-chip transition-colors disabled:cursor-default disabled:opacity-35 [&>svg]:size-[17px]",
        active ? "bg-deep text-white" : "text-ink hover:bg-tint",
      )}
    >
      {children}
    </button>
  );
}

const Divider = () => <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-line" />;

/**
 * The editor's formatting bar: block types, inline styles, links, lists, quotes, code, a rule, images, undo/redo.
 * It sticks to the top while writing and scrolls sideways on phones.
 */
export function EditorToolbar({ editor, onImage, uploading }: { editor: Editor; onImage: (file: File) => void; uploading: boolean }) {
  const file = useRef<HTMLInputElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [altOpen, setAltOpen] = useState(false);
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      paragraph: e.isActive("paragraph"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      h4: e.isActive("heading", { level: 4 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      link: e.isActive("link"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
      image: e.isActive("image"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
      href: (e.getAttributes("link").href as string | undefined) ?? "",
      alt: (e.getAttributes("image").alt as string | undefined) ?? "",
    }),
  });
  const chain = () => editor.chain().focus();

  return (
    <>
      <div
        role="toolbar"
        aria-label="Formatting"
        className="no-scrollbar sticky top-16 z-20 -mx-1 flex items-center gap-0.5 overflow-x-auto rounded-card-sm border border-line bg-white/95 p-1 backdrop-blur sm:flex-wrap sm:overflow-visible lg:top-0"
      >
        <Tool label="Paragraph" active={state.paragraph} onClick={() => chain().setParagraph().run()}>
          <Pilcrow />
        </Tool>
        <Tool label="Heading" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
          <Heading2 />
        </Tool>
        <Tool label="Subheading" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
          <Heading3 />
        </Tool>
        <Tool label="Small heading" active={state.h4} onClick={() => chain().toggleHeading({ level: 4 }).run()}>
          <Heading4 />
        </Tool>
        <Divider />
        <Tool label="Bold (Ctrl/Cmd+B)" active={state.bold} onClick={() => chain().toggleBold().run()}>
          <Bold />
        </Tool>
        <Tool label="Italic (Ctrl/Cmd+I)" active={state.italic} onClick={() => chain().toggleItalic().run()}>
          <Italic />
        </Tool>
        <Tool label="Underline (Ctrl/Cmd+U)" active={state.underline} onClick={() => chain().toggleUnderline().run()}>
          <Underline />
        </Tool>
        <Tool label="Strikethrough" active={state.strike} onClick={() => chain().toggleStrike().run()}>
          <Strikethrough />
        </Tool>
        <Tool label="Inline code" active={state.code} onClick={() => chain().toggleCode().run()}>
          <Code />
        </Tool>
        <Tool label="Link" active={state.link} onClick={() => setLinkOpen(true)}>
          <Link2 />
        </Tool>
        <Divider />
        <Tool label="Bulleted list" active={state.bullet} onClick={() => chain().toggleBulletList().run()}>
          <List />
        </Tool>
        <Tool label="Numbered list" active={state.ordered} onClick={() => chain().toggleOrderedList().run()}>
          <ListOrdered />
        </Tool>
        <Tool label="Quote" active={state.quote} onClick={() => chain().toggleBlockquote().run()}>
          <Quote />
        </Tool>
        <Tool label="Code block" active={state.codeBlock} onClick={() => chain().toggleCodeBlock().run()}>
          <SquareCode />
        </Tool>
        <Tool label="Divider line" onClick={() => chain().setHorizontalRule().run()}>
          <Minus />
        </Tool>
        <Divider />
        <Tool label="Insert image" disabled={uploading} onClick={() => file.current?.click()}>
          {uploading ? <LoaderCircle className="animate-spin" /> : <ImagePlus />}
        </Tool>
        {state.image && (
          <Tool label="Image description (alt text)" onClick={() => setAltOpen(true)}>
            <TextCursorInput />
          </Tool>
        )}
        <Divider />
        <Tool label="Undo" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
          <Undo2 />
        </Tool>
        <Tool label="Redo" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
          <Redo2 />
        </Tool>
        <input
          ref={file}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            const picked = event.target.files?.[0];
            if (picked) onImage(picked);
            event.target.value = "";
          }}
        />
      </div>

      {linkOpen && (
        <LinkDialog
          initial={state.href}
          onClose={() => setLinkOpen(false)}
          onSave={(href) => {
            if (!href) chain().extendMarkRange("link").unsetLink().run();
            else chain().extendMarkRange("link").setLink({ href }).run();
            setLinkOpen(false);
          }}
        />
      )}
      {altOpen && (
        <AltDialog
          initial={state.alt}
          onClose={() => setAltOpen(false)}
          onSave={(alt) => {
            chain().updateAttributes("image", { alt }).run();
            setAltOpen(false);
          }}
        />
      )}
    </>
  );
}

function LinkDialog({ initial, onClose, onSave }: { initial: string; onClose: () => void; onSave: (href: string) => void }) {
  const [href, setHref] = useState(initial);
  return (
    <Dialog open onClose={onClose} title={initial ? "Edit link" : "Add a link"} description="Select text first, then add the link to it.">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          let value = href.trim();
          if (value && !/^(https?:|mailto:|tel:|\/|#)/i.test(value)) value = `https://${value}`;
          if (value && !ALLOWED_LINK.test(value)) return toast("Use a web address, an email (mailto:) or a phone number (tel:).", "error");
          onSave(value);
        }}
      >
        <Field label="Address" htmlFor="link-href" hint="e.g. https://drinkingwater.lk/rental, /contact or mailto:hello@drinkingwater.lk">
          <Input id="link-href" value={href} onChange={(e) => setHref(e.target.value)} placeholder="https://" autoFocus />
        </Field>
        <div className="flex flex-wrap justify-end gap-2">
          {initial && (
            <Button type="button" variant="ghost" onClick={() => onSave("")} className="mr-auto">
              Remove link
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save link</Button>
        </div>
      </form>
    </Dialog>
  );
}

function AltDialog({ initial, onClose, onSave }: { initial: string; onClose: () => void; onSave: (alt: string) => void }) {
  const [alt, setAlt] = useState(initial);
  return (
    <Dialog open onClose={onClose} title="Describe this image" description="Read out to people who can't see it, and used by search engines.">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(alt.trim().slice(0, 300));
        }}
      >
        <Field label="Description" htmlFor="image-alt" hint="e.g. A technician replacing the filter in an AquaElite purifier">
          <Input id="image-alt" value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={300} autoFocus />
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Dialog>
  );
}
