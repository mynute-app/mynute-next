import { NextRequest, NextResponse } from "next/server";

// GET /api/company/name/[name]
// Public endpoint to retrieve a company by its name.
// - If [name] path param is provided, uses it directly.
// - Otherwise, derives the company name from the request host (multi-tenant):
//   - Takes the first label of the hostname (e.g. abc-planejados.127.0.0.1.nip.io)
//   - Converts hyphens to spaces => "abc planejados"
export async function GET(
  req: NextRequest,
  { params }: { params: { name?: string } }
) {
  try {
    const providedName = (params?.name ?? "").trim();

    // Derive name from host if not provided
    let companyName = providedName;
    if (!companyName) {
      const hostHeader = req.headers.get("host") || req.nextUrl.host || "";
      // Remove port if present
      const host = hostHeader.split(":")[0];
      const firstLabel = host.split(".")[0];

      if (!firstLabel || firstLabel.toLowerCase() === "localhost") {
        return NextResponse.json(
          {
            error:
              "Nome da empresa não informado e não foi possível derivar do host.",
            details: { host: hostHeader },
          },
          { status: 400 }
        );
      }

      // Convert subdomain-like label to a display name (abc-planejados -> abc planejados)
      companyName = decodeURIComponent(firstLabel).replace(/-/g, " ");
    }

    const backendUrl = `${
      process.env.BACKEND_URL
    }/company/name/${encodeURIComponent(companyName)}`;

    const res = await fetch(backendUrl, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const status = res.status;
      let message = "Empresa não encontrada para esse nome";
      try {
        const data = await res.json();
        message = data?.error || message;
      } catch {
        // ignore body parse errors
      }
      return NextResponse.json({ error: message }, { status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar empresa por nome", details: String(error) },
      { status: 500 }
    );
  }
}
