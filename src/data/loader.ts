import { apiBaseUrl, getBaseUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { auth } from "../../auth";
import { useSession } from "next-auth/react";

export const baseUrl = getBaseUrl();
const apiUrl = apiBaseUrl();

async function fetchData(url: string) {
  try {
    const response = await fetch(url, {
      next: {
        revalidate: 3,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function getServices() {
  return fetchData(`${baseUrl}/services`);
}

export const useFetch = <T>(endpoint: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = `${baseUrl}${endpoint}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Erro ao buscar dados");

        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || "Erro desconhecido");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};

