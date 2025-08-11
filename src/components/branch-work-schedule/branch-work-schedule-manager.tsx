"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

export function BranchWorkScheduleManager({
  branchId,
  branchName = "Filial",
  initialData = [],
  services = [],
  onSuccess,
  defaultView = "view",
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

  // Hook para gerenciar work schedule da branch
  const { getBranchWorkSchedule, loading, data, error } =
    useBranchWorkSchedule();

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

    return data.map(item => {
      // Extrair apenas a parte do horário das strings ISO
      const extractTime = (isoString: string) => {
        if (!isoString) return "09:00";
        try {
          const date = new Date(isoString);
          return date.toTimeString().slice(0, 5); // "HH:MM"
        } catch {
          return isoString.includes(":") ? isoString.slice(0, 5) : "09:00";
        }
      };

      return {
        id: String(item.id || ""),
        branch_id: String(item.branch_id || branchId),
        end_time: extractTime(item.end_time || item.end || "17:00"),
        start_time: extractTime(item.start_time || item.start || "09:00"),
        time_zone: String(item.time_zone || "America/Sao_Paulo"),
        weekday: Number(item.weekday || 1),
        services: Array.isArray(item.services) ? item.services : [],
      };
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

  // Carregar dados do backend quando o branchId muda
  useEffect(() => {
    if (branchId) {
      console.log(
        "🔄 Manager - Carregando work_schedule para branch:",
        branchId
      );
      loadBranchWorkSchedule();
    }
  }, [branchId]);

  // Atualizar dados quando receber do hook
  useEffect(() => {
    if (data) {
      console.log("📥 Manager - Dados recebidos do hook:", data);
      const normalized = normalizeInitialData(data);
      console.log("✨ Manager - Dados normalizados:", normalized);
      setWorkScheduleData(normalized);
    }
  }, [data]);

  // Carregar dados usando o hook
  const loadBranchWorkSchedule = async () => {
    try {
      await getBranchWorkSchedule(branchId);
    } catch (error) {
      console.warn("⚠️ Manager - Erro ao carregar work_schedule:", error);
      // Se não encontrar, use initialData como fallback
      if (initialData.length > 0) {
        setWorkScheduleData(normalizeInitialData(initialData));
      }
    }
  };

  const normalizedServices = normalizeServices(services);

  const handleSuccess = () => {
    // Recarregar dados após sucesso
    loadBranchWorkSchedule();
    onSuccess?.();
  };

  // Função para deletar um work_range específico
  const handleDeleteWorkRange = async (workRangeId: string) => {
    if (!workRangeId) return;

    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar este horário? Esta ação não pode ser desfeita."
    );

    if (!confirmDelete) return;

    try {
      console.log("🗑️ Manager - Deletando work_range:", workRangeId);
      await deleteWorkRange(branchId, workRangeId);
    } catch (error) {
      console.error("❌ Manager - Erro ao deletar work_range:", error);
    }
  };

  // Função para editar um work_range específico (abre dialog)
  const handleEditWorkRange = async (
    workRangeId: string,
    currentData: Partial<BranchWorkScheduleRange>
  ) => {
    if (!workRangeId) return;

    console.log(
      "✏️ Manager - Abrindo dialog para editar work_range:",
      workRangeId,
      currentData
    );

    setEditDialog({
      isOpen: true,
      workRangeId,
      data: currentData,
    });
  };

  // Função para salvar edição via dialog
  const handleSaveEdit = async (updatedData: any) => {
    if (!editDialog.workRangeId) return;

    try {
      console.log(
        "💾 Manager - Salvando edição:",
        editDialog.workRangeId,
        updatedData
      );
      await updateWorkRange(branchId, editDialog.workRangeId, updatedData);

      setEditDialog({
        isOpen: false,
        workRangeId: null,
        data: null,
      });
    } catch (error) {
      console.error("❌ Manager - Erro ao salvar edição:", error);
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

  const hasWorkSchedule = workScheduleData.length > 0;

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
      ) : hasWorkSchedule ? (
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
        workRangeId={editDialog.workRangeId || ""}
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
        disableWeekdayEdit={true} // Sempre desabilita edição do dia da semana ao editar work_range existente
      />
    </div>
  );
}
