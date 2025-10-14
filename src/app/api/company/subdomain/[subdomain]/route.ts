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
    // Usa a rota pública /company/name que retorna dados completos
    // Converte subdomain para nome da empresa (agenda-kaki -> Agenda-kaki ou agenda kaki)
    console.log(`� Buscando empresa pelo subdomain: ${subdomain}`);

    // Tenta buscar pelo nome exato do subdomain primeiro
    const res = await fetch(
      `${process.env.BACKEND_URL}/company/name/${encodeURIComponent(
        subdomain
      )}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      console.log(`❌ Empresa não encontrada: ${res.status}`);
      return NextResponse.json(
        { error: "Empresa não encontrada para esse subdomínio" },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log(`✅ Dados completos da empresa retornados`);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar empresa", details: String(error) },
      { status: 500 }
    );
  }
}
