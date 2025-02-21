import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    console.log("Resposta do Backend:", {
      status: backendResponse.status,
    });

    if (backendResponse.ok) {
      return NextResponse.json(
        { message: "Usuário cadastrado com sucesso" },
        { status: backendResponse.status }
      );
    }

    if (backendResponse.status === 500) {
      const text = await backendResponse.text();

      if (
        text.includes("duplicate key value violates unique constraint") &&
        text.includes("uni_users_email")
      ) {
        return NextResponse.json(
          {
            field: "email",
            message: "Este e-mail já está cadastrado. Tente outro.",
          },
          { status: 400 }
        );
      }

      if (
        text.includes("duplicate key value violates unique constraint") &&
        text.includes("uni_users_phone")
      ) {
        return NextResponse.json(
          {
            field: "phone",
            message: "Este telefone já está cadastrado. Tente outro.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: "Erro desconhecido ao registrar." },
      { status: backendResponse.status }
    );
  } catch (error) {
    console.error("Erro no servidor:", error);
    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
