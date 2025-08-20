import { PATCH } from './../app/api/user/route';
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao fazer upload da imagem");
      }

      const data = await response.json();
      return data;
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
        `/api/employee/${employeeId}/design/images`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao remover a imagem");
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Erro ao remover imagem:", err);
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
