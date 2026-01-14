"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Edit,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetCompany } from "@/hooks/get-company";
import { useGetEmployeeById } from "@/hooks/get-employee-by-id";
import { useDeleteEmployee } from "@/hooks/employee/use-delete-employee";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddTeamMemberDialog from "./add-team-member-modal";
import EditUserDialog from "./info-team/edit-user-dialog";

const getInitials = (member: Employee) => {
  const first = member.name?.trim().charAt(0);
  const last = member.surname?.trim().charAt(0);
  const initials = [first, last].filter(Boolean).join("");
  return initials ? initials.toUpperCase() : "?";
};

export default function YourTeam() {
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<Employee | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeById, setActiveById] = useState<Record<number, boolean>>({});

  const { company, loading, refetch } = useGetCompany();
  const employees: Employee[] = company?.employees ?? [];

  const { employee: selectedEmployeeData } =
    useGetEmployeeById(selectedMemberId);

  const { deleteEmployee, isDeleting } = useDeleteEmployee({
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (selectedEmployeeData) {
      setSelectedMember(selectedEmployeeData);
    }
  }, [selectedEmployeeData]);

  useEffect(() => {
    setActiveById(prev => {
      const next = { ...prev };
      employees.forEach(employee => {
        if (next[employee.id] === undefined) {
          next[employee.id] = true;
        }
      });
      return next;
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
            (service.name || "").toLowerCase().includes(normalizedSearch)
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

  const handleEditMember = (member: Employee) => {
    setSelectedMember(null);
    setSelectedMemberId(member.id);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (member: Employee) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
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
          <div className="space-y-6 pt-12 lg:pt-0">
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

            {loading ? (
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
                  const isActive = activeById[member.id] ?? true;
                  const services = Array.isArray(member.services)
                    ? member.services
                    : [];
                  const serviceNames = services
                    .map(service => service?.name)
                    .filter(Boolean) as string[];
                  const rating = 0;
                  const appointmentsCount = 0;
                  const workingDaysLabel = "Sem agenda";

                  return (
                    <div
                      key={member.id}
                      className={cn(
                        "bg-card rounded-xl border border-border shadow-sm p-5 card-hover",
                        !isActive && "opacity-60"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0">
                          {getInitials(member)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {member.name} {member.surname}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {member.role || "Profissional"}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Switch
                                checked={isActive}
                                onCheckedChange={checked =>
                                  setActiveById(prev => ({
                                    ...prev,
                                    [member.id]: checked,
                                  }))
                                }
                              />
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
                                    onClick={() => handleEditMember(member)}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteClick(member)}
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
                            Nenhuma descri\u00e7\u00e3o cadastrada.
                          </p>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              {member.email || "Email n\u00e3o informado"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {member.phone || "Telefone n\u00e3o informado"}
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
                                Sem servi\u00e7os
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
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
        }}
        availableServices={availableServices}
      />

      <EditUserDialog
        user={selectedMember}
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedMemberId(null);
          setSelectedMember(null);
        }}
        onReloadMember={id => setSelectedMemberId(id)}
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
              ? Esta a\u00e7\u00e3o n\u00e3o pode ser desfeita.
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
