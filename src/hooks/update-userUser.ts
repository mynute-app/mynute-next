import { useState } from "react";

export const useUpdateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = async (updatedData: { name: string; surname: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar usuário");
      }

      return await response.json();
    } catch (err) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateUser, loading, error };
};
