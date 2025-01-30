import { useEffect } from "react";
import { useSession } from "next-auth/react";

export const AboutSection = () => {
  const email = "vitor@gmail.com";
  const API_URL = `http://localhost:4000/user/email/${email}`;
  const { data: session } = useSession();
  const TOKEN = `${session?.accessToken}`;
  console.log(TOKEN);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(API_URL, {
          mode: "no-cors",
          headers: {
            Authorization: TOKEN,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar os dados do usuário");
        }

        const data = await response.json();
        console.log("Resposta da API:", data); // Log para verificar os dados
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchUserData();
  }, [API_URL, TOKEN]);

  return (
    <div className="space-y-4">Verifique o console para o log da API.</div>
  );
};
