type CachedCompany = {
  id: string;
  schema_name?: string;
};

const companyCache = new Map<string, CachedCompany>();

export function getCachedCompany(subdomain: string): CachedCompany | undefined {
  return companyCache.get(subdomain);
}

export function setCachedCompany(subdomain: string, company: CachedCompany) {
  companyCache.set(subdomain, company);
}
