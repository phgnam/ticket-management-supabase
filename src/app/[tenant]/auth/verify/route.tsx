import { getSupabaseCookiesUtilClient } from "@/supabase-utils/cookiesUtilClient";
import { NextResponse } from "next/server";
export async function GET(request: any) {
  const { searchParams } = new URL(request.url);
  const hashed_token = searchParams.get("hashed_token");
  const supabase = getSupabaseCookiesUtilClient();
  const isRecovery = searchParams.get("type") === "recovery";
  const isSignUp = searchParams.get("type") === "signup";
  let verifyType = "magiclink";
  if (isRecovery) verifyType = "recovery";
  else if (isSignUp) verifyType = "signup";

  const { error } = await supabase.auth.verifyOtp({
    type: verifyType as any,
    token_hash: hashed_token ?? "",
  });
  if (error) {
    return NextResponse.redirect(
      new URL("/error?type=invalid_magiclink", request.url)
    );
  } else {
    return NextResponse.redirect(new URL("/tickets", request.url));
  }
}
