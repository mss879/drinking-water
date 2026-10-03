"use client";

import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/admin/ui/panel";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="card-line">
      <EmptyState
        icon={<TriangleAlert />}
        title="This screen couldn’t load"
        action={
          <Button type="button" onClick={() => retry()}>
            <RefreshCw aria-hidden className="size-4" />
            Try again
          </Button>
        }
      >
        Check your connection and try again. If it keeps happening, check that Supabase is up and the migrations have
        been run.
      </EmptyState>
    </div>
  );
}
