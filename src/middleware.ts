import { getSupabaseReqResClient } from "@/supabase-utils/reqResClient";
import { NextResponse } from "next/server";
import { TENANT_MAP } from "./tenant-map";
import { buildUrl, getHostnameAndPort } from "@/utils/url-helpers";
import { getSupabaseAdminClient } from "@/supabase-utils/adminClient";

export async function middleware(req: any) {
  const res = NextResponse.next();
  const { supabase, response } = getSupabaseReqResClient({ request: req, res });
  const session = await supabase.auth.getSession();
  const [hostname, port] = getHostnameAndPort(req);
  const supabaseAdmin = getSupabaseAdminClient();
  const { data: tenantData, error: tenantError } = await supabaseAdmin
    .from("tenants")
    .select("*")
    .eq("domain", hostname)
    .single();
  if (tenantError) {
    return NextResponse.rewrite(new URL("/not-found", req.url));
  }

  const requestedPath = req.nextUrl.pathname;
  const sessionUser = session.data?.session?.user;
  const tenant = TENANT_MAP[hostname as keyof typeof TENANT_MAP];
  const applicationPath = requestedPath;
  // update not check favicon
  if (requestedPath === "/favicon.ico") {
    return res;
  }
  if (!/[a-z0-9-_]+/.test(tenant)) {
    return NextResponse.rewrite(new URL("/not-found", req.url));
  }
  const portSuffix = port && port != "443" ? `:${port}` : "";
  const { protocol } = req.nextUrl;
  const tenantUrl = `${protocol}//${hostname}${portSuffix}/`;
  if (applicationPath.startsWith("/tickets")) {
    if (!sessionUser) {
      return NextResponse.redirect(buildUrl("/", tenant, req));
    } else if (!sessionUser.app_metadata?.tenants.includes(tenant)) {
      return NextResponse.rewrite(new URL("/not-found", req.url));
    }
  } else if (applicationPath === "/") {
    if (sessionUser) {
      return NextResponse.redirect(buildUrl("/tickets", tenant, req));
    }
  }

  const rewrittenResponse = NextResponse.rewrite(
    new URL(`/${tenant}${applicationPath}${req.nextUrl.search}`, req.url),
    {
      request: req,
    }
  );
  const cookiesToSet = response.value.cookies.getAll();
  cookiesToSet.forEach(({ name, value }) => {
    rewrittenResponse.cookies.set(name, value);
  });
  return rewrittenResponse;
}

export const config = { matcher: ["/((?!.*\\.).*)"] };
