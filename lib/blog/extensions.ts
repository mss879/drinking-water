import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";

/** Links may only point to web pages, email, phone, or somewhere on this site. */
export const ALLOWED_LINK = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;

/**
 * The blog's document model, shared by the admin editor, the server-side check on save and the public renderer, so
 * all three agree on what an article may contain: paragraphs, H2–H4, bold, italic, underline, strike, inline code,
 * links, lists, quotes, code blocks, rules and images (uploaded to the blog's own storage).
 */
export const blogExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      protocols: ["http", "https", "mailto", "tel"],
      isAllowedUri: (url) => ALLOWED_LINK.test(url),
    },
  }),
  Image.configure({ inline: false, allowBase64: false }),
];
