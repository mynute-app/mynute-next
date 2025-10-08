"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Building2, RefreshCw, Clock } from "lucide-react";
import { BranchWorkScheduleView } from "./branch-work-schedule-view";
import { BranchWorkScheduleForm } from "./branch-work-schedule-form";
import { WorkRangeEditDialog } from "./work-range-edit-dialog";
import { useBranchWorkSchedule } from "@/hooks/workSchedule/use-branch-work-schedule";
import { useWorkRange } from "@/hooks/workSchedule/use-work-range";
import { DIAS_SEMANA_MAP } from "./constants";

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
  branchData?: any;
}

const extractTime = (isoString: string): string => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toTimeString().slice(0, 5);
  } catch {
    return isoString.includes(":") ? isoString.slice(0, 5) : "";
  }
};

const normalizeWorkScheduleData = (data: any[]): BranchWorkScheduleRange[] => {
  if (!Array.isArray(data)) return [];

  return data.map(item => ({
    id: String(item.id || ""),
    branch_id: String(item.branch_id),
    end_time: extractTime(item.end_time || item.end || ""),
    start_time: extractTime(item.start_time || item.start || ""),
    time_zone: String(item.time_zone || "America/Sao_Paulo"),
    weekday: Number(item.weekday ?? 1),
    services: Array.isArray(item.services) ? item.services : [],
  }));
};

const generateCompleteWeekSchedule = (
  existingData: BranchWorkScheduleRange[],
  branchId: string
): BranchWorkScheduleRange[] => {
  const weekdays = [0, 1, 2, 3, 4, 5, 6];

  return weekdays.map(day => {
    const existingDay = existingData.find(item => item.weekday === day);

    return (
      existingDay || {
        id: "",
        branch_id: branchId,
        end_time: "",
        start_time: "",
        time_zone: "America/Sao_Paulo",
        weekday: day,
        services: [],
      }
    );
  });
};

export function BranchWorkScheduleManager({
  branchId,
  branchName = "Filial",
  initialData = [],
  onSuccess,
  branchData,
}: BranchWorkScheduleManagerProps) {
  const {
    getBranchWorkSchedule,
    createBranchWorkSchedule,
    loading,
    data,
    error,
  } = useBranchWorkSchedule({
    onSuccess: () => {
      loadBranchWorkSchedule();
      onSuccess?.();
    },
  });

  const {
    updateWorkRange,
    deleteWorkRange,
    loading: workRangeLoading,
  } = useWorkRange({
    onSuccess: () => loadBranchWorkSchedule(),
  });

  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    workRangeId: string | null;
    data: Partial<BranchWorkScheduleRange> | null;
  }>({ isOpen: false, workRangeId: null, data: null });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    workRangeId: string | null;
    dayName: string;
  }>({ isOpen: false, workRangeId: null, dayName: "" });

  const initialScheduleData = useMemo(() => {
    const normalized = normalizeWorkScheduleData(initialData);
    return generateCompleteWeekSchedule(normalized, branchId);
  }, [initialData, branchId]);

  const [workScheduleData, setWorkScheduleData] =
    useState<BranchWorkScheduleRange[]>(initialScheduleData);

  useEffect(() => {
    if (branchId) loadBranchWorkSchedule();
  }, [branchId]);

  useEffect(() => {
    if (data) {
      const normalized = normalizeWorkScheduleData(data);
      const completeWeek = generateCompleteWeekSchedule(normalized, branchId);
      setWorkScheduleData(completeWeek);
    }
  }, [data, branchId]);

  const loadBranchWorkSchedule = useCallback(async () => {
    try {
      await getBranchWorkSchedule(branchId);
    } catch (error) {
      const fallbackData =
        initialData.length > 0 ? normalizeWorkScheduleData(initialData) : [];
      const completeWeek = generateCompleteWeekSchedule(fallbackData, branchId);
      setWorkScheduleData(completeWeek);
    }
  }, [branchId, getBranchWorkSchedule, initialData]);

  const handleEditWorkRange = useCallback(
    (workRangeId: string, currentData: Partial<BranchWorkScheduleRange>) => {
      setEditDialog({
        isOpen: true,
        workRangeId: workRangeId === "new" ? null : workRangeId,
        data: currentData,
      });
    },
    []
  );

  const handleDeleteWorkRange = useCallback(
    (workRangeId: string, currentData?: Partial<BranchWorkScheduleRange>) => {
      if (!workRangeId) return;

      const dayName =
        currentData?.weekday !== undefined
          ? DIAS_SEMANA_MAP[currentData.weekday]
          : "este dia";

      setDeleteDialog({ isOpen: true, workRangeId, dayName });
    },
    []
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteDialog.workRangeId) return;

    await deleteWorkRange(branchId, deleteDialog.workRangeId);
    setDeleteDialog({ isOpen: false, workRangeId: null, dayName: "" });
  }, [deleteDialog.workRangeId, branchId, deleteWorkRange]);

  const handleSaveEdit = useCallback(
    async (updatedData: any) => {
      if (editDialog.workRangeId) {
        await updateWorkRange(branchId, editDialog.workRangeId, updatedData);
      } else {
        const existingDayRecord = workScheduleData.find(
          day => day.weekday === updatedData.weekday && day.id
        );

        if (existingDayRecord) {
          await updateWorkRange(branchId, existingDayRecord.id!, updatedData);
        } else {
          await createBranchWorkSchedule(branchId, {
            branch_work_ranges: [
              {
                branch_id: branchId,
                weekday: updatedData.weekday,
                start_time: updatedData.start_time,
                end_time: updatedData.end_time,
                time_zone: updatedData.time_zone || "America/Sao_Paulo",
                services: [],
              },
            ],
          });
        }
      }

      setEditDialog({ isOpen: false, workRangeId: null, data: null });
    },
    [
      editDialog.workRangeId,
      workScheduleData,
      branchId,
      updateWorkRange,
      createBranchWorkSchedule,
    ]
  );

  const hasConfiguredSchedule = useMemo(
    () =>
      workScheduleData.some(day => day.id && day.start_time && day.end_time),
    [workScheduleData]
  );

  return (
    <div className="w-full space-y-4">
      {loading || workRangeLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
            <span className="text-muted-foreground">
              {loading ? "Carregando horários..." : "Processando..."}
            </span>
          </CardContent>
        </Card>
      ) : hasConfiguredSchedule ? (
        <BranchWorkScheduleView
          workRanges={workScheduleData}
          branchName={branchName}
          onEdit={handleEditWorkRange}
          onDelete={handleDeleteWorkRange}
          isEditable={true}
        />
      ) : (
        <>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Configure os horários de funcionamento
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Defina os horários de funcionamento desta filial para que os
                serviços possam ser agendados.
              </p>
              {error && (
                <p className="text-xs text-destructive mt-4 text-center">
                  {error}
                </p>
              )}
            </CardContent>
          </Card>

          <BranchWorkScheduleForm
            branchId={branchId}
            branchName={branchName}
            initialData={workScheduleData}
            onSuccess={loadBranchWorkSchedule}
          />
        </>
      )}

      <WorkRangeEditDialog
        isOpen={editDialog.isOpen}
        onClose={() =>
          setEditDialog({ isOpen: false, workRangeId: null, data: null })
        }
        onSave={handleSaveEdit}
        branchId={branchId}
        workRangeId={editDialog.workRangeId || "new"}
        branchData={branchData}
        initialData={
          editDialog.data
            ? {
                start_time: editDialog.data.start_time || "09:00",
                end_time: editDialog.data.end_time || "17:00",
                weekday: editDialog.data.weekday ?? 1,
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
        disableWeekdayEdit={!!editDialog.workRangeId}
        onSuccessfulSave={loadBranchWorkSchedule}
      />

      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={() =>
          setDeleteDialog({ isOpen: false, workRangeId: null, dayName: "" })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o horário de funcionamento de{" "}
              <strong>{deleteDialog.dayName}</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() =>
                setDeleteDialog({
                  isOpen: false,
                  workRangeId: null,
                  dayName: "",
                })
              }
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
