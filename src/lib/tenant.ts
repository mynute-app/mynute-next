const TENANT_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const RESERVED_PATH_SEGMENTS = new Set([
  "api",
  "auth",
  "dashboard",
  "register",
  "_next",
  "favicon.ico",
]);

const TENANT_SCOPED_ROUTE_SEGMENTS = new Set([
  "dashboard",
  "login",
  "verify-code",
  "forgot-password",
  "change-password",
]);

const RESERVED_HOST_LABELS = new Set(["www", "agenda", "localhost"]);

function normalizePath(path: string): string {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function normalizeTenantSlug(value: string | null | undefined) {
  const candidate = value?.trim().toLowerCase();

  if (!candidate || !TENANT_SLUG_REGEX.test(candidate)) {
    return null;
  }

  return candidate;
}

export function extractTenantSlugFromPathname(pathname: string): string | null {
  const [firstSegment] = pathname.split("?")[0].split("/").filter(Boolean);

  if (!firstSegment) {
    return null;
  }

  const lowered = firstSegment.toLowerCase();

  if (RESERVED_PATH_SEGMENTS.has(lowered)) {
    return null;
  }

  return normalizeTenantSlug(lowered);
}

export function extractTenantSlugFromUrl(url: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return extractTenantSlugFromPathname(parsed.pathname);
  } catch {
    return null;
  }
}

export function extractTenantSlugFromHost(host: string): string | null {
  if (!host) return null;

  const hostWithoutPort = host.split(":")[0].toLowerCase();
  const isIpHost = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostWithoutPort);

  if (!hostWithoutPort || isIpHost) {
    return null;
  }

  const labels = hostWithoutPort.split(".");

  if (labels.length < 3) {
    return null;
  }

  const candidate = labels[0];

  if (RESERVED_HOST_LABELS.has(candidate)) {
    return null;
  }

  return normalizeTenantSlug(candidate);
}

export function resolveTenantSlugFromRequest(
  req: Request,
  explicitTenant?: string | null,
): string | null {
  const normalizedExplicit = normalizeTenantSlug(explicitTenant);
  if (normalizedExplicit) return normalizedExplicit;

  const requestPathTenant = extractTenantSlugFromPathname(new URL(req.url).pathname);
  if (requestPathTenant) return requestPathTenant;

  const refererTenant = extractTenantSlugFromUrl(req.headers.get("referer") || "");
  if (refererTenant) return refererTenant;

  return extractTenantSlugFromHost(req.headers.get("host") || "");
}

export function buildTenantPath(
  tenant: string | null | undefined,
  tenantPath: string,
  fallbackPath?: string,
): string {
  const normalizedTenant = normalizeTenantSlug(tenant);

  if (normalizedTenant) {
    return `/${normalizedTenant}${normalizePath(tenantPath)}`;
  }

  if (fallbackPath) {
    return normalizePath(fallbackPath);
  }

  return normalizePath(tenantPath);
}

export function stripTenantScopedPathname(pathname: string): string {
  const normalizedPath = normalizePath(pathname.split("?")[0] || "/");
  const segments = normalizedPath.split("/").filter(Boolean);

  if (segments.length < 2) {
    return normalizedPath;
  }

  const [tenant, scopedRoute] = segments;

  if (
    !normalizeTenantSlug(tenant) ||
    !TENANT_SCOPED_ROUTE_SEGMENTS.has(scopedRoute.toLowerCase())
  ) {
    return normalizedPath;
  }

  return `/${segments.slice(1).join("/")}`;
}
