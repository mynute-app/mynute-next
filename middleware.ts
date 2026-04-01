// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "./auth";
import {
  buildTenantPath,
  extractTenantSlugFromPathname,
  normalizeTenantSlug,
  resolveTenantSlugFromRequest,
  stripTenantScopedPathname,
} from "@/lib/tenant";
import { isBackendTokenExpired } from "@/utils/decode-jwt";

const LOGIN_ROUTES = new Set(["/auth/employee"]);
const TENANT_NATIVE_DASHBOARD_ROUTES = new Set([
  "/dashboard",
  "/dashboard/scheduling/view",
  "/dashboard/agendamentos",
  "/dashboard/clientes",
  "/dashboard/services",
  "/dashboard/your-team",
  "/dashboard/branch",
  "/dashboard/config/your-brand",
  "/dashboard/config/account",
]);

export const middleware = auth(req => {
  const { pathname } = req.nextUrl;
  const pathTenant = extractTenantSlugFromPathname(pathname);
  const authTenant = normalizeTenantSlug(
    (req.auth as any)?.tenant ?? (req.auth as any)?.subdomain ?? null,
  );
  const sessionTenant = authTenant ?? resolveTenantSlugFromRequest(req);

  const isLegacyDashboardRoute =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isTenantLoginRoute = Boolean(
    pathTenant &&
    (pathname === `/${pathTenant}/login` ||
      pathname === `/${pathTenant}/login/`),
  );
  const isTenantDashboardRoute = Boolean(
    pathTenant &&
    (pathname === `/${pathTenant}/dashboard` ||
      pathname.startsWith(`/${pathTenant}/dashboard/`)),
  );
  const isTenantDashboardRoot = Boolean(
    pathTenant &&
    (pathname === `/${pathTenant}/dashboard` ||
      pathname === `/${pathTenant}/dashboard/`),
  );

  if (isTenantDashboardRoute) {
    if (!req.auth) {
      const url = req.nextUrl.clone();
      url.pathname = `/${pathTenant}/login`;
      url.search = "";
      return NextResponse.redirect(url);
    }

    const accessToken = (req.auth as any)?.accessToken as string | undefined;
    if (!accessToken || isBackendTokenExpired(accessToken)) {
      const url = req.nextUrl.clone();
      url.pathname = `/${pathTenant}/login`;
      url.search = "";
      const response = NextResponse.redirect(url);
      // Limpa os cookies de sessão do NextAuth para forçar novo login
      response.cookies.delete("authjs.session-token");
      response.cookies.delete("__Secure-authjs.session-token");
      return response;
    }

    if (sessionTenant && sessionTenant !== pathTenant) {
      const url = req.nextUrl.clone();
      const dashboardSuffix = pathname.slice(`/${pathTenant}`.length);
      url.pathname = `/${sessionTenant}${dashboardSuffix}`;
      return NextResponse.redirect(url);
    }

    const tenantScopedPath = stripTenantScopedPathname(pathname);

    if (
      isTenantDashboardRoot ||
      TENANT_NATIVE_DASHBOARD_ROUTES.has(tenantScopedPath)
    ) {
      return NextResponse.next();
    }

    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname =
      pathname.slice(`/${pathTenant}`.length) || "/dashboard";
    return NextResponse.rewrite(rewriteUrl);
  }

  if (req.auth && (LOGIN_ROUTES.has(pathname) || isTenantLoginRoute)) {
    const url = req.nextUrl.clone();
    url.pathname = buildTenantPath(sessionTenant, "/dashboard", "/dashboard");
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (req.auth && isLegacyDashboardRoute && sessionTenant) {
    const url = req.nextUrl.clone();
    url.pathname = buildTenantPath(sessionTenant, pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
