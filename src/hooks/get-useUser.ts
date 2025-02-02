import { useEffect, useState } from "react";

export const useGetUser = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setUser({});
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  return { user, loading };
};
