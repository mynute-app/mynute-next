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
    const providedName = decodeURIComponent((params?.name ?? "").trim());

    // Build candidates: from param and from host, both spaced and hyphenated variants
    const hostHeader = req.headers.get("host") || req.nextUrl.host || "";
    const host = hostHeader.split(":")[0];
    const firstLabel = host.split(".")[0];

    const fromHostLabel =
      firstLabel && firstLabel.toLowerCase() !== "localhost"
        ? decodeURIComponent(firstLabel)
        : "";

    const spaced = (s: string) => s.replace(/-/g, " ");
    const hyphen = (s: string) => s.replace(/\s+/g, "-");
    const capitalize = (s: string) =>
      s
        .split(/[\s-]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("-");
    const capitalizeSpaced = (s: string) =>
      s
        .split(/[\s-]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");

    const candidatesRaw = [
      providedName,
      providedName ? spaced(providedName) : "",
      providedName ? hyphen(providedName) : "",
      providedName ? capitalize(providedName) : "",
      providedName ? capitalizeSpaced(providedName) : "",
      fromHostLabel,
      fromHostLabel ? spaced(fromHostLabel) : "",
      fromHostLabel ? hyphen(fromHostLabel) : "",
      fromHostLabel ? capitalize(fromHostLabel) : "",
      fromHostLabel ? capitalizeSpaced(fromHostLabel) : "",
    ];

    const candidates = Array.from(
      new Set(
        candidatesRaw
          .map(c => c?.trim())
          .filter((c): c is string => !!c && c.length > 0)
      )
    );

    if (candidates.length === 0) {
      return NextResponse.json(
        {
          error:
            "Nome da empresa não informado e não foi possível derivar do host.",
          details: { host: hostHeader },
        },
        { status: 400 }
      );
    }

    // Try candidates sequentially until one succeeds
    for (const candidate of candidates) {
      const url = `${process.env.BACKEND_URL}/company/name/${encodeURIComponent(
        candidate
      )}`;
      const attempt = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (attempt.ok) {
        const data = await attempt.json();
        return NextResponse.json(data);
      }
      // For non-404 errors, bubble up immediately
      if (attempt.status !== 404) {
        let message = `Erro ao buscar empresa (status ${attempt.status})`;
        try {
          const payload = await attempt.json();
          message = payload?.error || message;
        } catch {}
        return NextResponse.json(
          { error: message },
          { status: attempt.status }
        );
      }
    }

    // If all candidates 404'd
    return NextResponse.json(
      {
        error: "Empresa não encontrada para os candidatos de nome informados.",
        candidates,
      },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar empresa por nome", details: String(error) },
      { status: 500 }
    );
  }
}
