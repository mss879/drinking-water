import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/admin/ui/panel";
import { ButtonLink } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="card-line">
      <EmptyState
        icon={<SearchX />}
        title="Nothing here"
        action={
          <ButtonLink href="/admin" arrow>
            Back to the dashboard
          </ButtonLink>
        }
      >
        That page, post or lead doesn’t exist, or it has been deleted.
      </EmptyState>
    </div>
  );
}
