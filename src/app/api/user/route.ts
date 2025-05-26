import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const GET = auth(async function GET(req) {
  const email = req.auth?.user.email;
  const token = req.auth?.accessToken;
  if (!token || !email) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const user = await fetchFromBackend(req, `/employee/email/${email}`, token);
    console.log("USer", user);
    return Response.json(user);
  } catch (error) {
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
});

export const PATCH = auth(async function PATCH(req) {
  const email = req.auth?.user.email;
  const token = req.auth?.accessToken;

  if (!token || !email) {
    return NextResponse.json({ status: 401 });
  }

  try {
    // 1. Busca os dados do usuário pelo email
    const user = await fetchFromBackend(req, `/user/email/${email}`, token);

    if (!user?.id) {
      throw new Error("ID do usuário não encontrado");
    }

    const body = await req.json();
    const { name, surname } = body;

    // 2. Atualiza o nome e sobrenome via PATCH
    const updatedUser = await fetchFromBackend(req, `/user/${user.id}`, token, {
      method: "PATCH",
      body: { name, surname },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erro no PATCH /api/user:", error);
    return NextResponse.json({ status: 500, error: "Erro interno" });
  }
});
