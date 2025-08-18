"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Clock, User, RefreshCw } from "lucide-react";
import { EmployeeWorkScheduleView } from "./employee-work-schedule-view";
import { WorkScheduleForm } from "./work-schedule-form";
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
  defaultView?: "view" | "edit";
}

export function WorkScheduleManager({
  employeeId,
  employeeName = "Funcionário",
  initialData = [],
  branches = [],
  services = [],
  onSuccess,
  defaultView = "view",
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

  // Hook para gerenciar work schedule do funcionário
  const {
    fetchWorkSchedule,
    createWorkSchedule,
    loading,
    workScheduleData: hookData,
    error,
  } = useWorkSchedule({
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

  // Função para validar UUID
  const isValidUUID = (uuid: string) => {
    if (!uuid || uuid.trim() === "") return false;
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Função para normalizar os dados vindos do backend
  const normalizeInitialData = (data: any[]): WorkScheduleRange[] => {
    console.log("🔄 normalizeInitialData - Dados de entrada:", data);

    if (!Array.isArray(data)) return [];

    return data.map((item, index) => {
      console.log(`🔍 normalizeInitialData - Processando item ${index}:`, item);

      // Extrair apenas a parte do horário das strings ISO ou formatos variados
      const extractTime = (isoString: string) => {
        if (!isoString) return "";

        console.log(`🕐 extractTime - Processando: "${isoString}"`);

        try {
          // Se já está no formato HH:MM, retorna direto
          if (/^\d{2}:\d{2}$/.test(isoString)) {
            console.log(
              `✅ extractTime - Já no formato correto: "${isoString}"`
            );
            return isoString;
          }

          // Se é uma string ISO ou tem formato de data/hora
          if (
            isoString.includes("T") ||
            isoString.includes("-") ||
            isoString.length > 8
          ) {
            const date = new Date(isoString);
            if (!isNaN(date.getTime())) {
              const timeString = date.toTimeString().slice(0, 5); // "HH:MM"
              console.log(
                `🔄 extractTime - Convertido de ISO: "${isoString}" → "${timeString}"`
              );
              return timeString;
            }
          }

          // Se contém ':' mas não está no formato correto, tenta extrair
          if (isoString.includes(":")) {
            const match = isoString.match(/(\d{1,2}:\d{2})/);
            if (match) {
              const timeString = match[1].padStart(5, "0"); // Garantir formato HH:MM
              console.log(
                `🔍 extractTime - Extraído por regex: "${isoString}" → "${timeString}"`
              );
              return timeString;
            }
          }

          console.log(
            `⚠️ extractTime - Não foi possível processar: "${isoString}"`
          );
          return "";
        } catch (error) {
          console.error(
            `❌ extractTime - Erro ao processar "${isoString}":`,
            error
          );
          return "";
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

      // Validar UUIDs obrigatórios
      if (normalized.employee_id && !isValidUUID(normalized.employee_id)) {
        console.warn(`⚠️ Employee ID inválido: "${normalized.employee_id}"`);
        normalized.employee_id = employeeId; // Usar o employeeId do props como fallback
      }

      if (normalized.branch_id && !isValidUUID(normalized.branch_id)) {
        console.warn(`⚠️ Branch ID inválido: "${normalized.branch_id}"`);
        normalized.branch_id = ""; // Limpar branch_id inválido
      }

      console.log(
        `✅ normalizeInitialData - Item ${index} normalizado:`,
        normalized
      );
      console.log(
        `📊 normalizeInitialData - Horários extraídos: ${normalized.start_time} - ${normalized.end_time}`
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

  // Carregar dados do backend quando o employeeId muda
  useEffect(() => {
    if (employeeId) {
      console.log(
        "🔄 Manager - Carregando work_schedule para funcionário:",
        employeeId
      );
      loadEmployeeWorkSchedule();
    }
  }, [employeeId]);

  // Atualizar dados quando receber do hook
  useEffect(() => {
    if (hookData) {
      console.log("📥 Manager - Dados recebidos do hook:", hookData);
      const normalized = normalizeInitialData(hookData);
      console.log("✨ Manager - Dados normalizados:", normalized);

      // Debug específico para domingo
      const domingoData = normalized.find(item => item.weekday === 0);
      console.log(
        "🔍 Manager - Domingo encontrado nos dados normalizados:",
        domingoData
      );

      // Gerar semana completa com dados existentes e dias vazios
      const completeWeek = generateCompleteWeekSchedule(normalized);
      console.log("📅 Manager - Semana completa gerada:", completeWeek);

      setWorkScheduleData(completeWeek);
    }
  }, [hookData]);

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

  const normalizedBranches = normalizeBranches(branches);
  const normalizedServices = normalizeServices(services);

  console.log("🏢 WorkScheduleManager - Employee ID:", employeeId);
  console.log("🏢 WorkScheduleManager - Branches recebidas:", branches);
  console.log(
    "🏢 WorkScheduleManager - Branches normalizadas:",
    normalizedBranches
  );
  console.log("🔧 WorkScheduleManager - Services recebidos:", services);

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
      // Validar dados antes de enviar
      console.log("🔍 Manager - Validando dados antes de salvar:", updatedData);

      if (!isValidUUID(updatedData.employee_id || employeeId)) {
        throw new Error("Employee ID inválido");
      }

      if (updatedData.branch_id && !isValidUUID(updatedData.branch_id)) {
        console.warn(
          "⚠️ Branch ID inválido, removendo:",
          updatedData.branch_id
        );
        updatedData.branch_id = ""; // Limpar branch_id inválido
      }

      // Se branch_id estiver vazio, não pode prosseguir (é obrigatório)
      if (!updatedData.branch_id || updatedData.branch_id.trim() === "") {
        throw new Error(
          "Você deve selecionar uma filial para configurar o horário de trabalho"
        );
      }

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
                services: updatedData.services || [], // Serviços serão adicionados depois se necessário
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

  // Verificar se há branches válidas disponíveis
  const hasValidBranches =
    normalizedBranches.length > 0 &&
    normalizedBranches.some(branch => isValidUUID(branch.id));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5" />
          <h3 className="text-lg font-medium">
            Jornada de Trabalho - {employeeName}
          </h3>
          {loading && (
            <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadEmployeeWorkSchedule}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Verificar se há branches válidas */}
      {!hasValidBranches ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2 text-center">
              Sem filiais disponíveis
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Este funcionário precisa estar associado a pelo menos uma filial
              para configurar horários de trabalho. Vá para a aba "Filial" para
              associar o funcionário a uma filial primeiro.
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Renderização condicional: Configurar se não há dados, Visualizar se há dados */
        <>
          {loading || workRangeLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
                <span className="text-muted-foreground">
                  {loading ? "Carregando horários..." : "Processando..."}
                </span>
              </CardContent>
            </Card>
          ) : hasConfiguredSchedule ? (
            // Mostra visualização quando há dados configurados
            <div className="mt-4">
              <EmployeeWorkScheduleView
                workRanges={workScheduleData}
                employeeName={employeeName}
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
                    Configure a jornada de trabalho
                  </h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Defina os horários de trabalho deste funcionário para que
                    ele possa atender clientes nas filiais.
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
        </>
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
