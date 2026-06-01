import type { UserSubmissionInput } from "@/types/database";

export type SubmissionErrors = Partial<Record<keyof UserSubmissionInput, string>>;

export interface ValidationResult {
  valid: boolean;
  errors: SubmissionErrors;
  /** Cleaned + coerced values, present only when `valid` is true. */
  data?: UserSubmissionInput;
}

const MAX_SALARY = 1_000_000; // monthly MYR sanity ceiling

/**
 * Validate and normalise a raw submission payload coming from the form or API.
 * Works on `unknown` so it is safe to use directly on request bodies.
 */
export function validateSubmission(input: unknown): ValidationResult {
  const errors: SubmissionErrors = {};
  const raw = (input ?? {}) as Record<string, unknown>;

  const company = typeof raw.company === "string" ? raw.company.trim() : "";
  const role = typeof raw.role === "string" ? raw.role.trim() : "";
  const location = typeof raw.location === "string" ? raw.location.trim() : "";
  const salary = Number(raw.salary);
  const experienceYears = Number(raw.experience_years);

  if (company.length < 2) {
    errors.company = "Please enter a company name.";
  }
  if (role.length < 2) {
    errors.role = "Please enter a job title.";
  }
  if (location.length < 2) {
    errors.location = "Please enter a location.";
  }
  if (!Number.isFinite(salary) || salary <= 0) {
    errors.salary = "Enter a monthly salary greater than 0.";
  } else if (salary > MAX_SALARY) {
    errors.salary = "That salary looks too high — please double-check.";
  }
  if (!Number.isFinite(experienceYears) || experienceYears < 0) {
    errors.experience_years = "Enter your years of experience (0 or more).";
  } else if (experienceYears > 60) {
    errors.experience_years = "Please enter a realistic number of years.";
  }

  const valid = Object.keys(errors).length === 0;

  return {
    valid,
    errors,
    data: valid
      ? {
          company,
          role,
          location,
          salary: Math.round(salary),
          experience_years: Math.round(experienceYears),
        }
      : undefined,
  };
}
