import { useState } from "react";

type Params = {
  logo?: File;
  banner?: File;
  favicon?: File;
  background?: File;
  companyId?: string;
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
    companyId,
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
      if (companyId) formData.append("companyId", companyId); // opcional, backend tem fallback

      const res = await fetch("/api/company/design/images", {
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
      setSuccess(true);
      return result;
    } catch (err: any) {
      const message = err?.message || "Erro inesperado.";
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
