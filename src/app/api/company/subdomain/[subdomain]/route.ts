import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  const subdomain = params.subdomain;

  if (!subdomain) {
    return NextResponse.json(
      { error: "Subdomínio é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/company/subdomain/${subdomain}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Empresa não encontrada para esse subdomínio" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar empresa", details: String(error) },
      { status: 500 }
    );
  }
}
