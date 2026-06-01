import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { validateSubmission } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const result = validateSubmission(payload);
  if (!result.valid || !result.data) {
    return NextResponse.json(
      { error: "Please correct the highlighted fields.", errors: result.errors },
      { status: 422 }
    );
  }

  // Without Supabase configured we accept the submission as a no-op so the UI
  // remains fully functional in local/demo environments.
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: true, persisted: false },
      { status: 201 }
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("user_submissions")
      .insert(result.data);

    if (error) {
      return NextResponse.json(
        { error: "Could not save your submission. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, persisted: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error. Please try again." },
      { status: 500 }
    );
  }
}
