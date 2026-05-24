import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: appointmentId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("client-auth-token");

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let clientId: string;
  try {
    const base64Payload = token.value.split(".")[1];
    const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString());
    clientId = payload.data.id;
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const body = await request.json();
  const companyId: string = body.company_id;
  if (!companyId) {
    return NextResponse.json({ error: "company_id obrigatório" }, { status: 400 });
  }

  const res = await fetch(
    `${process.env.BACKEND_URL}/client/${clientId}/appointments/${appointmentId}/reschedule`,
    {
      method: "PATCH",
      headers: {
        "X-Auth-Token": token.value,
        "X-Company-ID": companyId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        new_start_time: body.new_start_time,
        new_end_time: body.new_end_time,
      }),
    }
  );

  if (res.status === 200 || res.status === 204) {
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  }
  const json = await res.json().catch(() => ({}));
  return NextResponse.json(json, { status: res.status });
}
