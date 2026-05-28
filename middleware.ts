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
import { decodeJWTToken, isBackendTokenExpired } from "@/utils/decode-jwt";

const LOGIN_ROUTES = new Set(["/auth/employee"]);
const SYSTEM_ADMIN_LOGIN_ROUTE = "/auth/system-admin";
const SYSTEM_ADMIN_DASHBOARD_PREFIX = "/system-admin/dashboard";
const TENANT_NATIVE_DASHBOARD_ROUTES = new Set([
  "/dashboard",
  "/dashboard/scheduling/view",
  "/dashboard/agendamentos",
  "/dashboard/clientes",
  "/dashboard/fornecedores",
  "/dashboard/services",
  "/dashboard/inventory",
  "/dashboard/your-team",
  "/dashboard/branch",
  "/dashboard/financeiro",
  "/dashboard/financeiro/contas-a-receber",
  "/dashboard/financeiro/contas-a-pagar",
  "/dashboard/financeiro/fluxo-de-caixa",
  "/dashboard/financeiro/orcamentos",
  "/dashboard/financeiro/relatorios",
  "/dashboard/financeiro/configuracoes",
  "/dashboard/config/your-brand",
  "/dashboard/config/account",
  "/dashboard/config/blocked-dates",
]);

export const middleware = auth(req => {
  const { pathname } = req.nextUrl;

  // --- System Admin routes ---
  const isSystemAdminDashboard =
    pathname === SYSTEM_ADMIN_DASHBOARD_PREFIX ||
    pathname.startsWith(`${SYSTEM_ADMIN_DASHBOARD_PREFIX}/`);

  const isSystemAdminLogin = pathname === SYSTEM_ADMIN_LOGIN_ROUTE;

  if (isSystemAdminDashboard) {
    if (!req.auth) {
      const url = req.nextUrl.clone();
      url.pathname = SYSTEM_ADMIN_LOGIN_ROUTE;
      url.search = "";
      return NextResponse.redirect(url);
    }

    const accessToken = (req.auth as any)?.accessToken as string | undefined;

    if (!accessToken || isBackendTokenExpired(accessToken)) {
      const url = req.nextUrl.clone();
      url.pathname = SYSTEM_ADMIN_LOGIN_ROUTE;
      url.search = "";
      const response = NextResponse.redirect(url);
      response.cookies.delete("authjs.session-token");
      response.cookies.delete("__Secure-authjs.session-token");
      return response;
    }

    const decoded = decodeJWTToken(accessToken);
    if (decoded?.type !== "system_admin") {
      const url = req.nextUrl.clone();
      url.pathname = SYSTEM_ADMIN_LOGIN_ROUTE;
      url.search = "";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  if (isSystemAdminLogin) {
    const accessToken = (req.auth as any)?.accessToken as string | undefined;
    if (req.auth && accessToken) {
      const decoded = decodeJWTToken(accessToken);
      if (decoded?.type === "system_admin" && !isBackendTokenExpired(accessToken)) {
        const url = req.nextUrl.clone();
        url.pathname = SYSTEM_ADMIN_DASHBOARD_PREFIX;
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }
  // --- End System Admin routes ---

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

    // System admin nao pertence a nenhum tenant — redireciona ao seu painel
    if (accessToken && !isBackendTokenExpired(accessToken)) {
      const decoded = decodeJWTToken(accessToken);
      if (decoded?.type === "system_admin") {
        const url = req.nextUrl.clone();
        url.pathname = SYSTEM_ADMIN_DASHBOARD_PREFIX;
        url.search = "";
        return NextResponse.redirect(url);
      }
    }

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
    // In production Edge runtime, NextResponse.rewrite() re-triggers middleware.
    // Only redirect paths that are native tenant routes (exist under src/app/[tenant]/dashboard/).
    // Non-native paths (e.g. /dashboard/branch/{id}/servicos) are served via rewrite
    // from src/app/dashboard/ and should pass through to avoid an infinite 307 loop.
    const isNativeLegacyRoute =
      TENANT_NATIVE_DASHBOARD_ROUTES.has(pathname) ||
      pathname === "/dashboard" ||
      pathname === "/dashboard/";

    if (isNativeLegacyRoute) {
      const url = req.nextUrl.clone();
      url.pathname = buildTenantPath(sessionTenant, pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
