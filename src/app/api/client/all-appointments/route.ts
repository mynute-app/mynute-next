import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("client-auth-token");

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Decode JWT to get client_id
  let clientId: string;
  try {
    const base64Payload = token.value.split(".")[1];
    const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString());
    clientId = payload.data.id;
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") ?? "1";
  const pageSize = searchParams.get("page_size") ?? "20";

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL || 'http://localhost:4000'}/client/${clientId}/all-appointments?page=${page}&page_size=${pageSize}`,
      {
        headers: {
          "X-Auth-Token": token.value,
          "Content-Type": "application/json",
        },
      }
    );

    const body = await res.json().catch(() => ({}));
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Erro ao comunicar com o servidor" },
      { status: 502 }
    );
  }
}
