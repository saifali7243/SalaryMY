"use client";

import { useState } from "react";

import type { SubmissionErrors } from "@/lib/validation";
import { validateSubmission } from "@/lib/validation";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY = {
  company: "",
  role: "",
  salary: "",
  experience_years: "",
  location: "",
};

export function SubmissionForm() {
  const [values, setValues] = useState({ ...EMPTY });
  const [errors, setErrors] = useState<SubmissionErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  function update(field: keyof typeof EMPTY, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof SubmissionErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerMessage(null);

    const payload = {
      company: values.company,
      role: values.role,
      location: values.location,
      salary: values.salary,
      experience_years: values.experience_years,
    };

    const result = validateSubmission(payload);
    if (!result.valid) {
      setErrors(result.errors);
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        errors?: SubmissionErrors;
      };

      if (!res.ok) {
        if (body.errors) setErrors(body.errors);
        setServerMessage(
          body.error ?? "Something went wrong. Please try again."
        );
        setStatus("error");
        return;
      }

      setStatus("success");
      setValues({ ...EMPTY });
      setErrors({});
    } catch {
      setServerMessage("Network error. Please check your connection.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white">
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-ink">Thank you!</h3>
        <p className="mt-1 text-sm text-slate-600">
          Your salary has been submitted and will help others negotiate fairly.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Company"
          name="company"
          value={values.company}
          onChange={(v) => update("company", v)}
          error={errors.company}
          placeholder="e.g. Grab"
          autoComplete="organization"
        />
        <Field
          label="Job title / Role"
          name="role"
          value={values.role}
          onChange={(v) => update("role", v)}
          error={errors.role}
          placeholder="e.g. Software Engineer"
          autoComplete="organization-title"
        />
        <Field
          label="Monthly salary (MYR)"
          name="salary"
          type="number"
          inputMode="numeric"
          value={values.salary}
          onChange={(v) => update("salary", v)}
          error={errors.salary}
          placeholder="e.g. 7000"
          min={0}
        />
        <Field
          label="Years of experience"
          name="experience_years"
          type="number"
          inputMode="numeric"
          value={values.experience_years}
          onChange={(v) => update("experience_years", v)}
          error={errors.experience_years}
          placeholder="e.g. 3"
          min={0}
        />
        <div className="sm:col-span-2">
          <Field
            label="Location"
            name="location"
            value={values.location}
            onChange={(v) => update("location", v)}
            error={errors.location}
            placeholder="e.g. Kuala Lumpur"
            autoComplete="address-level2"
          />
        </div>
      </div>

      {serverMessage && status === "error" && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? "Submitting…" : "Submit salary"}
      </button>

      <p className="text-xs text-slate-400">
        Submissions are anonymous. Don&apos;t include personal information.
      </p>
    </form>
  );
}

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "text";
  autoComplete?: string;
  min?: number;
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  min,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`mt-1.5 h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:ring-2 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-200"
            : "border-slate-200 focus:border-brand-500 focus:ring-brand-500/30"
        }`}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
