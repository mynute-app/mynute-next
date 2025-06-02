import { NextRequest, NextResponse } from "next/server";
import { getCompanyIdFromSubdomain } from "@/utils/subdomain";

export async function GET(request: NextRequest) {
  const host = request.headers.get("host");
  const companyId = await getCompanyIdFromSubdomain(host || "");

  if (!companyId) {
    return NextResponse.json(
      { error: "No company ID found in subdomain" },
      { status: 404 }
    );
  }

  return NextResponse.json({ companyId });
}
