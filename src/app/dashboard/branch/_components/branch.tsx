"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Clock,
  Edit,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { DataPagination } from "@/components/ui/data-pagination";
import { useToast } from "@/hooks/use-toast";
import { useBranchApi } from "@/hooks/branch/use-branch-api";
import type { Branch } from "../../../../../types/company";
import { AddAddressDialog } from "./add-address-dialog";
import { BranchInfoDialog } from "./branch-info-dialog";
import { BranchScheduleDialog } from "./branch-schedule-dialog";

type BranchCardProps = {
  branch: Branch;
  servicesCount: number | null;
  employeesCount: number | null;
  scheduleSummary: string | null;
  hasBranchStatus: boolean;
  isUpdatingStatus: boolean;
  onEdit: (branch: Branch) => void;
  onViewSchedule: (branch: Branch) => void;
  onManageServices: (branch: Branch) => void;
  onManageEmployees: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
  onToggleStatus: (branch: Branch, nextValue: boolean) => void;
};

type BranchStatCardProps = {
  icon: LucideIcon;
  label: string;
  value: number | string;
  iconClassName: string;
  iconBgClassName: string;
};

type BranchStatus = {
  is_active?: boolean;
  active?: boolean;
};

const getBranchActiveStatus = (branch: Branch): boolean | undefined => {
  const status = branch as BranchStatus;
  if (typeof status.is_active === "boolean") return status.is_active;
  if (typeof status.active === "boolean") return status.active;
  return undefined;
};

const getBranchServicesCount = (branch: Branch): number | null => {
  if (typeof branch.services_count === "number") return branch.services_count;
  if (Array.isArray(branch.services)) return branch.services.length;
  return null;
};

const getBranchEmployeesCount = (branch: Branch): number | null => {
  if (typeof branch.employees_count === "number") return branch.employees_count;
  if (Array.isArray(branch.employees)) return branch.employees.length;
  return null;
};

const formatServicesLabel = (count: number | null) => {
  if (count === null) return "Serviços";
  return `${count} ${count === 1 ? "Serviço" : "Serviços"}`;
};

const formatEmployeesLabel = (count: number | null) => {
  if (count === null) return "Equipe";
  return `${count} ${count === 1 ? "Profissional" : "Profissionais"}`;
};

const weekDayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const BranchPageShell = ({ children }: { children: React.ReactNode }) => (
  <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
    <div className="custom-scrollbar flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">{children}</div>
    </div>
  </div>
);

const BranchStatCard = ({
  icon: Icon,
  label,
  value,
  iconClassName,
  iconBgClassName,
}: BranchStatCardProps) => (
  <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgClassName}`}
      >
        <Icon className={`h-5 w-5 ${iconClassName}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  </div>
);

const formatBranchAddress = (branch: Branch) => {
  const addressParts = [branch.street, branch.number, branch.neighborhood]
    .filter(Boolean)
    .join(", ");
  const locationParts = [branch.city, branch.state].filter(Boolean).join(" - ");
  const pieces = [addressParts, locationParts].filter(Boolean);
  return pieces.length ? pieces.join(" - ") : "Endereço não informado";
};

const extractTime = (value?: string) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toTimeString().slice(0, 5);
    }
  } catch {
    return value.includes(":") ? value.slice(0, 5) : "";
  }
  return value.includes(":") ? value.slice(0, 5) : "";
};

const getScheduleSummary = (workSchedule?: Branch["work_schedule"]) => {
  if (!Array.isArray(workSchedule) || workSchedule.length === 0) return null;

  const weekdays = new Set<number>();
  let timeLabel = "";

  workSchedule.forEach(range => {
    const weekdayValue = Number((range as { weekday?: number }).weekday);
    if (Number.isFinite(weekdayValue)) {
      weekdays.add(weekdayValue);
    }

    if (!timeLabel) {
      const start = extractTime(
        (range as { start_time?: string; start?: string }).start_time ||
          (range as { start_time?: string; start?: string }).start,
      );
      const end = extractTime(
        (range as { end_time?: string; end?: string }).end_time ||
          (range as { end_time?: string; end?: string }).end,
      );
      if (start && end) {
        timeLabel = `${start} - ${end}`;
      }
    }
  });

  const orderedDays = Array.from(weekdays).sort((a, b) => a - b);
  if (!orderedDays.length) return null;

  const daysLabel =
    orderedDays.length === 7
      ? "Todos os dias"
      : orderedDays
          .map(day => weekDayLabels[day] || "")
          .filter(Boolean)
          .join(", ");

  return timeLabel ? `${daysLabel} - ${timeLabel}` : daysLabel;
};

const getBranchScheduleSummary = (branch: Branch): string | null => {
  if (
    typeof branch.work_schedule_summary === "string" &&
    branch.work_schedule_summary.trim().length > 0
  ) {
    return branch.work_schedule_summary;
  }

  return getScheduleSummary(branch.work_schedule);
};

const BranchCard = ({
  branch,
  servicesCount,
  employeesCount,
  scheduleSummary,
  hasBranchStatus,
  isUpdatingStatus,
  onEdit,
  onViewSchedule,
  onManageServices,
  onManageEmployees,
  onDelete,
  onToggleStatus,
}: BranchCardProps) => {
  const branchStatus = getBranchActiveStatus(branch);
  const showStatusBadge = hasBranchStatus && typeof branchStatus === "boolean";
  const handleMenuAction = (action: () => void) => () => {
    setTimeout(action, 0);
  };

  return (
    <div className="card-hover overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative h-24 bg-gradient-to-br from-primary/20 to-primary/5">
        {showStatusBadge && (
          <div className="absolute right-3 top-3">
            <Badge variant={branchStatus ? "default" : "secondary"}>
              {branchStatus ? "Ativa" : "Inativa"}
            </Badge>
          </div>
        )}
        <div className="absolute -bottom-8 left-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border-4 border-card bg-card shadow-lg">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-10">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">
            {branch.name}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-1 h-8 w-8"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onSelect={handleMenuAction(() => onEdit(branch))}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar filial
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleMenuAction(() => onViewSchedule(branch))}
              >
                <Clock className="mr-2 h-4 w-4" />
                Horários
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleMenuAction(() => onManageServices(branch))}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Gerenciar serviços
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleMenuAction(() => onManageEmployees(branch))}
              >
                <Users className="mr-2 h-4 w-4" />
                Gerenciar equipe
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleMenuAction(() => onDelete(branch))}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2.5 text-sm">
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-2">{formatBranchAddress(branch)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{scheduleSummary || "Horários não configurados"}</span>
          </div>
          {/* TODO: phone/email not available on branch payload yet. */}
        </div>

        <div className="mt-4 flex gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onManageServices(branch)}
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            {formatServicesLabel(servicesCount)}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onManageEmployees(branch)}
          >
            <Users className="mr-1.5 h-4 w-4" />
            {formatEmployeesLabel(employeesCount)}
          </Button>
        </div>

        {showStatusBadge && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-foreground">
                Filial ativa
              </p>
              <p className="text-xs text-muted-foreground">
                Controle a disponibilidade desta unidade.
              </p>
            </div>
            <Switch
              checked={branchStatus}
              onCheckedChange={checked => onToggleStatus(branch, checked)}
              disabled={isUpdatingStatus}
              aria-label={`Alterar status da filial ${branch.name}`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const DEFAULT_PAGE_SIZE = 10;

export default function BranchManager() {
  const { toast } = useToast();
  const { fetchBranches, fetchBranchById } = useBranchApi();
  const router = useRouter();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBranches, setTotalBranches] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [updatingBranchId, setUpdatingBranchId] = useState<Branch["id"] | null>(
    null,
  );

  const loadBranches = useCallback(
    async (page: number, force = false) => {
      setIsLoading(true);
      const branchList = await fetchBranches(page, DEFAULT_PAGE_SIZE, force);

      if (branchList) {
        setBranches(branchList.branches);
        setTotalBranches(branchList.total);
        setCurrentPage(branchList.page);
      }

      setIsLoading(false);
    },
    [fetchBranches],
  );

  useEffect(() => {
    void loadBranches(currentPage);
  }, [currentPage, loadBranches]);

  const filteredBranches = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return branches;

    return branches.filter(branch => {
      const haystack = [
        branch.name,
        branch.street,
        branch.city,
        branch.state,
        branch.neighborhood,
        branch.zip_code,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedTerm);
    });
  }, [branches, searchTerm]);

  const branchStats = useMemo(() => {
    const employeesValues = branches
      .map(getBranchEmployeesCount)
      .filter((value): value is number => value !== null);
    const servicesValues = branches
      .map(getBranchServicesCount)
      .filter((value): value is number => value !== null);

    const totalEmployees = employeesValues.length
      ? employeesValues.reduce((sum, value) => sum + value, 0)
      : null;
    const totalServices = servicesValues.length
      ? servicesValues.reduce((sum, value) => sum + value, 0)
      : null;

    return {
      total: totalBranches,
      totalEmployees,
      totalServices,
    };
  }, [branches, totalBranches]);

  const hasBranchStatus = useMemo(
    () =>
      branches.some(
        branch => typeof getBranchActiveStatus(branch) === "boolean",
      ),
    [branches],
  );

  const handleAddBranch = useCallback(
    async (_newBranch: Branch) => {
      setCurrentPage(1);
      await loadBranches(1, true);
    },
    [loadBranches],
  );

  const handleDeleteRequest = useCallback((branch: Branch) => {
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!branchToDelete) return;

    try {
      const response = await fetch(`/api/branch/${branchToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir filial");
      }

      const targetPage =
        branches.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;

      if (activeBranch?.id === branchToDelete.id) {
        setInfoDialogOpen(false);
        setScheduleDialogOpen(false);
        setActiveBranch(null);
      }

      setDeleteDialogOpen(false);
      setBranchToDelete(null);
      await loadBranches(targetPage, true);

      toast({
        title: "Filial excluída!",
        description: "A filial foi removida com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a filial.",
        variant: "destructive",
      });
    }
  }, [
    activeBranch?.id,
    branchToDelete,
    branches.length,
    currentPage,
    loadBranches,
    toast,
  ]);

  const handleOpenInfoDialog = useCallback(
    async (branch: Branch) => {
      setInfoDialogOpen(true);
      setActiveBranch(branch);

      const updatedBranch = await fetchBranchById(branch.id);
      if (updatedBranch) {
        setActiveBranch(updatedBranch);
        setBranches(prev =>
          prev.map(item =>
            item.id === updatedBranch.id ? updatedBranch : item,
          ),
        );
      }
    },
    [fetchBranchById],
  );

  const handleOpenScheduleDialog = useCallback(
    async (branch: Branch) => {
      setScheduleDialogOpen(true);
      setActiveBranch(branch);

      const updatedBranch = await fetchBranchById(branch.id);
      if (updatedBranch) {
        setActiveBranch(updatedBranch);
        setBranches(prev =>
          prev.map(item =>
            item.id === updatedBranch.id ? updatedBranch : item,
          ),
        );
      }
    },
    [fetchBranchById],
  );

  const handleManageServices = useCallback(
    (branch: Branch) => {
      router.push(`/dashboard/branch/${branch.id}/servicos`);
    },
    [router],
  );

  const handleManageEmployees = useCallback(
    (branch: Branch) => {
      router.push(`/dashboard/branch/${branch.id}/equipe`);
    },
    [router],
  );

  const handleInfoDialogChange = useCallback(
    (open: boolean) => {
      setInfoDialogOpen(open);
      if (!open && !scheduleDialogOpen) {
        setActiveBranch(null);
      }
    },
    [scheduleDialogOpen],
  );

  const handleScheduleDialogChange = useCallback(
    (open: boolean) => {
      setScheduleDialogOpen(open);
      if (!open && !infoDialogOpen) {
        setActiveBranch(null);
      }
    },
    [infoDialogOpen],
  );

  const handleBranchSaved = useCallback(
    (updatedBranch: Branch) => {
      setBranches(prev =>
        prev.map(branch =>
          branch.id === updatedBranch.id ? updatedBranch : branch,
        ),
      );
      setActiveBranch(updatedBranch);

      // Keep aggregated counters/summaries consistent with paginated source.
      void loadBranches(currentPage, true);
    },
    [currentPage, loadBranches],
  );

  const handleToggleBranchStatus = useCallback(
    async (branch: Branch, nextValue: boolean) => {
      setUpdatingBranchId(branch.id);

      try {
        const response = await fetch(`/api/branch/${branch.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: branch.name,
            is_active: nextValue,
            street: branch.street,
            number: branch.number,
            complement: branch.complement ?? "",
            neighborhood: branch.neighborhood ?? "",
            zip_code: branch.zip_code,
            city: branch.city,
            state: branch.state,
            country: branch.country,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Erro ao atualizar status da filial");
        }

        const updatedBranch = (await response.json()) as Branch;
        handleBranchSaved(updatedBranch);

        toast({
          title: "Status atualizado",
          description: nextValue
            ? "A filial foi ativada com sucesso."
            : "A filial foi desativada com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro ao atualizar status",
          description:
            error instanceof Error
              ? error.message
              : "Não foi possível atualizar o status da filial.",
          variant: "destructive",
        });
      } finally {
        setUpdatingBranchId(null);
      }
    },
    [handleBranchSaved, toast],
  );

  return (
    <BranchPageShell>
      <div className="space-y-6 pb-12 lg:pt-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Filiais</h1>
            <p className="text-muted-foreground">
              Gerencie suas unidades e locais de atendimento
            </p>
          </div>
          <AddAddressDialog
            onCreate={handleAddBranch}
            trigger={
              <Button className="btn-gradient gap-2" type="button">
                <Plus className="h-4 w-4" />
                Nova filial
              </Button>
            }
          />
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar filiais..."
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <BranchStatCard
              icon={Building2}
              label="Total"
              value={branchStats.total}
              iconClassName="text-primary"
              iconBgClassName="bg-primary/10"
            />
            {branchStats.totalEmployees !== null && (
              <BranchStatCard
                icon={Users}
                label="Profissionais"
                value={branchStats.totalEmployees}
                iconClassName="text-accent"
                iconBgClassName="bg-accent/10"
              />
            )}
            {branchStats.totalServices !== null && (
              <BranchStatCard
                icon={Sparkles}
                label="Serviços"
                value={branchStats.totalServices}
                iconClassName="text-secondary-foreground"
                iconBgClassName="bg-secondary"
              />
            )}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBranches.map(branch => {
              const servicesCount = getBranchServicesCount(branch);
              const employeesCount = getBranchEmployeesCount(branch);
              const scheduleSummary = getBranchScheduleSummary(branch);

              return (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  servicesCount={servicesCount}
                  employeesCount={employeesCount}
                  scheduleSummary={scheduleSummary}
                  hasBranchStatus={hasBranchStatus}
                  isUpdatingStatus={updatingBranchId === branch.id}
                  onEdit={handleOpenInfoDialog}
                  onViewSchedule={handleOpenScheduleDialog}
                  onManageServices={handleManageServices}
                  onManageEmployees={handleManageEmployees}
                  onDelete={handleDeleteRequest}
                  onToggleStatus={handleToggleBranchStatus}
                />
              );
            })}
          </div>
        )}

        {!searchTerm && totalBranches > DEFAULT_PAGE_SIZE && (
          <DataPagination
            page={currentPage}
            pageSize={DEFAULT_PAGE_SIZE}
            total={totalBranches}
            onPageChange={page => setCurrentPage(page)}
          />
        )}

        {!isLoading && filteredBranches.length === 0 && (
          <div className="py-12 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium">
              Nenhuma filial encontrada
            </h3>
            <p className="mb-4 text-muted-foreground">
              {searchTerm
                ? "Tente buscar com outros termos"
                : "Comece criando sua primeira filial"}
            </p>
            {!searchTerm && (
              <AddAddressDialog
                onCreate={handleAddBranch}
                trigger={
                  <Button className="btn-gradient gap-2" type="button">
                    <Plus className="h-4 w-4" />
                    Nova filial
                  </Button>
                }
              />
            )}
          </div>
        )}
      </div>

      <BranchInfoDialog
        open={infoDialogOpen}
        onOpenChange={handleInfoDialogChange}
        branch={activeBranch}
        onSaved={handleBranchSaved}
      />

      <BranchScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={handleScheduleDialogChange}
        branch={activeBranch}
        onSaved={handleBranchSaved}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir filial?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a filial "{branchToDelete?.name}"?
              Esta ação não pode ser desfeita e todos os vínculos com
              profissionais e serviços serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BranchPageShell>
  );
}
