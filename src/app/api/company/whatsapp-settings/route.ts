import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth } from "@/../auth";
import {
  fetchFromBackend,
  BackendUnauthorizedError,
} from "@/lib/api/fetch-from-backend";

export const GET = auth(async function GET(req) {
  const token = (req.auth as any)?.accessToken as string | undefined;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await fetchFromBackend(req as unknown as NextRequest, "/company/whatsapp-settings", token);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof BackendUnauthorizedError) {
      return NextResponse.json({ error: "Token invalido ou expirado" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});

export const PATCH = auth(async function PATCH(req) {
  const token = (req.auth as any)?.accessToken as string | undefined;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const data = await fetchFromBackend(
      req as unknown as NextRequest,
      "/company/whatsapp-settings",
      token,
      { method: "PATCH", body: JSON.stringify(body) },
    );
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof BackendUnauthorizedError) {
      return NextResponse.json({ error: "Token invalido ou expirado" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
