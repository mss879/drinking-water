"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Records which addresses lead to the 404 page, so broken links show up in the admin's analytics. */
export function TrackNotFound() {
  useEffect(() => {
    track("page_not_found", { path: window.location.pathname });
  }, []);
  return null;
}
