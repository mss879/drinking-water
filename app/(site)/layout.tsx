import type { ReactNode } from "react";
import { SiteChrome } from "@/components/layout/site-chrome";

/** The public website. Its pages share the marketing chrome; /admin has a layout of its own. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
