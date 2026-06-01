/**
 * Database types that mirror the Supabase schema in `supabase/schema.sql`.
 * Keep this file in sync with the SQL definitions.
 *
 * NOTE: these are declared with `type` (not `interface`) on purpose — object
 * literal type aliases are assignable to `Record<string, unknown>`, which the
 * Supabase generic schema constraint (`GenericTable`) requires. Interfaces are
 * not, which would silently collapse insert/update types to `never`.
 */

export type ExperienceLevel = "junior" | "mid" | "senior";

export type SalaryRow = {
  id: string;
  role: string;
  location: string;
  experience_level: ExperienceLevel;
  salary_min: number;
  salary_max: number;
  source: string | null;
  created_at: string;
};

export type UserSubmissionRow = {
  id: string;
  company: string;
  role: string;
  salary: number;
  experience_years: number;
  location: string;
  approved: boolean;
  created_at: string;
};

/** Payload accepted by the submission form / API (no server-managed fields). */
export type UserSubmissionInput = {
  company: string;
  role: string;
  salary: number;
  experience_years: number;
  location: string;
};

/**
 * Strongly-typed shape consumed by `@supabase/supabase-js` generics so query
 * results are correctly inferred across the app.
 */
export type Database = {
  public: {
    Tables: {
      salaries: {
        Row: SalaryRow;
        Insert: Omit<SalaryRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<SalaryRow, "id">>;
        Relationships: [];
      };
      user_submissions: {
        Row: UserSubmissionRow;
        Insert: UserSubmissionInput & {
          id?: string;
          approved?: boolean;
          created_at?: string;
        };
        Update: Partial<Omit<UserSubmissionRow, "id">>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      experience_level: ExperienceLevel;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
