import { useState } from "react";

type Params = {
  logo?: File;
  banner?: File;
  favicon?: File;
  background?: File;
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

      const res = await fetch("/api/company/design/images", {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Erro ao atualizar imagens.");
      }

      setSuccess(true);
      return await res.json();
    } catch (err: any) {
      setError(err.message || "Erro inesperado.");
      throw err;
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
