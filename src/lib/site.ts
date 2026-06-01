/** Central site configuration used for metadata, SEO and links. */

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  // Vercel provides this automatically in preview/production deployments.
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

export const siteConfig = {
  name: "SalaryMY",
  title: "SalaryMY — Malaysia Salary Transparency & Benchmarks",
  description:
    "Discover real salary ranges across Malaysia by role and experience level. Compare junior, mid and senior pay, and submit your own salary anonymously.",
  url: resolveSiteUrl(),
  locale: "en_MY",
  keywords: [
    "Malaysia salary",
    "gaji Malaysia",
    "salary guide Malaysia",
    "software engineer salary Malaysia",
    "salary benchmark",
    "salary transparency",
  ],
};

export type SiteConfig = typeof siteConfig;
