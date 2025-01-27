// services/userService.ts
import { getSession } from "next-auth/react";

export const fetchUserData = async (): Promise<any> => {
  try {
    // Recupera a sessão para obter o token ou o e-mail do usuário logado
    const session = await getSession();
    if (!session || !session.accessToken) {
      throw new Error("Usuário não autenticado.");
    }

    const response = await fetch(`/api/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`, // Token de autenticação
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar os dados do usuário.");
    }

    const data = await response.json();
    return data; // Retorna os dados do usuário
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    throw error; // Propaga o erro para lidar no componente
  }
};
