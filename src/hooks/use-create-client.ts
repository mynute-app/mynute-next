import { useState } from "react";

interface Client {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  verified: boolean;
}

interface CreateClientRequest {
  email: string;
  name: string;
  surname: string;
  phone: string;
  password: string;
}

interface CreateClientResponse {
  message: string;
  client: Client;
}

interface UseCreateClientReturn {
  createdClient: Client | null;
  loading: boolean;
  error: string | null;
  createClient: (data: CreateClientRequest) => Promise<Client | null>;
  reset: () => void;
}

/**
 * Hook para criar um novo cliente
 *
 * @example
 * ```tsx
 * const { createdClient, loading, error, createClient } = useCreateClient();
 *
 * const handleCreate = async () => {
 *   const client = await createClient({
 *     email: 'novo@example.com',
 *     name: 'João',
 *     surname: 'Silva',
 *     phone: '11999999999'
 *   });
 *
 *   if (client) {
 *     console.log('Cliente criado:', client);
 *   }
 * };
 * ```
 */
export function useCreateClient(): UseCreateClientReturn {
  const [createdClient, setCreatedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClient = async (
    data: CreateClientRequest
  ): Promise<Client | null> => {
    setLoading(true);
    setError(null);
    setCreatedClient(null);

    try {
      console.log("📝 Enviando dados para criar cliente:", data);

      const response = await fetch("/api/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("📡 Status:", response.status);
      const responseData = await response.json();
      console.log("📦 Resposta:", responseData);

      if (!response.ok) {
        console.log("❌ Erro ao criar cliente");
        setError(responseData.message || "Erro ao criar cliente");
        return null;
      }

      console.log("✅ Cliente criado com sucesso:", responseData);
      setCreatedClient(responseData);
      setError(null);
      return responseData;
    } catch (err) {
      console.error("❌ Erro ao criar cliente:", err);
      setError("Erro ao conectar com o servidor");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCreatedClient(null);
    setError(null);
    setLoading(false);
  };

  return {
    createdClient,
    loading,
    error,
    createClient,
    reset,
  };
}
