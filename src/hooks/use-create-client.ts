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

  // Função para formatar telefone no formato E.164
  const formatPhoneToE164 = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length >= 10) {
      if (cleaned.length >= 11) {
        return `+${cleaned}`;
      }
      return `+55${cleaned}`;
    }
    return `+55${cleaned}`;
  };

  const createClient = async (
    data: CreateClientRequest
  ): Promise<Client | null> => {
    setLoading(true);
    setError(null);
    setCreatedClient(null);

    try {
      const formattedData = {
        ...data,
        phone: formatPhoneToE164(data.phone),
      };

      console.log("📝 Enviando dados para criar cliente:", formattedData);

      const response = await fetch("/api/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      console.log("📡 Status:", response.status);
      const responseData = await response.json();
      console.log("📦 Resposta completa:", responseData);
      console.log("📦 Mensagem:", responseData.message);
      console.log("📦 Erro:", responseData.error);

      if (!response.ok) {
        console.log("❌ Erro ao criar cliente");
        const errorMessage =
          responseData.message ||
          responseData.error ||
          JSON.stringify(responseData) ||
          "Erro ao criar cliente";

        console.log("🔍 Analisando erro:", errorMessage);

        // Detectar erros específicos de constraint
        if (
          errorMessage.includes("idx_public_clients_phone") ||
          (errorMessage.includes(
            "duplicate key value violates unique constraint"
          ) &&
            errorMessage.includes("phone")) ||
          (errorMessage.includes("duplicate") && errorMessage.includes("phone"))
        ) {
          console.log("📞 Detectado: Telefone duplicado");
          setError("PHONE_DUPLICATE");
        } else if (
          errorMessage.includes("idx_public_clients_email") ||
          (errorMessage.includes(
            "duplicate key value violates unique constraint"
          ) &&
            errorMessage.includes("email")) ||
          (errorMessage.includes("duplicate") && errorMessage.includes("email"))
        ) {
          console.log("📧 Detectado: Email duplicado");
          setError("EMAIL_DUPLICATE");
        } else {
          console.log("⚠️ Erro genérico:", errorMessage);
          setError(errorMessage);
        }
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
