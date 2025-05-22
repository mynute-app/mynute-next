import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

export const GET = auth(async function GET(req) {
  const email = req.auth?.user.email;
  const Authorization = req.auth?.accessToken;

  if (!Authorization) {
    return NextResponse.json({ status: 401 });
  }

  try {
    const host = req.headers.get("host") || "";
    const subdomain = host.split(".")[0];

    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomínio não identificado." },
        { status: 400 }
      );
    }

    const companyRes = await fetch(
      `${process.env.NEXTAUTH_URL}/api/company/subdomain/${subdomain}`,
      { cache: "no-store" }
    );

    if (!companyRes.ok) {
      return NextResponse.json(
        { error: "Empresa não encontrada para esse subdomínio." },
        { status: 404 }
      );
    }

    const company = await companyRes.json();
    console.log(company);
    const response = await fetch(
      `${process.env.BACKEND_URL}/employee/email/${email}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization,
          "X-Company-ID": company.id,
        },
      }
    );
    console.log("📦 Enviando para backend:");
    console.log("URL:", `${process.env.BACKEND_URL}/employee/email/${email}`);
    console.log("Authorization:", Authorization);
    console.log("Company ID:", company.id);

    if (!response.ok) {
      throw new Error("Erro ao buscar os dados do usuário");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
});

export const PATCH = auth(async function PATCH(req) {
  const email = req.auth?.user.email;
  const Authorization = req.auth?.accessToken;

  if (!Authorization) {
    return NextResponse.json({ status: 401 });
  }

  try {
    // Primeiro, busca o ID do usuário baseado no email
    const loginUrl = new URL(`${process.env.BACKEND_URL}/user/email/${email}`);
    const getUserResponse = await fetch(loginUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization,
      },
    });

    if (!getUserResponse.ok) {
      throw new Error("Erro ao buscar os dados do usuário");
    }

    const userData = await getUserResponse.json();
    const userId = userData.id;

    if (!userId) {
      throw new Error("ID do usuário não encontrado");
    }

    const updateUrl = new URL(`${process.env.BACKEND_URL}/user/${userId}`);
    const body = await req.json();
    const { name, surname } = body;

    const patchResponse = await fetch(updateUrl.toString(), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization,
      },
      body: JSON.stringify({ name, surname }),
    });

    if (!patchResponse.ok) {
      throw new Error("Erro ao atualizar os dados do usuário");
    }

    const updatedData = await patchResponse.json();
    return NextResponse.json(updatedData);
  } catch (error) {
    return NextResponse.json({ status: 500 });
  }
});
