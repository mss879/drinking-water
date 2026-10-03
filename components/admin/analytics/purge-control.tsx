"use client";

import { useState, useTransition } from "react";
import { purgeAnalytics } from "@/app/actions/admin/analytics";
import { ConfirmDialog } from "@/components/admin/ui/dialog";
import { Select } from "@/components/admin/ui/field";
import { toast } from "@/components/admin/ui/toaster";
import { Button } from "@/components/ui/button";

/** Clears old visit data, to keep the database small. */
export function PurgeControl() {
  const [months, setMonths] = useState(13);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center">
      <p className="text-muted">Keep visit data for</p>
      <div className="flex items-center gap-2">
        <Select aria-label="How long to keep visit data" value={months} onChange={(e) => setMonths(Number(e.target.value))} className="h-10 w-36 text-sm">
          {[6, 12, 13, 24].map((value) => (
            <option key={value} value={value}>
              {value} months
            </option>
          ))}
        </Select>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
          Delete older visits
        </Button>
      </div>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        pending={pending}
        title={`Delete visits older than ${months} months?`}
        description="Their page views, clicks and speed readings go too. Inquiries and the CRM aren’t affected."
        onConfirm={() =>
          startTransition(async () => {
            const result = await purgeAnalytics(months);
            if (!result.ok) return toast(result.error, "error");
            toast(result.message ?? "Done.");
            setOpen(false);
          })
        }
      />
    </div>
  );
}
