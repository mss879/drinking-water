import { MessageCircle } from "lucide-react";
import { site } from "@/content/site";

/** WhatsApp / chat CTA for high-intent visitors (brief §15). */
export function WhatsAppButton() {
  return (
    <a
      href={site.contact.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with LUSAKO on WhatsApp"
      className="fixed right-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-40 inline-flex size-12 items-center justify-center gap-2 rounded-full bg-ocean text-sm font-medium text-white shadow-float transition-transform duration-200 ease-emph hover:-translate-y-0.5 lg:right-6 lg:bottom-6 lg:h-14 lg:w-auto lg:px-5"
    >
      <MessageCircle aria-hidden className="size-5" />
      <span className="hidden lg:inline">WhatsApp us</span>
    </a>
  );
}
