"use client";

import { Building2, ShieldCheck, Users } from "lucide-react";
import { useAdminCompanies } from "@/hooks/system-admin/use-admin-companies";
import { useAdminClients } from "@/hooks/system-admin/use-admin-clients";

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

export function DashboardStatsSection() {
  const { total: totalCompanies, isLoading: loadingCompanies, error: companiesError } = useAdminCompanies({ pageSize: 1 });
  const { total: totalClients, isLoading: loadingClients, error: clientsError } = useAdminClients({ pageSize: 1 });

  const companiesValue = loadingCompanies ? "..." : companiesError ? "Erro" : String(totalCompanies);
  const clientsValue = loadingClients ? "..." : clientsError ? "Erro" : String(totalClients);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        icon={<Building2 className="h-5 w-5 text-primary" />}
        label="Empresas"
        value={companiesValue}
        description="Total de empresas ativas"
      />
      <StatCard
        icon={<Users className="h-5 w-5 text-primary" />}
        label="Usuarios"
        value={clientsValue}
        description="Clientes registrados"
      />
      <StatCard
        icon={<ShieldCheck className="h-5 w-5 text-primary" />}
        label="Admins"
        value="—"
        description="Administradores do sistema"
      />
    </div>
  );
}
