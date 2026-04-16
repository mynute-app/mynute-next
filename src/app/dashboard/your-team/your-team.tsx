"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Edit,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetCompany } from "@/hooks/get-company";
import { useGetEmployeeById } from "@/hooks/get-employee-by-id";
import { useDeleteEmployee } from "@/hooks/employee/use-delete-employee";
import { useEmployeeApi } from "@/hooks/employee/use-employee-api";
import { formatPhone } from "@/utils/format-cnpj";
import type { Employee } from "../../../../types/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddTeamMemberDialog from "./add-team-member-modal";
import { TeamMemberInfoDialog } from "./dialogs/team-member-info-dialog";
import { TeamMemberScheduleDialog } from "./dialogs/team-member-schedule-dialog";
import { TeamMemberServicesDialog } from "./dialogs/team-member-services-dialog";
import { TeamMemberServicesScheduleDialog } from "./dialogs/team-member-services-schedule-dialog";

const getInitials = (member: Employee) => {
  const first = member.name?.trim().charAt(0);
  const last = member.surname?.trim().charAt(0);
  const initials = [first, last].filter(Boolean).join("");
  return initials ? initials.toUpperCase() : "?";
};

const formatPhoneForDisplay = (phone?: string) => {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";

  // API commonly returns E.164 (+55...). Show only national portion for BR mask.
  const nationalNumber =
    digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;

  return formatPhone(nationalNumber);
};

type MemberDialogKey = "info" | "services" | "schedule" | "services-schedule";

const isEmployeeActive = (member: Employee) =>
  (member as { is_active?: boolean }).is_active !== false;

export default function YourTeam() {
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<MemberDialogKey | null>(
    null,
  );
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<Employee | null>(null);
  const [memberReloadKey, setMemberReloadKey] = useState(0);
  const [memberToDelete, setMemberToDelete] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeById, setActiveById] = useState<Record<number, boolean>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(true);

  const { company, loading, refetch } = useGetCompany();
  const { fetchEmployees } = useEmployeeApi();

  const refreshEmployees = useCallback(
    async (force = false) => {
      const data = await fetchEmployees(1, 200, force);
      if (!data) return;
      setEmployees(data.employees);
    },
    [fetchEmployees],
  );

  useEffect(() => {
    let active = true;
    setIsEmployeesLoading(true);

    void refreshEmployees().finally(() => {
      if (!active) return;
      setIsEmployeesLoading(false);
    });

    return () => {
      active = false;
    };
  }, [refreshEmployees]);

  const { employee: selectedEmployeeData } = useGetEmployeeById(
    selectedMemberId,
    memberReloadKey,
  );

  const { deleteEmployee, isDeleting } = useDeleteEmployee({
    onSuccess: () => {
      void refreshEmployees(true);
    },
  });

  useEffect(() => {
    if (!selectedMemberId) {
      setSelectedMember(null);
      return;
    }

    if (selectedEmployeeData) {
      setSelectedMember(selectedEmployeeData);
    }
  }, [selectedEmployeeData, selectedMemberId]);

  useEffect(() => {
    if (employees.length === 0) return;

    setActiveById(prev => {
      let changed = false;
      const next = { ...prev };

      employees.forEach(employee => {
        if (next[employee.id] === undefined) {
          next[employee.id] = true;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [employees]);

  const availableServices = useMemo(() => {
    if (!Array.isArray(company?.services)) return [];
    const names = company.services
      .map(service => service?.name?.trim())
      .filter((name): name is string => Boolean(name));
    return Array.from(new Set(names));
  }, [company?.services]);

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return employees;

    return employees.filter(employee => {
      const fullName = `${employee.name || ""} ${employee.surname || ""}`
        .trim()
        .toLowerCase();
      const email = (employee.email || "").toLowerCase();
      const role = (employee.role || "").toLowerCase();
      const matchesServices = Array.isArray(employee.services)
        ? employee.services.some(service =>
            (service.name || "").toLowerCase().includes(normalizedSearch),
          )
        : false;

      return (
        fullName.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        role.includes(normalizedSearch) ||
        matchesServices
      );
    });
  }, [employees, searchTerm]);

  const handleCreateMember = () => {
    setAddDialogOpen(true);
  };

  const handleOpenDialog = (member: Employee, dialog: MemberDialogKey) => {
    if (selectedMemberId !== member.id) {
      setSelectedMember(null);
      setSelectedMemberId(member.id);
    }
    setActiveDialog(dialog);
  };

  const handleMenuSelect = (action: () => void) => {
    if (typeof document !== "undefined") {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
    }
    setTimeout(action, 0);
  };

  const handleCloseDialog = () => {
    setActiveDialog(null);
    setSelectedMemberId(null);
    setSelectedMember(null);
  };

  const handleReloadMember = () => {
    setMemberReloadKey(prev => prev + 1);
  };

  const handleDeleteClick = (member: Employee) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (member: Employee, newValue: boolean) => {
    setEmployees(prev =>
      prev.map(item =>
        item.id === member.id ? { ...item, is_active: newValue } : item,
      ),
    );

    try {
      const response = await fetch(`/api/employee/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newValue }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar status do profissional");
      }

      const updated = (await response.json()) as Employee;
      setEmployees(prev =>
        prev.map(item =>
          item.id === member.id ? { ...item, ...updated } : item,
        ),
      );
    } catch {
      setEmployees(prev =>
        prev.map(item =>
          item.id === member.id ? { ...item, is_active: !newValue } : item,
        ),
      );

      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o profissional.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    const success = await deleteEmployee(memberToDelete.id);
    if (success) {
      setMemberToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="team-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
          <div className="space-y-6 pb-12 lg:pt-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="page-header mb-0">
                <h1 className="page-title">Equipe</h1>
                <p className="page-description">
                  Gerencie os profissionais da equipe.
                </p>
              </div>
              <Button className="btn-gradient" onClick={handleCreateMember}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Profissional
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar profissional..."
                  className="pl-9 input-focus"
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                />
              </div>
            </div>

            {isEmployeesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-16 w-16 rounded-xl" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-2/3" />
                        <div className="flex gap-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
                <h3 className="text-sm font-medium">
                  Nenhum profissional encontrado
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tente ajustar a busca ou cadastre um novo profissional.
                </p>
                <Button
                  className="mt-4 gap-2 btn-gradient"
                  onClick={handleCreateMember}
                >
                  <Plus className="h-4 w-4" />
                  Criar profissional
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                {filteredEmployees.map(member => {
                  const isActive = isEmployeeActive(member);
                  const services = Array.isArray(member.services)
                    ? member.services
                    : [];
                  const serviceNames = services
                    .map(service => service?.name)
                    .filter(Boolean) as string[];
                  const roleLabel =
                    member.role || member.permission || "Profissional";
                  const emailValue =
                    member.email ||
                    (member as { email?: string; user?: { email?: string } })
                      .user?.email ||
                    "";
                  const phoneValue =
                    member.phone ||
                    (member as { phone?: string; phone_number?: string })
                      .phone_number ||
                    "";
                  const formattedPhone = formatPhoneForDisplay(phoneValue);
                  const descriptionValue =
                    (member as { bio?: string; description?: string })?.bio ||
                    (member as { bio?: string; description?: string })
                      ?.description ||
                    "";
                  const rating = 0;
                  const appointmentsCount =
                    (member as { appointments_count?: number })
                      .appointments_count ?? 0;
                  const workingDaysLabel =
                    (
                      member as {
                        schedule_label?: string;
                        has_schedule?: boolean;
                      }
                    ).schedule_label ||
                    ((member as { has_schedule?: boolean }).has_schedule
                      ? "Com agenda"
                      : "Sem agenda");

                  return (
                    <div
                      key={member.id}
                      className={cn(
                        "bg-card rounded-xl border border-border shadow-sm p-4 sm:p-5 card-hover",
                        !isActive && "opacity-60",
                      )}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-base font-bold flex-shrink-0 sm:h-16 sm:w-16 sm:text-xl">
                          {getInitials(member)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {member.name} {member.surname}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {roleLabel}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={isActive}
                                onCheckedChange={checked =>
                                  handleToggleStatus(member, checked)
                                }
                              />
                              <span className="text-xs text-muted-foreground">
                                {isActive ? "Ativo" : "Inativo"}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      handleMenuSelect(() =>
                                        handleOpenDialog(member, "info"),
                                      )
                                    }
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      handleMenuSelect(() =>
                                        handleOpenDialog(member, "services"),
                                      )
                                    }
                                  >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Servicos
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      handleMenuSelect(() =>
                                        handleOpenDialog(member, "schedule"),
                                      )
                                    }
                                  >
                                    <Clock className="w-4 h-4 mr-2" />
                                    Filiais e horarios
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      handleMenuSelect(() =>
                                        handleOpenDialog(
                                          member,
                                          "services-schedule",
                                        ),
                                      )
                                    }
                                  >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Servicos por horario
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      handleMenuSelect(() =>
                                        handleDeleteClick(member),
                                      )
                                    }
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {descriptionValue
                              ? descriptionValue
                              : "Nenhuma descricao cadastrada."}
                          </p>

                          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                            <span className="flex items-center gap-1 min-w-0">
                              <Mail className="w-3.5 h-3.5" />
                              <span className="truncate">
                                {emailValue || "Email nao informado"}
                              </span>
                            </span>
                            <span className="flex items-center gap-1 min-w-0">
                              <Phone className="w-3.5 h-3.5" />
                              <span className="truncate">
                                {formattedPhone || "Telefone nao informado"}
                              </span>
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-3">
                            {serviceNames.length > 0 ? (
                              serviceNames.map(service => (
                                <Badge
                                  key={`${member.id}-${service}`}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {service}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Sem servicos
                              </Badge>
                            )}
                          </div>

                          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm sm:flex-row sm:items-center sm:gap-4">
                            {rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-accent fill-accent" />
                                <span className="font-medium text-foreground">
                                  {rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{appointmentsCount} atendimentos</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {workingDaysLabel}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddTeamMemberDialog
        isOpen={addDialogOpen}
        setIsOpen={setAddDialogOpen}
        onSuccess={() => {
          refetch();
          void refreshEmployees(true);
        }}
        availableServices={availableServices}
      />

      <TeamMemberInfoDialog
        open={activeDialog === "info"}
        onOpenChange={open => {
          if (!open) handleCloseDialog();
        }}
        member={selectedMember}
        onReloadMember={handleReloadMember}
      />
      <TeamMemberServicesDialog
        open={activeDialog === "services"}
        onOpenChange={open => {
          if (!open) handleCloseDialog();
        }}
        member={selectedMember}
        setMember={setSelectedMember}
        onReloadMember={handleReloadMember}
        services={company?.services ?? []}
        loadingServices={loading}
      />
      <TeamMemberScheduleDialog
        open={activeDialog === "schedule"}
        onOpenChange={open => {
          if (!open) handleCloseDialog();
        }}
        member={selectedMember}
        setMember={setSelectedMember}
        onReloadMember={handleReloadMember}
        branches={company?.branches ?? []}
        loadingBranches={loading}
      />
      <TeamMemberServicesScheduleDialog
        open={activeDialog === "services-schedule"}
        onOpenChange={open => {
          if (!open) handleCloseDialog();
        }}
        member={selectedMember}
        setMember={setSelectedMember}
        onReloadMember={handleReloadMember}
        services={company?.services ?? []}
        loadingServices={loading}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir profissional</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir{" "}
              <strong>
                {memberToDelete?.name} {memberToDelete?.surname}
              </strong>
              ? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
