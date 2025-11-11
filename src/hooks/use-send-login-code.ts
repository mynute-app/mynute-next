import { useState } from "react";
import { toast } from "./use-toast";

interface UseSendLoginCodeResult {
  sendCode: (email: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const useSendLoginCode = (): UseSendLoginCodeResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (!email) {
        throw new Error("Email é obrigatório");
      }

      const encodedEmail = encodeURIComponent(email);

      const response = await fetch(
        `/api/employee/send-login-code/email/${encodedEmail}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar código de verificação");
      }

      toast({
        title: "Código enviado!",
        description: "Verifique seu email para obter o código de verificação.",
      });

      return true;
    } catch (err: any) {
      const errorMessage =
        err.message || "Erro ao enviar código de verificação";
      setError(errorMessage);

      toast({
        title: "Erro ao enviar código",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  return { sendCode, loading, error };
};
