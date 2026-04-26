"use client";

import { useEffect, useState } from "react";
import { CalendarOff, Plus, Trash2, Building2, UserCog, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetCompany } from "@/hooks/get-company";
import { useBranchBlockedDates } from "@/hooks/branch/use-branch-blocked-dates";
import { useEmployeeBlockedDates } from "@/hooks/employee/use-employee-blocked-dates";
import { useServiceBlockedDates } from "@/hooks/services/use-service-blocked-dates";

const formatDateRange = (start: string, end: string) => {
  const fmt = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  };
  return start === end ? fmt(start) : `${fmt(start)} até ${fmt(end)}`;
};

const today = () => new Date().toISOString().split("T")[0];

type DeleteTarget = { id: string; label: string };

function BlockedDateRow({
  id,
  startDate,
  endDate,
  reason,
  onDelete,
}: {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">
          {formatDateRange(startDate, endDate)}
        </span>
        {reason && (
          <span className="text-xs text-muted-foreground">{reason}</span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function AddBlockedDateForm({
  creating,
  onSubmit,
}: {
  creating: boolean;
  onSubmit: (start: string, end: string, reason: string) => void;
}) {
  const [start, setStart] = useState(today());
  const [end, setEnd] = useState(today());
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(start, end, reason);
    setReason("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Data início</Label>
          <Input
            type="date"
            value={start}
            min={today()}
            onChange={e => {
              setStart(e.target.value);
              if (e.target.value > end) setEnd(e.target.value);
            }}
            required
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Data fim</Label>
          <Input
            type="date"
            value={end}
            min={start}
            onChange={e => setEnd(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          Motivo (opcional)
        </Label>
        <Input
          placeholder="Ex: Feriado, Férias, Reforma..."
          value={reason}
          onChange={e => setReason(e.target.value)}
          maxLength={255}
        />
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={creating}
        className="btn-gradient w-full sm:w-auto"
      >
        <Plus className="mr-2 h-4 w-4" />
        {creating ? "Salvando..." : "Adicionar bloqueio"}
      </Button>
    </form>
  );
}

function BranchSection() {
  const { company } = useGetCompany();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const branches = company?.branches ?? [];

  const {
    blockedDates,
    loading,
    creating,
    fetchBlockedDates,
    createBlockedDate,
    deleteBlockedDate,
  } = useBranchBlockedDates(selectedBranchId);

  useEffect(() => {
    if (branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(String(branches[0].id));
    }
  }, [branches, selectedBranchId]);

  useEffect(() => {
    if (selectedBranchId) {
      void fetchBlockedDates();
    }
  }, [selectedBranchId, fetchBlockedDates]);

  const handleCreate = async (start: string, end: string, reason: string) => {
    await createBlockedDate({ start_date: start, end_date: end, reason });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBlockedDate(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-base">Filiais</CardTitle>
              <CardDescription>
                Bloqueie dias em que a filial não atenderá nenhum cliente.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {branches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma filial encontrada.
            </p>
          ) : (
            <>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Filial</Label>
                <Select
                  value={selectedBranchId ?? ""}
                  onValueChange={setSelectedBranchId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a filial" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <AddBlockedDateForm creating={creating} onSubmit={handleCreate} />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Datas bloqueadas
                  </span>
                  <Badge variant="secondary">{blockedDates.length}</Badge>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : blockedDates.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-6 text-center">
                    <CalendarOff className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma data bloqueada
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blockedDates.map(d => (
                      <BlockedDateRow
                        key={d.id}
                        id={d.id}
                        startDate={d.start_date}
                        endDate={d.end_date}
                        reason={d.reason}
                        onDelete={id =>
                          setDeleteTarget({
                            id,
                            label: formatDateRange(d.start_date, d.end_date),
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover bloqueio</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover o bloqueio de{" "}
              <strong>{deleteTarget?.label}</strong>? Os horários voltarão a
              aparecer normalmente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function EmployeeSection() {
  const { company } = useGetCompany();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const employees = company?.employees ?? [];

  const {
    blockedDates,
    loading,
    creating,
    fetchBlockedDates,
    createBlockedDate,
    deleteBlockedDate,
  } = useEmployeeBlockedDates(selectedEmployeeId);

  useEffect(() => {
    if (employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(String(employees[0].id));
    }
  }, [employees, selectedEmployeeId]);

  useEffect(() => {
    if (selectedEmployeeId) {
      void fetchBlockedDates();
    }
  }, [selectedEmployeeId, fetchBlockedDates]);

  const handleCreate = async (start: string, end: string, reason: string) => {
    await createBlockedDate({ start_date: start, end_date: end, reason });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBlockedDate(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <UserCog className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-base">Funcionários</CardTitle>
              <CardDescription>
                Bloqueie dias em que um funcionário não estará disponível
                (férias, folga etc).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {employees.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum funcionário encontrado.
            </p>
          ) : (
            <>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Funcionário
                </Label>
                <Select
                  value={selectedEmployeeId ?? ""}
                  onValueChange={setSelectedEmployeeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.name} {e.surname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <AddBlockedDateForm creating={creating} onSubmit={handleCreate} />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Datas bloqueadas
                  </span>
                  <Badge variant="secondary">{blockedDates.length}</Badge>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : blockedDates.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-6 text-center">
                    <CalendarOff className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma data bloqueada
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blockedDates.map(d => (
                      <BlockedDateRow
                        key={d.id}
                        id={d.id}
                        startDate={d.start_date}
                        endDate={d.end_date}
                        reason={d.reason}
                        onDelete={id =>
                          setDeleteTarget({
                            id,
                            label: formatDateRange(d.start_date, d.end_date),
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover bloqueio</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover o bloqueio de{" "}
              <strong>{deleteTarget?.label}</strong>? O funcionário voltará a
              ter horários disponíveis nesse período.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ServiceSection() {
  const { company } = useGetCompany();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const services = company?.services ?? [];

  const {
    blockedDates,
    loading,
    creating,
    fetchBlockedDates,
    createBlockedDate,
    deleteBlockedDate,
  } = useServiceBlockedDates(selectedServiceId);

  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(String(services[0].id));
    }
  }, [services, selectedServiceId]);

  useEffect(() => {
    if (selectedServiceId) {
      void fetchBlockedDates();
    }
  }, [selectedServiceId, fetchBlockedDates]);

  const handleCreate = async (start: string, end: string, reason: string) => {
    await createBlockedDate({ start_date: start, end_date: end, reason });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBlockedDate(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Scissors className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-base">Serviços</CardTitle>
              <CardDescription>
                Bloqueie dias em que um serviço específico não será oferecido.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum serviço encontrado.
            </p>
          ) : (
            <>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Serviço</Label>
                <Select
                  value={selectedServiceId ?? ""}
                  onValueChange={setSelectedServiceId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <AddBlockedDateForm creating={creating} onSubmit={handleCreate} />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Datas bloqueadas
                  </span>
                  <Badge variant="secondary">{blockedDates.length}</Badge>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : blockedDates.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-6 text-center">
                    <CalendarOff className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma data bloqueada
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blockedDates.map(d => (
                      <BlockedDateRow
                        key={d.id}
                        id={d.id}
                        startDate={d.start_date}
                        endDate={d.end_date}
                        reason={d.reason}
                        onDelete={id =>
                          setDeleteTarget({
                            id,
                            label: formatDateRange(d.start_date, d.end_date),
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover bloqueio</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover o bloqueio de{" "}
              <strong>{deleteTarget?.label}</strong>? O serviço voltará a
              aparecer disponível nesse período.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function BlockedDates() {
  return (
    <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
          <div className="space-y-8 pt-12 lg:pt-0">
            <div className="page-header">
              <h1 className="page-title">Datas Bloqueadas</h1>
              <p className="page-description">
                Gerencie os períodos em que filiais, funcionários ou serviços
                não estarão disponíveis para novos agendamentos.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <BranchSection />
              <EmployeeSection />
              <ServiceSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
