import { notFound } from "next/navigation";

/** Unknown /admin URLs get the admin's own not-found screen, inside the panel. */
export default function MissingAdminPage() {
  notFound();
}
