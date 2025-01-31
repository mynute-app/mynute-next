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
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ status: 500 });
  }
});
