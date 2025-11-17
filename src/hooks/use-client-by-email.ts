import { useState } from "react";

interface Client {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UseClientByEmailReturn {
  client: Client | null;
  loading: boolean;
  error: string | null;
  checkEmail: (email: string) => Promise<void>;
  reset: () => void;
}

/**
 * Hook para buscar um cliente por email
 *
 * @example
 * ```tsx
 * const { client, loading, error, checkEmail, reset } = useClientByEmail();
 *
 * // Buscar cliente por email
 * await checkEmail('cliente@example.com');
 *
 * // Resetar estado
 * reset();
 * ```
 */
export function useClientByEmail(): UseClientByEmailReturn {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEmail = async (email: string) => {
    if (!email || !email.trim()) {
      setError("Email é obrigatório");
      return;
    }

    setLoading(true);
    setError(null);
    setClient(null);

    try {
      const encodedEmail = encodeURIComponent(email.trim());
      console.log("🔍 Buscando email:", email.trim());

      const response = await fetch(`/api/client/email/${encodedEmail}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Status:", response.status);
      const data = await response.json();
      console.log("📦 Resposta:", data);

      if (!response.ok) {
        // Cliente não encontrado (404)
        if (response.status === 404) {
          console.log("❌ Cliente não encontrado");
          setClient(null);
          setError("Cliente não encontrado");
        } else {
          setError(data.error || "Erro ao buscar cliente");
        }
        return;
      }

      console.log("✅ Cliente encontrado:", data);
      setClient(data);
      setError(null);
    } catch (err) {
      console.error("❌ Erro ao buscar cliente por email:", err);
      setError("Erro ao conectar com o servidor");
      setClient(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setClient(null);
    setError(null);
    setLoading(false);
  };

  return {
    client,
    loading,
    error,
    checkEmail,
    reset,
  };
}
