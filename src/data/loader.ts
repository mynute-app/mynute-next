import { getBaseUrl } from "@/lib/utils";

export const baseUrl = getBaseUrl();

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