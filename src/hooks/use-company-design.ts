// ✅ Ajuste completo do hook useCompanyDesign
import { useEffect, useState } from "react";

export type CompanyDesign = {
  logo: string | null;
  bannerImage: string | null;
  bannerColor: string;
  primaryColor: string;
  dark_mode: boolean; // <- adicionamos isso
};

type APICompanyResponse = {
  id: string;
  name: string;
  email: string;
  design: {
    colors: {
      primary: string;
      secondary: string;
      tertiary: string;
      quaternary: string;
    };
    images: {
      logo_url: string;
      banner_url: string;
      background_url: string;
      favicon_url: string;
    };
    font: string;
    dark_mode: boolean;
    custom_css: string;
  };
};

export function useCompanyDesign(companyId: string) {
  const [config, setConfig] = useState<CompanyDesign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3333/company/${companyId}`)
      .then(res => res.json())
      .then((data: APICompanyResponse) => {
        setConfig({
          logo: data.design.images.logo_url,
          bannerImage: data.design.images.banner_url,
          bannerColor: data.design.colors.secondary,
          primaryColor: data.design.colors.primary,
          dark_mode: data.design.dark_mode, // <- adicionamos isso
        });
      })
      .catch(err => {
        console.error("Erro ao buscar design da empresa", err);
        setConfig(null);
      })
      .finally(() => setLoading(false));
  }, [companyId]);

  return { config, loading };
}
