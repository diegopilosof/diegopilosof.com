/**
 * Derive the URL slug for an anchor post from its content-collection id.
 * Files under src/content/writing/ are named `YYYY-MM-<slug>.md`; the date
 * prefix is an editor-side ordering aid and is stripped from the public URL.
 * If a file has no date prefix, the id is used as-is.
 */
export function anchorSlugFromId(id: string): string {
  return id.replace(/^\d{4}-\d{2}-/, "");
}
