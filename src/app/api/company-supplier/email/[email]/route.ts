import { auth } from "../../../../../../auth";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

// 20 lookups/minute per IP — prevents email enumeration attacks
const checkLimit = rateLimit({ maxRequests: 20, windowMs: 60_000 });

export const GET = auth(async function GET(req) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = checkLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { message: "Muitas tentativas. Tente novamente em breve." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const authData = getAuthDataFromRequest(req);

  if (!authData.isValid) {
    return NextResponse.json(
      { message: authData.error || "Token inválido" },
      { status: 401 }
    );
  }

  // auth() wrapper não repassa params nativos do Next.js — extração manual via URL
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  const rawSegment = segments[segments.length - 1] ?? "";

  // M3: prevenir payloads excessivamente longos antes de qualquer processamento
  if (rawSegment.length > 254) {
    return NextResponse.json({ message: "E-mail inválido." }, { status: 400 });
  }

  // I10: decodeURIComponent pode lançar URIError para percent-encoding inválido (ex: %GG)
  let email: string;
  try {
    email = decodeURIComponent(rawSegment).toLowerCase();
  } catch {
    return NextResponse.json({ message: "E-mail inválido." }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ message: "E-mail não informado." }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ message: "E-mail inválido." }, { status: 400 });
  }

  try {
    const supplier = await fetchFromBackend(
      req,
      `/company-supplier/email/${encodeURIComponent(email)}`,
      authData.token!,
      { method: "GET" }
    );
    return NextResponse.json(supplier);
  } catch {
    return NextResponse.json(
      { message: "Erro interno ao buscar fornecedor por e-mail." },
      { status: 500 }
    );
  }
});
