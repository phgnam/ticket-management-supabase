import { getSupabaseAdminClient } from "@/supabase-utils/adminClient";
import { sendOTPLink } from "@/utils/sendOTPLink";
import { buildUrl } from "@/utils/url-helpers";
import { NextResponse } from "next/server";

export async function POST(request: any, { params }: any) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const tenant = params.tenant;
  const isNonEmptyString = (value: string) =>
    typeof value === "string" && value.trim().length > 0;
  const emailRegex = /^\S+@\S+$/; // simple front@back regex
  if (
    !isNonEmptyString(name) ||
    !isNonEmptyString(email) ||
    !emailRegex.test(email) ||
    !isNonEmptyString(password)
  ) {
    return NextResponse.redirect(buildUrl("/error", tenant, request), 302);
  }

  const [, emailHost] = email.split("@");

  const supabaseAdmin = getSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("tenants")
    .select("*")
    .eq("id", tenant)
    .eq("domain", emailHost)
    .single();

  const safeEmailString = encodeURIComponent(email);
  if (error) {
    return NextResponse.redirect(
      buildUrl(
        `/error?type=register_mail_mismatch&email=${safeEmailString}`,
        tenant,
        request
      ),
      302
    );
  }
  const { data: userData, error: userError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      app_metadata: {
        tenants: [tenant],
      },
    });
  console.log("userData", userData);
  if (userError) {
    const userExists = userError.message.includes("already been registered");
    if (userExists) {
      return NextResponse.redirect(
        buildUrl(
          `/error?type=register_mail_exists&email=${safeEmailString}`,
          tenant,
          request
        ),
        302
      );
    } else {
      return NextResponse.redirect(
        buildUrl("/error?type=register_unknown", tenant, request),
        302
      );
    }
  }
  const { data: serviceUser, error: testError } = await supabaseAdmin
    .from("service_users")
    .insert({
      full_name: name,
      supabase_user: userData.user.id,
    })
    .select()
    .single();
  const { error: tpError } = await supabaseAdmin
    .from("tenant_permissions")
    .insert({ tenant, service_user: serviceUser?.id });
  if (tpError) {
    await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
    return NextResponse.redirect(buildUrl("/error", tenant, request), 302);
  }
  return NextResponse.redirect(
    buildUrl(`/registration-success?email=${safeEmailString}`, tenant, request),
    302
  );
}
