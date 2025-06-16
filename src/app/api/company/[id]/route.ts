import { NextRequest, NextResponse } from "next/server";
import { getCompanyIdFromSubdomain } from "@/utils/subdomain";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Use the provided ID from params, or try to get it from subdomain
  let { id } = params;

  // If the ID is "current", try to get the company ID from the subdomain
  if (id === "current") {
    const host = request.headers.get("host");
    const subdomainId = await getCompanyIdFromSubdomain(host || "");

    if (!subdomainId) {
      return NextResponse.json(
        { error: "No company ID found in subdomain" },
        { status: 404 }
      );
    }

    id = subdomainId;
  }
  console.log("📡 Fetching company data for ID:", id);
  const company = await fetch(`${process.env.BACKEND_URL}/company/${id}`).then(
    res => res.json()
  );

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json(company);
}
