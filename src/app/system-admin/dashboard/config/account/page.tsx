import { ShieldCheck } from "lucide-react";
import { auth } from "../../../../../../auth";
import { decodeJWTToken } from "@/utils/decode-jwt";

export default async function SystemAdminAccountPage() {
  const session = await auth();
  const accessToken = (session as any)?.accessToken as string | undefined;
  const decoded = accessToken ? decodeJWTToken(accessToken) : null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 overflow-auto">
      <div>
        <h1 className="text-2xl font-bold">Minha Conta</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configuracoes do administrador da plataforma.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 max-w-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{decoded?.name ?? "—"} {decoded?.surname ?? ""}</p>
            <p className="text-sm text-muted-foreground">{decoded?.email ?? "—"}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Tipo</span>
            <span className="font-medium capitalize">{decoded?.type?.replace("_", " ") ?? "—"}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Telefone</span>
            <span className="font-medium">{decoded?.phone ?? "—"}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Verificado</span>
            <span className="font-medium">{decoded?.verified ? "Sim" : "Nao"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
