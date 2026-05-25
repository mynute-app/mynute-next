import { NextResponse } from "next/server";
import { auth } from "@/../auth";
import { fetchFromChannelApi } from "@/lib/api/fetch-from-channel-api";

export const GET = auth(async function GET(req) {
  if ((req.auth as any)?.isSystemAdmin !== true) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await fetchFromChannelApi("/admin/proxy");
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
});

export const PUT = auth(async function PUT(req) {
  if ((req.auth as any)?.isSystemAdmin !== true) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const data = await fetchFromChannelApi("/admin/proxy", {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
