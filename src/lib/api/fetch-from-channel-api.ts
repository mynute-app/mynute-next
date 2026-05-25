// ⚠️ SERVER-SIDE ONLY — não importar em componentes 'use client'
export async function fetchFromChannelApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = process.env.CHANNEL_API_URL;
  const secret = process.env.CHANNEL_API_SECRET;

  if (!baseUrl || !secret) {
    throw new Error("CHANNEL_API_URL or CHANNEL_API_SECRET not configured");
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Channel-Api-Key": secret,
        ...(options.headers ?? {}),
      },
    });
  } catch (networkError) {
    throw new Error(
      `Failed to reach channel API: ${
        networkError instanceof Error ? networkError.message : String(networkError)
      }`,
    );
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`channel-api error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}
