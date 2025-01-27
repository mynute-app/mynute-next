import { getSession } from "next-auth/react";

export const fetchData = async () => {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error("Usuário não autenticado");
  }

  console.log("Token de acesso:", session.accessToken);

  const response = await fetch("http://localhost:3000/api/protected", {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  return response.json();
};
