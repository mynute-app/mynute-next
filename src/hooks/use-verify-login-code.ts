import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "./use-toast";

interface UseVerifyLoginCodeResult {
  verifyCode: (email: string, code: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const useVerifyLoginCode = (): UseVerifyLoginCodeResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const verifyCode = async (email: string, code: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (!email || !code) {
        throw new Error("Email e código são obrigatórios");
      }

      const result = await signIn("code-login", {
        email,
        code,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Código inválido ou expirado");
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });

      router.push("/dashboard/your-brand");

      return true;
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao verificar código";
      setError(errorMessage);

      toast({
        title: "Erro ao verificar código",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  return { verifyCode, loading, error };
};
