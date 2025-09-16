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
import { Settings, Clock, Building2, RefreshCw } from "lucide-react";
import { BranchWorkScheduleView } from "./branch-work-schedule-view";
import { BranchWorkScheduleForm } from "./branch-work-schedule-form";
import { WorkRangeEditDialog } from "./work-range-edit-dialog";
import { useBranchWorkSchedule } from "@/hooks/workSchedule/use-branch-work-schedule";
import { useWorkRange } from "@/hooks/workSchedule/use-work-range";

interface BranchWorkScheduleRange {
  id?: string;
  branch_id: string;
  end_time: string;
  services: object[];
  start_time: string;
  time_zone: string;
  weekday: number;
}

interface BranchWorkScheduleManagerProps {
  branchId: string;
  branchName?: string;
  initialData?: BranchWorkScheduleRange[];
  services?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
  defaultView?: "view" | "edit";
  branchData?: any; // Dados completos da branch para otimização
}

export function BranchWorkScheduleManager({
  branchId,
  branchName = "Filial",
  initialData = [],
  services = [],
  onSuccess,
  defaultView = "view",
  branchData,
}: BranchWorkScheduleManagerProps) {
  const [workScheduleData, setWorkScheduleData] = useState<
    BranchWorkScheduleRange[]
  >([]);
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    workRangeId: string | null;
    data: Partial<BranchWorkScheduleRange> | null;
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

  // Hook para gerenciar work schedule da branch
  const {
    getBranchWorkSchedule,
    createBranchWorkSchedule,
    loading,
    data,
    error,
  } = useBranchWorkSchedule({
    onSuccess: () => {
      // Recarregar dados após criar novo horário
      loadBranchWorkSchedule();
    },
  });

  // Hook para gerenciar work_range individual (editar/deletar)
  const {
    updateWorkRange,
    deleteWorkRange,
    loading: workRangeLoading,
  } = useWorkRange({
    onSuccess: () => {
      // Recarregar dados após operação de work_range individual
      loadBranchWorkSchedule();
    },
  });

  // Função para normalizar os dados vindos do backend
  const normalizeInitialData = (data: any[]): BranchWorkScheduleRange[] => {
    if (!Array.isArray(data)) return [];

    return data.map((item, index) => {
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
        branch_id: String(item.branch_id || branchId),
        end_time: extractTime(item.end_time || item.end || ""),
        start_time: extractTime(item.start_time || item.start || ""),
        time_zone: String(item.time_zone || "America/Sao_Paulo"),
        weekday: Number(item.weekday ?? 1), // Usar ?? ao invés de || para preservar weekday 0
        services: Array.isArray(item.services) ? item.services : [],
      };

      return normalized;
    });
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
    existingData: BranchWorkScheduleRange[]
  ): BranchWorkScheduleRange[] => {
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
          branch_id: branchId,
          end_time: "",
          start_time: "",
          time_zone: "America/Sao_Paulo",
          weekday: day.number,
          services: [],
        } as BranchWorkScheduleRange;
      }
    });
  };

  // Carregar dados do backend quando o branchId muda
  useEffect(() => {
    if (branchId) {
      loadBranchWorkSchedule();
    }
  }, [branchId]);

  // Atualizar dados quando receber do hook
  useEffect(() => {
    if (data) {
      const normalized = normalizeInitialData(data);

      // Debug específico para domingo
      const domingoData = normalized.find(item => item.weekday === 0);

      // Gerar semana completa com dados existentes e dias vazios
      const completeWeek = generateCompleteWeekSchedule(normalized);

      // Debug específico para domingo na semana completa
      const domingoCompleto = completeWeek.find(item => item.weekday === 0);

      setWorkScheduleData(completeWeek);
    }
  }, [data]);

  // Carregar dados usando o hook
  const loadBranchWorkSchedule = async () => {
    try {
      await getBranchWorkSchedule(branchId);
    } catch (error) {
      console.warn("⚠️ Manager - Erro ao carregar work_schedule:", error);
      // Se não encontrar, use initialData como fallback ou crie semana vazia
      const fallbackData =
        initialData.length > 0 ? normalizeInitialData(initialData) : [];
      const completeWeek = generateCompleteWeekSchedule(fallbackData);
      setWorkScheduleData(completeWeek);
    }
  };

  const normalizedServices = normalizeServices(services);

  const handleSuccess = () => {
    // Recarregar dados após sucesso
    loadBranchWorkSchedule();
    onSuccess?.();
  };

  // Função para abrir dialog de confirmação de exclusão
  const handleDeleteWorkRange = async (
    workRangeId: string,
    currentData?: Partial<BranchWorkScheduleRange>
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
      await deleteWorkRange(branchId, deleteConfirmDialog.workRangeId);

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
    currentData: Partial<BranchWorkScheduleRange>
  ) => {
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
        await updateWorkRange(branchId, editDialog.workRangeId, updatedData);
      } else {
        // Verificar se já existe um registro para este dia da semana (com ou sem horários)
        const existingDayRecord = workScheduleData.find(
          day => day.weekday === updatedData.weekday && day.id
        );

        if (existingDayRecord) {
          await updateWorkRange(branchId, existingDayRecord.id!, updatedData);
        } else {
          // Preparar dados no formato esperado pela API de work_schedule
          const newWorkScheduleData = {
            branch_work_ranges: [
              {
                branch_id: branchId,
                weekday: updatedData.weekday,
                start_time: updatedData.start_time,
                end_time: updatedData.end_time,
                time_zone: updatedData.time_zone || "America/Sao_Paulo",
                services: [], // Serviços serão adicionados depois se necessário
              },
            ],
          };

          await createBranchWorkSchedule(branchId, newWorkScheduleData);
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
          <Building2 className="w-5 h-5" />
          <h3 className="text-lg font-medium">
            Horários da Filial - {branchName}
          </h3>
          {loading && (
            <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBranchWorkSchedule}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Renderização condicional: Configurar se não há dados, Visualizar se há dados */}
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
          <BranchWorkScheduleView
            workRanges={workScheduleData}
            branchName={branchName}
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
                Configure os horários de funcionamento
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Defina os horários de funcionamento desta filial para que os
                funcionários possam trabalhar aqui.
              </p>
              {error && (
                <p className="text-xs text-destructive mb-4 text-center">
                  {error}
                </p>
              )}
            </CardContent>
          </Card>

          <BranchWorkScheduleForm
            branchId={branchId}
            branchName={branchName}
            initialData={workScheduleData}
            services={normalizedServices}
            onSuccess={handleSuccess}
          />
        </div>
      )}

      {/* Dialog de edição */}
      <WorkRangeEditDialog
        isOpen={editDialog.isOpen}
        onClose={handleCloseEditDialog}
        onSave={handleSaveEdit}
        branchId={branchId}
        workRangeId={editDialog.workRangeId || "new"} // "new" para novos registros
        branchData={branchData} // Passar dados da branch para otimização
        initialData={
          editDialog.data
            ? {
                start_time: editDialog.data.start_time || "09:00",
                end_time: editDialog.data.end_time || "17:00",
                weekday: editDialog.data.weekday ?? 1, // Usar ?? em vez de || para preservar weekday 0
                time_zone: editDialog.data.time_zone || "America/Sao_Paulo",
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
        onSuccessfulSave={loadBranchWorkSchedule} // Callback para atualizar dados
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
              Tem certeza que deseja deletar o horário de funcionamento de{" "}
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
