"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useToast } from "@/hooks/use-toast";
import { useBranchApi } from "@/hooks/branch/use-branch-api";
import { useEmployeeApi } from "@/hooks/employee/use-employee-api";
import type { Branch, Employee } from "../../../../../../types/company";

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
    <div className="custom-scrollbar flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">{children}</div>
    </div>
  </div>
);

const getEmployeeName = (employee: Employee) => {
  const fullName = [employee.name, employee.surname].filter(Boolean).join(" ");
  return fullName || employee.name || "Sem nome";
};

const resolveInitialEmployeeIds = (
  branchData: Branch | null,
  employees: Employee[],
) => {
  const fromBranch = branchData?.employees?.map(employee => employee.id) ?? [];

  const fromCompany = employees
    .filter(employee =>
      employee.branches?.some(
        branch => String(branch.id) === String(branchData?.id),
      ),
    )
    .map(employee => employee.id);

  return new Set<number>([...fromBranch, ...fromCompany]);
};

export default function BranchEquipePage() {
  const params = useParams();
  const branchIdParam = Array.isArray(params?.branchId)
    ? params.branchId[0]
    : params?.branchId;
  const branchId = typeof branchIdParam === "string" ? branchIdParam : "";

  const { fetchEmployees } = useEmployeeApi();
  const { fetchBranchById, linkEmployeeToBranch, unlinkEmployeeFromBranch } =
    useBranchApi();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);

  const [branchDetails, setBranchDetails] = useState<Branch | null>(null);
  const [isBranchLoading, setIsBranchLoading] = useState(false);

  const branch = useMemo(() => branchDetails ?? null, [branchDetails]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<number>>(
    new Set(),
  );
  const [initialEmployeeIds, setInitialEmployeeIds] = useState<Set<number>>(
    new Set(),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [initializedBranchId, setInitializedBranchId] = useState("");

  useEffect(() => {
    let active = true;
    setIsEmployeesLoading(true);

    fetchEmployees(1, 200)
      .then(data => {
        if (!active || !data) return;
        setEmployees(data.employees);
      })
      .finally(() => {
        if (!active) return;
        setIsEmployeesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchEmployees]);

  useEffect(() => {
    if (!branchId || isEmployeesLoading || initializedBranchId === branchId) {
      return;
    }

    const initialIds = branch
      ? resolveInitialEmployeeIds(branch, employees)
      : new Set(
          employees
            .filter(employee =>
              employee.branches?.some(item => String(item.id) === branchId),
            )
            .map(employee => employee.id),
        );

    setSelectedEmployeeIds(initialIds);
    setInitialEmployeeIds(new Set(initialIds));
    setInitializedBranchId(branchId);
  }, [branchId, branch, employees, isEmployeesLoading, initializedBranchId]);

  useEffect(() => {
    if (!branchId) return;

    let active = true;
    setIsBranchLoading(true);

    fetchBranchById(branchId)
      .then(data => {
        if (!active || !data) return;
        setBranchDetails(data);
        setInitializedBranchId("");
      })
      .finally(() => {
        if (!active) return;
        setIsBranchLoading(false);
      });

    return () => {
      active = false;
    };
  }, [branchId, fetchBranchById]);

  const branchName = branch?.name ?? "Filial";

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredEmployees = useMemo(() => {
    if (!normalizedSearch) return employees;

    return employees.filter(employee => {
      const haystack = [
        employee.name,
        employee.surname,
        employee.role,
        employee.permission,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [employees, normalizedSearch]);

  const activeCount = useMemo(
    () =>
      employees.reduce(
        (total, employee) =>
          total + (selectedEmployeeIds.has(employee.id) ? 1 : 0),
        0,
      ),
    [employees, selectedEmployeeIds],
  );

  const hasChanges = useMemo(() => {
    if (selectedEmployeeIds.size !== initialEmployeeIds.size) return true;
    for (const id of selectedEmployeeIds) {
      if (!initialEmployeeIds.has(id)) return true;
    }
    return false;
  }, [selectedEmployeeIds, initialEmployeeIds]);

  const toggleEmployee = (employeeId: number) => {
    setSelectedEmployeeIds(prev => {
      const next = new Set(prev);
      if (next.has(employeeId)) {
        next.delete(employeeId);
      } else {
        next.add(employeeId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!branchId) return;

    const toLink = employees
      .filter(
        employee =>
          selectedEmployeeIds.has(employee.id) &&
          !initialEmployeeIds.has(employee.id),
      )
      .map(employee => employee.id);

    const toUnlink = employees
      .filter(
        employee =>
          initialEmployeeIds.has(employee.id) &&
          !selectedEmployeeIds.has(employee.id),
      )
      .map(employee => employee.id);

    if (toLink.length === 0 && toUnlink.length === 0) return;

    setIsSaving(true);

    const results = await Promise.allSettled([
      ...toLink.map(employeeId => linkEmployeeToBranch(employeeId, branchId)),
      ...toUnlink.map(employeeId =>
        unlinkEmployeeFromBranch(employeeId, branchId),
      ),
    ]);

    const failed = results.some(
      result => result.status === "rejected" || result.value === false,
    );

    if (failed) {
      toast({
        title: "Erro ao salvar equipe",
        description:
          "Nem todas as alteracoes foram aplicadas. Revise a equipe.",
        variant: "destructive",
      });
    } else {
      const refreshedBranch = await fetchBranchById(branchId, true);
      if (refreshedBranch) {
        setBranchDetails(refreshedBranch);
      }
      setInitializedBranchId("");
      setInitialEmployeeIds(new Set(selectedEmployeeIds));
    }

    setIsSaving(false);
  };

  if (!branchId) {
    return (
      <PageShell>
        <div className="p-6 text-muted-foreground">Filial nao encontrada.</div>
      </PageShell>
    );
  }

  const isLoading = isEmployeesLoading || isBranchLoading;

  return (
    <PageShell>
      <div className="space-y-6 pb-12 lg:pt-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/branch">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="page-title">Equipe da filial</h1>
            <p className="text-muted-foreground">{branchName}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar profissionais..."
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="rounded-lg border bg-card px-4 py-3">
            <span className="text-2xl font-bold text-primary">
              {isLoading ? "-" : activeCount}
            </span>
            <span className="ml-2 text-muted-foreground">nesta filial</span>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3">
            <span className="text-2xl font-bold">
              {isLoading ? "-" : employees.length}
            </span>
            <span className="ml-2 text-muted-foreground">total</span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-muted-foreground">
            Nenhum profissional encontrado.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEmployees.map(employee => {
              const isEnabled = selectedEmployeeIds.has(employee.id);
              const roleLabel = employee.role || employee.permission || "";

              return (
                <div
                  key={employee.id}
                  className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleEmployee(employee.id)}
                      disabled={isSaving}
                    />
                    <UserAvatar
                      name={employee.name}
                      surname={employee.surname}
                      imageUrl={employee.meta?.design?.images?.profile?.url}
                      size="md"
                      className="flex-shrink-0"
                    />
                    <div>
                      <h3 className="font-medium">
                        {getEmployeeName(employee)}
                      </h3>
                      {roleLabel && (
                        <p className="text-sm text-muted-foreground">
                          {roleLabel}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={isEnabled ? "default" : "secondary"}>
                      {isEnabled ? "Ativo" : "Inativo"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      title="Configuracao de horarios por filial em breve"
                    >
                      <Clock className="mr-1 h-4 w-4" />
                      Horarios
                    </Button>
                    {/* TODO: habilitar horarios por filial quando o backend suportar. */}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end border-t pt-4">
          <Button
            className="btn-gradient"
            onClick={handleSave}
            disabled={!hasChanges || isSaving || isLoading}
          >
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
