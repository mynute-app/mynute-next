import { useEffect, useState } from "react";
import { User } from "../../types/user";

export const useGetUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user`);
        const data: User = await response.json();

        setUser(data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setUser(null); 
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { user, loading };
};
