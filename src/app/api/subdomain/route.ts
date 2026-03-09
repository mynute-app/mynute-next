import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error: "Deprecated endpoint. Use tenant slug in path: /{tenant}/...",
    },
    { status: 410 },
  );
}
