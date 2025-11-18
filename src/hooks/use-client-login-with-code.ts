import { useState } from "react";

interface LoginResponse {
  message: string;
  token: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    verified: boolean;
  };
}

interface UseClientLoginWithCodeReturn {
  token: string | null;
  client: LoginResponse["client"] | null;
  loading: boolean;
  error: string | null;
  loginWithCode: (email: string, code: string) => Promise<boolean>;
  reset: () => void;
}

/**
 * Hook para fazer login de cliente usando email e código de verificação
 *
 * @example
 * ```tsx
 * const { token, client, loading, error, loginWithCode } = useClientLoginWithCode();
 *
 * const handleLogin = async () => {
 *   const success = await loginWithCode('cliente@example.com', '123456');
 *   if (success) {
 *     console.log('Token:', token);
 *     console.log('Cliente:', client);
 *   }
 * };
 * ```
 */
export function useClientLoginWithCode(): UseClientLoginWithCodeReturn {
  const [token, setToken] = useState<string | null>(null);
  const [client, setClient] = useState<LoginResponse["client"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithCode = async (
    email: string,
    code: string
  ): Promise<boolean> => {
    if (!email || !email.trim()) {
      setError("Email é obrigatório");
      return false;
    }

    if (!code || !code.trim()) {
      setError("Código é obrigatório");
      return false;
    }

    setLoading(true);
    setError(null);
    setToken(null);
    setClient(null);

    try {
      const response = await fetch("/api/client/login-with-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
        }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        setError(data.message || "Erro ao fazer login");
        return false;
      }

      setToken(data.token);
      setClient(data.client);
      setError(null);

      // Salvar token no localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("client_token", data.token);
        localStorage.setItem("client", JSON.stringify(data.client));
      }

      console.log("✅ Login realizado com sucesso:", {
        token: data.token,
        client: data.client,
      });

      return true;
    } catch (err) {
      console.error("❌ Erro ao fazer login:", err);
      setError("Erro ao conectar com o servidor");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setToken(null);
    setClient(null);
    setError(null);
    setLoading(false);
  };

  return {
    token,
    client,
    loading,
    error,
    loginWithCode,
    reset,
  };
}
