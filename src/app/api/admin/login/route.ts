import { NextResponse } from "next/server";

import { isAuthorizedAdminRole } from "@/lib/admin-auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      email?: string;
      password?: string;
      redirectTo?: string;
    };

    const email = payload.email?.trim().toLowerCase() ?? "";
    const password = payload.password ?? "";
    const redirectTo = payload.redirectTo ?? "/admin/dashboard";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("role, is_active")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (
      profileError ||
      !profile ||
      profile.is_active !== true ||
      !isAuthorizedAdminRole(profile.role)
    ) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "This account does not have admin access." },
        { status: 403 },
      );
    }

    return NextResponse.json({ redirectTo });
  } catch {
    return NextResponse.json(
      { error: "We could not sign you in right now." },
      { status: 500 },
    );
  }
}
