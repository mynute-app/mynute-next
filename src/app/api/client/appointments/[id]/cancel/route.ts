import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: appointmentId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("client-auth-token");

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let clientId: string;
  let companyId: string | null = null;
  try {
    const base64Payload = token.value.split(".")[1];
    const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString());
    clientId = payload.data.id;
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  // company_id is required by the backend
  companyId = _request.nextUrl.searchParams.get("company_id");
  if (!companyId) {
    return NextResponse.json({ error: "company_id obrigatório" }, { status: 400 });
  }

  const res = await fetch(
    `${process.env.BACKEND_URL}/client/${clientId}/appointments/${appointmentId}`,
    {
      method: "DELETE",
      headers: {
        "X-Auth-Token": token.value,
        "X-Company-ID": companyId,
        "Content-Type": "application/json",
      },
    }
  );

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  const body = await res.json().catch(() => ({}));
  return NextResponse.json(body, { status: res.status });
}
