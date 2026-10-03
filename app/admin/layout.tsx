import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/admin/ui/toaster";

// Admin screens are per-user and live: never prerender or cache them.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · LUSAKO Admin" },
  robots: { index: false, follow: false },
};

/** The admin: no marketing chrome, no smooth scrolling, no tracking. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-canvas">
      {children}
      <Toaster />
    </div>
  );
}
