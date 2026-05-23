import { Building2, ShieldCheck, Users } from "lucide-react";
import { auth } from "../../../../auth";
import { decodeJWTToken } from "@/utils/decode-jwt";

export default async function SystemAdminDashboardPage() {
  const session = await auth();
  const accessToken = (session as any)?.accessToken as string | undefined;
  const decoded = accessToken ? decodeJWTToken(accessToken) : null;
  const adminName = decoded?.name ?? "Admin";

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 overflow-auto">
      <div>
        <h1 className="text-2xl font-bold">Bem-vindo, {adminName}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Painel de controle global da plataforma Mynute.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Building2 className="h-5 w-5 text-primary" />}
          label="Empresas"
          value="—"
          description="Total de empresas ativas"
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-primary" />}
          label="Usuarios"
          value="—"
          description="Funcionarios registrados"
        />
        <StatCard
          icon={<ShieldCheck className="h-5 w-5 text-primary" />}
          label="Admins"
          value="—"
          description="Administradores do sistema"
        />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold mb-1">Proximas features</h2>
        <p className="text-sm text-muted-foreground">
          Endpoints para listagem de empresas, servicos e usuarios serao adicionados progressivamente.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
