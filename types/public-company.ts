// Dedicated public-facing company types for unauthenticated GET /company/name/{name}

export type ImageMeta = {
  alt?: string;
  title?: string;
  caption?: string;
  url?: string;
};

export type DesignColors = {
  primary?: string;
  secondary?: string;
  tertiary?: string;
  quaternary?: string;
};

export type DesignImages = {
  profile?: ImageMeta;
  logo?: ImageMeta;
  banner?: ImageMeta;
  background?: ImageMeta;
  favicon?: ImageMeta;
  // Allow backend to add more keys without breaking
  [key: string]: ImageMeta | undefined;
};

export type Design = {
  colors?: DesignColors;
  images?: DesignImages;
};

export type SubdomainEntry = {
  id: string;
  name: string; // e.g. "abc-planejados"
  company_id: string;
};

export type EmployeeDesign = Design;

export type PublicEmployee = {
  id: string;
  company_id: string;
  name: string;
  surname?: string;
  time_zone?: string;
  total_service_density?: number;
  design?: EmployeeDesign;
  // Index signature to tolerate extra fields
  [key: string]: unknown;
};

export type PublicCompany = {
  id: string;
  legal_name: string; // e.g. "Abc-Planejados"
  trading_name: string;
  tax_id: string;
  design?: Design;
  sectors?: unknown[];
  subdomains?: SubdomainEntry[];
  employees?: PublicEmployee[];
  // Index signature to tolerate extra fields like branches/services when present
  [key: string]: unknown;
};
