import { useState } from "react";

interface SendVerificationCodeResponse {
  message: string;
  email: string;
  code?: string; // Apenas para desenvolvimento/teste
}

interface UseSendVerificationCodeReturn {
  data: SendVerificationCodeResponse | null;
  loading: boolean;
  error: string | null;
  sendVerificationCode: (email: string) => Promise<boolean>;
  reset: () => void;
}

/**
 * Hook para enviar código de verificação por email
 *
 * @example
 * ```tsx
 * const { data, loading, error, sendVerificationCode } = useSendVerificationCode();
 *
 * const handleSendCode = async () => {
 *   const success = await sendVerificationCode('cliente@example.com');
 *   if (success) {
 *     console.log('Código enviado!');
 *   }
 * };
 * ```
 */
export function useClientSendLoginCode(): UseSendVerificationCodeReturn {
  const [data, setData] = useState<SendVerificationCodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendVerificationCode = async (email: string): Promise<boolean> => {
    if (!email || !email.trim()) {
      setError("Email é obrigatório");
      return false;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const encodedEmail = encodeURIComponent(email.trim());
      const response = await fetch(
        `/api/client/send-login-code/email/${encodedEmail}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseData: SendVerificationCodeResponse = await response.json();

      if (!response.ok) {
        setError(
          responseData.message || "Erro ao enviar código de verificação"
        );
        return false;
      }

      setData(responseData);
      setError(null);
      return true;
    } catch (err) {
      console.error("Erro ao enviar código de verificação:", err);
      setError("Erro ao conectar com o servidor");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    sendVerificationCode,
    reset,
  };
}
