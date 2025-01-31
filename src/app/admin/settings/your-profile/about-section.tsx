import { useEffect } from "react";

export const AboutSection = () => {
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user`);

        const data = await response.json();
        console.log(data);

        console.log("Resposta da API:", data); // Log para verificar os dados
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="space-y-4">Verifique o console para o log da API.</div>
  );
};
