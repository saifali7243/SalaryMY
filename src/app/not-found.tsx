import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 max-w-md text-slate-600">
        The salary or page you&apos;re looking for doesn&apos;t exist yet. Try
        searching from the homepage or browse all salaries.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Back home
        </Link>
        <Link
          href="/salaries"
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-brand-300"
        >
          Browse salaries
        </Link>
      </div>
    </div>
  );
}
