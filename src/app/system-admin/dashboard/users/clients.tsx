"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  CalendarDays,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { DataPagination } from "@/components/ui/data-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminClients } from "@/hooks/system-admin/use-admin-clients";
import { useClientCompanies } from "@/hooks/system-admin/use-client-companies";
import { useClientAppointments } from "@/hooks/system-admin/use-client-appointments";
import type { AdminClient } from "@/types/system-admin-client";

function TableSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-4 border-b">
        <Skeleton className="h-5 w-32" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 border-b last:border-0"
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

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

interface ClientDetailModalProps {
  client: AdminClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ClientDetailModal({
  client,
  open,
  onOpenChange,
}: ClientDetailModalProps) {
  const { companies, clientEmail, isLoading, error } = useClientCompanies(
    open && client ? client.id : null,
  );
  const {
    companies: appointmentCompanies,
    isLoading: appointmentsLoading,
    error: appointmentsError,
  } = useClientAppointments(open && client ? client.id : null);

  const totalAppointments = appointmentCompanies.reduce(
    (acc, c) => acc + c.appointments.length,
    0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
        </DialogHeader>

        {client && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-base">
                    {client.name} {client.surname}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {client.email}
                  </p>
                </div>
                <Badge
                  variant={client.verified ? "default" : "secondary"}
                  className="shrink-0"
                >
                  {client.verified ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Verificado
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-3 w-3" /> Não verificado
                    </>
                  )}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                <div>
                  <span className="text-muted-foreground">Telefone</span>
                  <p className="font-medium">{client.phone || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cadastrado em</span>
                  <p className="font-medium">{formatDate(client.created_at)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Empresas Cadastradas
                {clientEmail && (
                  <span className="text-muted-foreground font-normal text-xs">
                    (email: {clientEmail})
                  </span>
                )}
              </h3>

              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : companies.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <Building2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  Nenhuma empresa encontrada para este cliente
                </div>
              ) : (
                <div className="space-y-2">
                  {companies.map(company => (
                    <div
                      key={company.id}
                      className="rounded-lg border bg-card p-3 space-y-1"
                    >
                      <p className="font-medium text-sm">
                        {company.trading_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {company.legal_name}
                      </p>
                      {company.subdomains && company.subdomains.length > 0 && (
                        <div className="flex gap-1 flex-wrap pt-0.5">
                          {company.subdomains.map(sub => (
                            <Badge
                              key={sub.id}
                              variant="outline"
                              className="text-xs font-mono"
                            >
                              {sub.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Agendamentos
                {totalAppointments > 0 && (
                  <span className="text-muted-foreground font-normal text-xs">
                    ({totalAppointments} no total)
                  </span>
                )}
              </h3>

              {appointmentsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : appointmentsError ? (
                <p className="text-sm text-destructive">{appointmentsError}</p>
              ) : appointmentCompanies.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <CalendarDays className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  Nenhum agendamento encontrado para este cliente
                </div>
              ) : (
                <div className="space-y-4">
                  {appointmentCompanies.map((companyGroup, idx) => (
                    <div key={companyGroup.company_id}>
                      {appointmentCompanies.length > 1 && (
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                          {idx + 1}. {companyGroup.company_name}
                        </p>
                      )}
                      <div className="space-y-2">
                        {companyGroup.appointments.map(apt => {
                          const status = getAppointmentStatus(
                            apt.is_fulfilled,
                            apt.is_cancelled,
                          );
                          return (
                            <div
                              key={apt.id}
                              className="rounded-lg border bg-card p-3 space-y-1"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium">
                                    {apt.service_name ||
                                      "Serviço não informado"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDateTime(apt.start_time)}
                                  </p>
                                </div>
                                <Badge
                                  variant={status.variant}
                                  className="shrink-0 text-xs"
                                >
                                  {status.label}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                                {apt.employee_name && (
                                  <span>
                                    Profissional: {apt.employee_name}{" "}
                                    {apt.employee_surname}
                                  </span>
                                )}
                                {apt.branch_name && (
                                  <span>Unidade: {apt.branch_name}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, error, refetch, hasFetched, total } =
    useAdminClients({
      page,
      pageSize,
    });

  useEffect(() => {
    if (data?.clients) {
      setClients(data.clients);
    }
  }, [data]);

  const totalPages = useMemo(() => {
    if (!total) return 1;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  useEffect(() => {
    if (!hasFetched) return;
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages, hasFetched]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter(
      c =>
        c.name.toLowerCase().includes(term) ||
        c.surname.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term),
    );
  }, [clients, searchTerm]);

  function handleRowClick(client: AdminClient) {
    setSelectedClient(client);
    setModalOpen(true);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
          <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Usuários (Clientes)</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Todos os clientes cadastrados na plataforma
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {isLoading || !hasFetched ? (
              <TableSkeleton />
            ) : error ? (
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <ErrorState
                  title="Erro ao carregar clientes"
                  description={error}
                  onRetry={refetch}
                />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                <h3 className="text-lg font-medium mb-1">
                  Nenhum cliente encontrado
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? "Tente buscar com outros termos"
                    : "Nenhum cliente cadastrado ainda"}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastrado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(client => (
                      <TableRow
                        key={client.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(client)}
                      >
                        <TableCell className="font-medium">
                          {client.name} {client.surname}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {client.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {client.phone || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={client.verified ? "default" : "secondary"}
                          >
                            {client.verified ? (
                              <>
                                <CheckCircle2 className="mr-1 h-3 w-3" />{" "}
                                Verificado
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-1 h-3 w-3" /> Não
                                verificado
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(client.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!isLoading && hasFetched && !error && total > 0 && (
              <DataPagination
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={value => {
                  setPageSize(value);
                  setPage(1);
                }}
              />
            )}
          </div>
        </div>
      </div>

      <ClientDetailModal
        client={selectedClient}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
