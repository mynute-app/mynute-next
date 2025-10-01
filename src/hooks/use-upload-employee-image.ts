import { useState } from "react";

interface UploadImageResponse {
  imageUrl: string;
  message: string;
}

export function useUploadEmployeeImage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (
    employeeId: number | string,
    file: File
  ): Promise<UploadImageResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("profile", file);

      const response = await fetch(
        `/api/employee/${employeeId}/design/images`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (!response.ok) {
        let errorMessage = "Erro ao fazer upload da imagem";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Se não conseguir fazer parse do JSON, usar mensagem genérica
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Extrair a URL da estrutura retornada pelo backend
      const imageUrl = data.profile?.url || data.imageUrl || null;

      return {
        imageUrl,
        message: data.message || "Upload realizado com sucesso",
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro no upload:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (employeeId: number | string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/employee/${employeeId}/design/images/profile`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        let errorMessage = "Erro ao remover a imagem";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Se não conseguir fazer parse do JSON, usar mensagem genérica
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("❌ Hook: Erro ao remover imagem:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadImage,
    deleteImage,
    loading,
    error,
  };
}
