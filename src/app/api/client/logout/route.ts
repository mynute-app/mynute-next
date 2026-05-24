import { NextResponse } from "next/server";

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("client-auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
