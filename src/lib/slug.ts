/** Slug helpers used for salary page URLs like `software-engineer-malaysia`. */

/** Convert arbitrary text to a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumerics -> hyphen
    .replace(/^-+|-+$/g, "") // trim hyphens
    .replace(/-{2,}/g, "-"); // collapse repeats
}

/**
 * Build the canonical slug for a role + location pair.
 * e.g. ("Software Engineer", "Malaysia") -> "software-engineer-malaysia"
 */
export function buildSalarySlug(role: string, location: string): string {
  const roleSlug = slugify(role);
  const locationSlug = slugify(location);
  if (!locationSlug || roleSlug.endsWith(`-${locationSlug}`)) {
    return roleSlug;
  }
  return `${roleSlug}-${locationSlug}`;
}

/** Turn a slug back into a human-readable title (best-effort, for fallbacks). */
export function deslugify(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
