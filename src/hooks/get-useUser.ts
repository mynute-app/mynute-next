import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { User } from "../../types/user";

export const useGetUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const { status } = useSession();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        const response = await fetch(`/api/user`, {
          signal: abortRef.current.signal,
          cache: "no-store",
        });
        const data: User = await response.json();

        setUser(data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Apenas busca após autenticar; evita chamadas antes da sessão
    if (status === "authenticated") {
      setLoading(true);
      fetchUserData();
    }

    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [status]);

  return { user, loading };
};
