import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

export const GET = auth(async function GET(req) {
  const email = req.auth?.user.email;
  const Authorization = req.auth?.accessToken;

  if (!Authorization) {
    return NextResponse.json({ status: 401 });
  }

  const loginUrl = new URL(`${process.env.BACKEND_URL}/user/email/${email}`);

  try {
    const response = await fetch(loginUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar os dados do usuário");
    }

    const data = await response.json();
    console.log('QUERO MEU ID')
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ status: 500 });
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
