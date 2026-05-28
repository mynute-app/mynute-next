import { NextResponse } from "next/server";
import { auth } from "@/../auth";
import { fetchFromChannelApi } from "@/lib/api/fetch-from-channel-api";

export const POST = auth(async function POST(req) {
  if ((req.auth as any)?.isSystemAdmin !== true) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await fetchFromChannelApi("/admin/whatsapp/disconnect", {
      method: "POST",
    });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
