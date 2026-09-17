"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/** Records one `product_view` per product page (brief §15: analytics for product views). Renders nothing. */
export function TrackView({ slug, name }: { slug: string; name: string }) {
  // Guards against the double effect run in development Strict Mode, while still
  // tracking a new product when the user navigates between product pages.
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    if (tracked.current === slug) return;
    tracked.current = slug;
    track("product_view", { product_slug: slug, product_name: name });
  }, [slug, name]);

  return null;
}
