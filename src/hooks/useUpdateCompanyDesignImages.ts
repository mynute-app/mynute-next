import { useState } from "react";

type Params = {
  logo?: File;
  banner?: File;
  favicon?: File;
  background?: File;
  colors?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
    quaternary?: string;
  };
};

export function useUpdateCompanyDesignImages() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const updateImages = async ({
    logo,
    banner,
    favicon,
    background,
    colors,
  }: Params) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      if (logo) formData.append("logo", logo);
      if (banner) formData.append("banner", banner);
      if (favicon) formData.append("favicon", favicon);
      if (background) formData.append("background", background);

      // Adicionando cores ao FormData
      if (colors) {
        formData.append("colors", JSON.stringify(colors));
      }

      const apiUrl = "/api/company/design/images";
      console.log("Enviando requisição PATCH para:", apiUrl);

      // Captura informações do host/subdomínio
      const host = window.location.hostname;
      const subdomain = host.split(".")[0];
      console.log("🌐 Host atual:", host);
      console.log("🌐 Subdomínio em uso:", subdomain);
      console.log("FormData enviado:", {
        logo: logo ? logo.name : null,
        banner: banner ? banner.name : null,
        favicon: favicon ? favicon.name : null,
        background: background ? background.name : null,
        colors,
      });

      const res = await fetch(apiUrl, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = "Erro ao atualizar imagens.";
        try {
          const errorBody = await res.json();
          errorMessage = errorBody?.error || errorMessage;
        } catch (_) {}
        throw new Error(errorMessage);
      }
      const result = await res.json();
      console.log("Resposta da API:", result);
      setSuccess(true);
      return result;
    } catch (err: any) {
      const message = err?.message || "Erro inesperado.";
      console.error("Erro na requisição:", err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    updateImages,
    loading,
    error,
    success,
  };
}
