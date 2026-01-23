import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/client/email/[email]
 * Retrieve a client by its email
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);

    console.log("🔍 Buscando cliente na API:", decodedEmail);

    const response = await fetch(
      `${process.env.BACKEND_URL}/client/email/${decodedEmail}`
    );

    console.log("📡 Status da API:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log("❌ Erro da API:", errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const clientData = await response.json();
    console.log("✅ Cliente encontrado:", clientData);

    return NextResponse.json(clientData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar cliente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
