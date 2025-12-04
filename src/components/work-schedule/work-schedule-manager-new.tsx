"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Clock, RefreshCw, User } from "lucide-react";
import { WorkScheduleForm } from "./work-schedule-form";
import { WorkScheduleView } from "./work-schedule-view";
import { EmployeeWorkRangeEditDialog } from "./employee-work-range-edit-dialog";
import {
  useWorkSchedule,
  WorkScheduleRange,
} from "@/hooks/workSchedule/use-work-schedule";
import { useEmployeeWorkRange } from "@/hooks/workSchedule/use-employee-work-range";

interface WorkScheduleManagerProps {
  employeeId: string;
  employeeName?: string;
  initialData?: WorkScheduleRange[];
  branches?: Array<{ id: string; name: string }>;
  services?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function WorkScheduleManager({
  employeeId,
  employeeName = "Funcionário",
  initialData = [],
  branches = [],
  services = [],
  onSuccess,
}: WorkScheduleManagerProps) {
  const [workScheduleData, setWorkScheduleData] = useState<WorkScheduleRange[]>(
    []
  );
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    workRangeId: string | null;
    data: Partial<WorkScheduleRange> | null;
  }>({
    isOpen: false,
    workRangeId: null,
    data: null,
  });
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean;
    workRangeId: string | null;
    dayName: string;
  }>({
    isOpen: false,
    workRangeId: null,
    dayName: "",
  });

  // Hook para gerenciar work schedule do employee
  const {
    workScheduleData: hookData,
    fetchWorkSchedule,
    createWorkSchedule,
    fetchLoading,
    loading,
    error,
  } = useWorkSchedule({
    autoFetch: true,
    employeeId,
    onSuccess: () => {
      // Recarregar dados após criar novo horário
      loadEmployeeWorkSchedule();
    },
  });

  // Hook para gerenciar work_range individual (editar/deletar)
  const {
    updateEmployeeWorkRange,
    deleteEmployeeWorkRange,
    loading: workRangeLoading,
  } = useEmployeeWorkRange({
    onSuccess: () => {
      // Recarregar dados após operação de work_range individual
      loadEmployeeWorkSchedule();
    },
  });

  // Função para normalizar os dados vindos do backend
  const normalizeInitialData = (data: any[]): WorkScheduleRange[] => {
    console.log("🔄 normalizeInitialData - Dados de entrada:", data);

    if (!Array.isArray(data)) return [];

    return data.map((item, index) => {
      console.log(`🔍 normalizeInitialData - Processando item ${index}:`, item);

      // Extrair apenas a parte do horário das strings ISO
      const extractTime = (isoString: string) => {
        if (!isoString) return "";
        try {
          const date = new Date(isoString);
          return date.toTimeString().slice(0, 5); // "HH:MM"
        } catch {
          return isoString.includes(":") ? isoString.slice(0, 5) : "";
        }
      };

      const normalized = {
        id: String(item.id || ""),
        employee_id: String(item.employee_id || employeeId),
        branch_id: String(item.branch_id || ""),
        end_time: extractTime(item.end_time || item.end || ""),
        start_time: extractTime(item.start_time || item.start || ""),
        time_zone: String(item.time_zone || "America/Sao_Paulo"),
        weekday: Number(item.weekday ?? 1), // Usar ?? ao invés de || para preservar weekday 0
        services: Array.isArray(item.services) ? item.services : [],
      };

      console.log(
        `✅ normalizeInitialData - Item ${index} normalizado:`,
        normalized
      );

      return normalized;
    });
  };

  // Função para normalizar branches
  const normalizeBranches = (branchesData: any[]) => {
    if (!Array.isArray(branchesData)) return [];

    return branchesData.map(branch => ({
      id: String(branch.id || ""),
      name: String(branch.name || "Filial"),
    }));
  };

  // Função para normalizar services
  const normalizeServices = (servicesData: any[]) => {
    if (!Array.isArray(servicesData)) return [];

    return servicesData.map(service => ({
      id: String(service.id || ""),
      name: String(service.name || "Serviço"),
    }));
  };

  // Função para gerar todos os dias da semana com dados completos
  const generateCompleteWeekSchedule = (
    existingData: WorkScheduleRange[]
  ): WorkScheduleRange[] => {
    const weekdays = [
      { number: 0, name: "Domingo" },
      { number: 1, name: "Segunda-feira" },
      { number: 2, name: "Terça-feira" },
      { number: 3, name: "Quarta-feira" },
      { number: 4, name: "Quinta-feira" },
      { number: 5, name: "Sexta-feira" },
      { number: 6, name: "Sábado" },
    ];

    return weekdays.map(day => {
      // Procurar se existe dados para este dia da semana
      const existingDay = existingData.find(
        item => item.weekday === day.number
      );

      if (existingDay) {
        // Se existe, retorna os dados existentes
        return existingDay;
      } else {
        // Se não existe, cria um registro vazio para permitir edição
        return {
          id: "", // ID vazio indica que é um dia não configurado
          employee_id: employeeId,
          branch_id: "",
          end_time: "",
          start_time: "",
          time_zone: "America/Sao_Paulo",
          weekday: day.number,
          services: [],
        } as WorkScheduleRange;
      }
    });
  };

  // Atualizar dados quando receber do hook
  useEffect(() => {
    if (hookData && hookData.length > 0) {
      console.log("📥 Manager - Dados recebidos do hook:", hookData);
      const normalized = normalizeInitialData(hookData);
      console.log("✨ Manager - Dados normalizados:", normalized);

      // Gerar semana completa com dados existentes e dias vazios
      const completeWeek = generateCompleteWeekSchedule(normalized);
      console.log("📅 Manager - Semana completa gerada:", completeWeek);

      setWorkScheduleData(completeWeek);
    } else if (!fetchLoading) {
      // Se não há dados e não está carregando, usar initialData como fallback
      const fallbackData =
        initialData.length > 0 ? normalizeInitialData(initialData) : [];
      const completeWeek = generateCompleteWeekSchedule(fallbackData);
      setWorkScheduleData(completeWeek);
    }
  }, [hookData, fetchLoading, initialData, employeeId]);

  const normalizedBranches = normalizeBranches(branches);
  const normalizedServices = normalizeServices(services);

  // Carregar dados usando o hook
  const loadEmployeeWorkSchedule = async () => {
    try {
      await fetchWorkSchedule(employeeId);
    } catch (error) {
      console.warn("⚠️ Manager - Erro ao carregar work_schedule:", error);
      // Se não encontrar, use initialData como fallback ou crie semana vazia
      const fallbackData =
        initialData.length > 0 ? normalizeInitialData(initialData) : [];
      const completeWeek = generateCompleteWeekSchedule(fallbackData);
      setWorkScheduleData(completeWeek);
    }
  };

  const handleSuccess = () => {
    // Recarregar dados após sucesso
    loadEmployeeWorkSchedule();
    onSuccess?.();
  };

  // Função para abrir dialog de confirmação de exclusão
  const handleDeleteWorkRange = async (
    workRangeId: string,
    currentData?: Partial<WorkScheduleRange>
  ) => {
    if (!workRangeId) return;

    // Descobrir o nome do dia
    const weekdays = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    const dayName =
      currentData?.weekday !== undefined
        ? weekdays[currentData.weekday]
        : "este dia";

    setDeleteConfirmDialog({
      isOpen: true,
      workRangeId,
      dayName,
    });
  };

  // Função para confirmar e executar a exclusão
  const confirmDeleteWorkRange = async () => {
    if (!deleteConfirmDialog.workRangeId) return;

    try {
      console.log(
        "🗑️ Manager - Deletando work_range:",
        deleteConfirmDialog.workRangeId
      );
      await deleteEmployeeWorkRange(
        employeeId,
        deleteConfirmDialog.workRangeId
      );

      // Fechar o dialog
      setDeleteConfirmDialog({
        isOpen: false,
        workRangeId: null,
        dayName: "",
      });
    } catch (error) {
      console.error("❌ Manager - Erro ao deletar work_range:", error);
    }
  };

  // Função para cancelar a exclusão
  const cancelDelete = () => {
    setDeleteConfirmDialog({
      isOpen: false,
      workRangeId: null,
      dayName: "",
    });
  };

  // Função para editar um work_range específico (abre dialog)
  const handleEditWorkRange = async (
    workRangeId: string,
    currentData: Partial<WorkScheduleRange>
  ) => {
    console.log(
      "✏️ Manager - Abrindo dialog para editar/criar work_range:",
      workRangeId,
      currentData
    );

    setEditDialog({
      isOpen: true,
      workRangeId: workRangeId === "new" ? null : workRangeId, // null para novos
      data: currentData,
    });
  };

  // Função para salvar edição via dialog
  const handleSaveEdit = async (updatedData: any) => {
    try {
      if (editDialog.workRangeId) {
        // Editando work_range existente - usar API individual
        console.log(
          "💾 Manager - Salvando edição:",
          editDialog.workRangeId,
          updatedData
        );
        await updateEmployeeWorkRange(
          employeeId,
          editDialog.workRangeId,
          updatedData
        );
      } else {
        console.log(
          "🔍 Manager - Verificando existência do dia para weekday:",
          updatedData.weekday
        );
        console.log("📋 Manager - workScheduleData atual:", workScheduleData);

        // Verificar se já existe um registro para este dia da semana (com ou sem horários)
        const existingDayRecord = workScheduleData.find(
          day => day.weekday === updatedData.weekday && day.id
        );

        console.log(
          "🔍 Manager - Registro existente encontrado:",
          existingDayRecord
        );

        if (existingDayRecord) {
          // Se já existe um registro (mesmo vazio), usar API de atualização individual
          console.log(
            "🔄 Manager - Registro do dia já existe, atualizando:",
            existingDayRecord.id,
            updatedData
          );
          await updateEmployeeWorkRange(
            employeeId,
            existingDayRecord.id!,
            updatedData
          );
        } else {
          // Se não existe nenhum registro, criar novo dia - usar API de work_schedule
          console.log("➕ Manager - Criando novo dia:", updatedData);

          // Preparar dados no formato esperado pela API de work_schedule
          const newWorkScheduleData = {
            employee_work_ranges: [
              {
                employee_id: employeeId,
                branch_id: updatedData.branch_id,
                weekday: updatedData.weekday,
                start_time: updatedData.start_time,
                end_time: updatedData.end_time,
                time_zone: updatedData.time_zone || "America/Sao_Paulo",
                services: [], // Serviços serão adicionados depois se necessário
              },
            ],
          };

          await createWorkSchedule(employeeId, newWorkScheduleData);
        }
      }

      setEditDialog({
        isOpen: false,
        workRangeId: null,
        data: null,
      });
    } catch (error) {
      console.error("❌ Manager - Erro ao salvar:", error);
      throw error;
    }
  };

  // Função para fechar dialog
  const handleCloseEditDialog = () => {
    setEditDialog({
      isOpen: false,
      workRangeId: null,
      data: null,
    });
  };

  // Verificar se tem pelo menos um dia configurado (com horários)
  const hasConfiguredSchedule = workScheduleData.some(
    day => day.id && day.start_time && day.end_time
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5" />
          <h3 className="text-lg font-medium">
            Horários de Trabalho - {employeeName}
          </h3>
          {fetchLoading && (
            <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadEmployeeWorkSchedule}
            disabled={fetchLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw
              className={`w-3 h-3 ${fetchLoading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Renderização condicional: Configurar se não há dados, Visualizar se há dados */}
      {fetchLoading || workRangeLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
            <span className="text-muted-foreground">
              {fetchLoading ? "Carregando horários..." : "Processando..."}
            </span>
          </CardContent>
        </Card>
      ) : hasConfiguredSchedule ? (
        // Mostra visualização quando há dados configurados
        <div className="mt-4">
          <WorkScheduleView
            workRanges={workScheduleData}
            branches={normalizedBranches}
            onEdit={handleEditWorkRange}
            onDelete={handleDeleteWorkRange}
            isEditable={true}
          />
        </div>
      ) : (
        // Mostra formulário de configuração quando não há dados
        <div className="mt-4">
          <Card className="mb-4">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Configure os horários de trabalho
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Defina os horários de trabalho para que este funcionário possa
                atender.
              </p>
              {error && (
                <p className="text-xs text-destructive mb-4 text-center">
                  {error}
                </p>
              )}
            </CardContent>
          </Card>

          <WorkScheduleForm
            employeeId={employeeId}
            initialData={workScheduleData}
            branches={normalizedBranches}
            services={normalizedServices}
            onSuccess={handleSuccess}
          />
        </div>
      )}

      {/* Dialog de edição */}
      <EmployeeWorkRangeEditDialog
        isOpen={editDialog.isOpen}
        onClose={handleCloseEditDialog}
        onSave={handleSaveEdit}
        employeeId={employeeId}
        workRangeId={editDialog.workRangeId || "new"} // "new" para novos registros
        branches={normalizedBranches}
        services={normalizedServices}
        initialData={
          editDialog.data
            ? {
                start_time: editDialog.data.start_time || "09:00",
                end_time: editDialog.data.end_time || "17:00",
                weekday: editDialog.data.weekday ?? 1, // Usar ?? em vez de || para preservar weekday 0
                time_zone: editDialog.data.time_zone || "America/Sao_Paulo",
                branch_id: editDialog.data.branch_id || "",
                services: Array.isArray(editDialog.data.services)
                  ? editDialog.data.services.map((service: any) =>
                      typeof service === "object" && service.id
                        ? service.id.toString()
                        : service.toString()
                    )
                  : [],
              }
            : undefined
        }
        loading={workRangeLoading}
        disableWeekdayEdit={!!editDialog.workRangeId} // Desabilita apenas quando editando existente
      />

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        open={deleteConfirmDialog.isOpen}
        onOpenChange={cancelDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o horário de trabalho de{" "}
              <strong>{deleteConfirmDialog.dayName}</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteWorkRange}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
