"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  GitBranch,
  Layers,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useAdminCompany } from "@/hooks/system-admin/use-admin-company";
import type { AdminCompanyBranch, AdminCompanyEmployee, AdminCompanyService } from "@/types/system-admin-company";

type Tab = "branches" | "employees" | "services";

function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function formatCurrency(value?: number): string {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100);
}

function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl p-6 lg:p-8 space-y-6">
      <Skeleton className="h-6 w-32" />
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

const TAB_LABELS: Record<Tab, string> = {
  branches: "Filiais",
  employees: "Funcionários",
  services: "Serviços",
};

export function CompanyDetailPage({ id }: { id: string }) {
  const { company, isLoading, hasFetched, error, refetch } = useAdminCompany(id);
  const [activeTab, setActiveTab] = useState<Tab>("branches");

  if (isLoading || !hasFetched) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
        <ErrorState title="Erro ao carregar empresa" description={error} onRetry={refetch} />
      </div>
    );
  }

  if (!company) return null;

  const branches = company.branches ?? [];
  const employees = company.employees ?? [];
  const services = company.services ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8 space-y-6 pb-12">

          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/system-admin/dashboard/companies">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Empresas
            </Link>
          </Button>

          {/* Header */}
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">{company.trading_name}</h1>
                <p className="text-muted-foreground">{company.legal_name}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {company.subdomains.map(sub => (
                  <Badge key={sub.id} variant="outline" className="font-mono text-xs">
                    {sub.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">CNPJ</p>
                <p className="font-mono font-medium">{formatCNPJ(company.tax_id)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Schema</p>
                <p className="font-mono text-xs">{company.schema_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Setores</p>
                <div className="flex flex-wrap gap-1">
                  {company.sectors.length > 0 ? (
                    company.sectors.map(s => (
                      <Badge key={s.id} variant="secondary" className="text-xs">{s.name}</Badge>
                    ))
                  ) : <span className="text-muted-foreground">—</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <StatCard
                icon={<GitBranch className="h-4 w-4 text-primary" />}
                label="Filiais"
                value={branches.length}
              />
              <StatCard
                icon={<Users className="h-4 w-4 text-primary" />}
                label="Funcionários"
                value={employees.length}
              />
              <StatCard
                icon={<Wrench className="h-4 w-4 text-primary" />}
                label="Serviços"
                value={services.length}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="space-y-4">
            <div className="flex gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
              {(["branches", "employees", "services"] as Tab[]).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                    activeTab === tab
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {activeTab === "branches" && (
              <BranchesTable branches={branches} />
            )}
            {activeTab === "employees" && (
              <EmployeesTable employees={employees} />
            )}
            {activeTab === "services" && (
              <ServicesTable services={services} />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function BranchesTable({ branches }: { branches: AdminCompanyBranch[] }) {
  if (branches.length === 0) {
    return <EmptySection icon={<Building2 className="h-8 w-8" />} message="Nenhuma filial cadastrada" />;
  }
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Nome</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.map(branch => (
            <TableRow key={branch.id}>
              <TableCell className="font-medium">{branch.name}</TableCell>
              <TableCell className="text-muted-foreground">{branch.city || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{branch.state || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{branch.phone || "—"}</TableCell>
              <TableCell>
                <Badge variant={branch.is_active !== false ? "secondary" : "outline"} className="text-xs">
                  {branch.is_active !== false ? "Ativa" : "Inativa"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EmployeesTable({ employees }: { employees: AdminCompanyEmployee[] }) {
  if (employees.length === 0) {
    return <EmptySection icon={<Users className="h-8 w-8" />} message="Nenhum funcionário cadastrado" />;
  }
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Verificado</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map(emp => (
            <TableRow key={emp.id}>
              <TableCell className="font-medium">{emp.name} {emp.surname}</TableCell>
              <TableCell className="text-muted-foreground">{emp.email}</TableCell>
              <TableCell className="text-muted-foreground">{emp.role || emp.permission || "—"}</TableCell>
              <TableCell>
                <Badge variant={emp.verified ? "secondary" : "outline"} className="text-xs">
                  {emp.verified ? "Sim" : "Não"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={emp.is_active !== false ? "secondary" : "outline"} className="text-xs">
                  {emp.is_active !== false ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ServicesTable({ services }: { services: AdminCompanyService[] }) {
  if (services.length === 0) {
    return <EmptySection icon={<Wrench className="h-8 w-8" />} message="Nenhum serviço cadastrado" />;
  }
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Nome</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Duração</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map(service => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell className="text-muted-foreground">{formatCurrency(service.price)}</TableCell>
              <TableCell className="text-muted-foreground">
                {service.duration ? `${service.duration} min` : "—"}
              </TableCell>
              <TableCell>
                <Badge variant={service.is_active !== false ? "secondary" : "outline"} className="text-xs">
                  {service.is_active !== false ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EmptySection({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="rounded-xl border bg-card py-12 text-center">
      <div className="flex justify-center mb-3 text-muted-foreground/40">{icon}</div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
