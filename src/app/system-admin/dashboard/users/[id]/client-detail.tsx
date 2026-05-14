"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useClientCompanies } from "@/hooks/system-admin/use-client-companies";
import { useClientAppointments } from "@/hooks/system-admin/use-client-appointments";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function getAppointmentStatus(
  isFulfilled: boolean,
  isCancelled: boolean,
): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  if (isCancelled) return { label: "Cancelado", variant: "destructive" };
  if (isFulfilled) return { label: "Concluído", variant: "default" };
  return { label: "Agendado", variant: "secondary" };
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
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

function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl p-6 lg:p-8 space-y-6">
      <Skeleton className="h-6 w-32" />
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export function ClientDetailPage({ id }: { id: string }) {
  const {
    companies,
    clientEmail,
    isLoading: companiesLoading,
    hasFetched: companiesHasFetched,
    error: companiesError,
  } = useClientCompanies(id);

  const {
    companies: appointmentCompanies,
    isLoading: appointmentsLoading,
    hasFetched: appointmentsHasFetched,
    error: appointmentsError,
  } = useClientAppointments(id);

  const isLoading = companiesLoading || appointmentsLoading;
  const hasFetched = companiesHasFetched && appointmentsHasFetched;

  const totalAppointments = appointmentCompanies.reduce(
    (acc, c) => acc + c.appointments.length,
    0,
  );

  if (isLoading || !hasFetched) return <DetailSkeleton />;

  if (companiesError && appointmentsError) {
    return (
      <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
          <Link href="/system-admin/dashboard/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Usuários
          </Link>
        </Button>
        <ErrorState
          title="Erro ao carregar cliente"
          description={companiesError}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8 space-y-6 pb-12">

          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/system-admin/dashboard/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Usuários
            </Link>
          </Button>

          {/* Header */}
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">
                  {clientEmail ?? "Carregando..."}
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Detalhes do cliente
                </p>
              </div>
              <Badge
                variant={companiesError ? "secondary" : "outline"}
                className="self-start font-mono text-xs"
              >
                {id}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<Building2 className="h-4 w-4 text-primary" />}
                label="Empresas"
                value={companies.length}
              />
              <StatCard
                icon={<CalendarDays className="h-4 w-4 text-primary" />}
                label="Agendamentos"
                value={totalAppointments}
              />
            </div>
          </div>

          {/* Empresas */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/30">
              <h2 className="font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Empresas Cadastradas
                {clientEmail && (
                  <span className="text-muted-foreground font-normal text-xs">
                    (email: {clientEmail})
                  </span>
                )}
              </h2>
            </div>

            {companiesError ? (
              <div className="p-6">
                <p className="text-sm text-destructive">{companiesError}</p>
              </div>
            ) : companies.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <Building2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                Nenhuma empresa encontrada para este cliente
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Nome</TableHead>
                    <TableHead>Razão Social</TableHead>
                    <TableHead>Setores</TableHead>
                    <TableHead>Subdomínios</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map(company => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        {company.trading_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {company.legal_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {company.sectors && company.sectors.length > 0 ? (
                            company.sectors.map(s => (
                              <Badge
                                key={s.id}
                                variant="secondary"
                                className="text-xs"
                              >
                                {s.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {company.subdomains &&
                          company.subdomains.length > 0 ? (
                            company.subdomains.map(sub => (
                              <Badge
                                key={sub.id}
                                variant="outline"
                                className="text-xs font-mono"
                              >
                                {sub.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Agendamentos */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/30">
              <h2 className="font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Agendamentos
                {totalAppointments > 0 && (
                  <span className="text-muted-foreground font-normal text-xs">
                    ({totalAppointments} no total)
                  </span>
                )}
              </h2>
            </div>

            {appointmentsError ? (
              <div className="p-6">
                <p className="text-sm text-destructive">{appointmentsError}</p>
              </div>
            ) : appointmentCompanies.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <CalendarDays className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                Nenhum agendamento encontrado para este cliente
              </div>
            ) : (
              <div className="divide-y">
                {appointmentCompanies.map((companyGroup, idx) => (
                  <div key={companyGroup.company_id} className="p-6 space-y-3">
                    {appointmentCompanies.length > 1 && (
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {idx + 1}. {companyGroup.company_name}
                      </p>
                    )}
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead>Serviço</TableHead>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Profissional</TableHead>
                          <TableHead>Unidade</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companyGroup.appointments.map(apt => {
                          const status = getAppointmentStatus(
                            apt.is_fulfilled,
                            apt.is_cancelled,
                          );
                          return (
                            <TableRow key={apt.id}>
                              <TableCell className="font-medium">
                                {apt.service_name || "Serviço não informado"}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {formatDateTime(apt.start_time)}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {apt.employee_name
                                  ? `${apt.employee_name} ${apt.employee_surname ?? ""}`
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {apt.branch_name || "—"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={status.variant}
                                  className="text-xs"
                                >
                                  {status.variant === "default" && (
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                  )}
                                  {status.variant === "destructive" && (
                                    <XCircle className="mr-1 h-3 w-3" />
                                  )}
                                  {status.label}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
