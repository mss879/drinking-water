/** Postgres / PostgREST codes that mean the migrations haven't been run yet. */
const MISSING_SCHEMA = new Set(["42P01", "42883", "PGRST202", "PGRST205", "3F000"]);

export function isMissingSchema(error: { code?: string } | null | undefined) {
  return Boolean(error?.code && MISSING_SCHEMA.has(error.code));
}
