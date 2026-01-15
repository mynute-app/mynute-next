"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useBranchWorkSchedule,
  type BranchWorkScheduleRange,
} from "@/hooks/workSchedule/use-branch-work-schedule";
import { useWorkRange } from "@/hooks/workSchedule/use-work-range";
import { useToast } from "@/hooks/use-toast";
import type { Branch } from "../../../../../types/company";

type EditTab = "info" | "schedule";

type BranchEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch | null;
  defaultTab?: EditTab;
  onSaved?: (branch: Branch) => void;
};

type BranchEditFormValues = {
  name: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
};

type ScheduleDayState = {
  weekday: number;
  label: string;
  enabled: boolean;
  start_time: string;
  end_time: string;
  time_zone: string;
  id?: string;
};

type ScheduleRange = BranchWorkScheduleRange & {
  id?: string | number;
  start?: string;
  end?: string;
};

type ScheduleUpdatePayload = {
  start_time: string;
  end_time: string;
  weekday: number;
  time_zone: string;
};

const WEEKDAYS: Array<Pick<ScheduleDayState, "weekday" | "label">> = [
  { weekday: 1, label: "Segunda-feira" },
  { weekday: 2, label: "Terca-feira" },
  { weekday: 3, label: "Quarta-feira" },
  { weekday: 4, label: "Quinta-feira" },
  { weekday: 5, label: "Sexta-feira" },
  { weekday: 6, label: "Sabado" },
  { weekday: 0, label: "Domingo" },
];

const DEFAULT_START_TIME = "08:00";
const DEFAULT_END_TIME = "17:00";
const DEFAULT_TIME_ZONE = "America/Sao_Paulo";

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

const buildScheduleState = (
  ranges: ScheduleRange[] | null | undefined
): ScheduleDayState[] => {
  // Note: keep only the first range per weekday until multi-range support exists.
  const byWeekday = new Map<number, ScheduleRange>();

  (ranges ?? []).forEach(range => {
    const weekday = Number(range.weekday);
    if (!Number.isFinite(weekday) || byWeekday.has(weekday)) return;
    byWeekday.set(weekday, range);
  });

  return WEEKDAYS.map(day => {
    const range = byWeekday.get(day.weekday);
    if (!range) {
      return {
        ...day,
        enabled: false,
        start_time: "",
        end_time: "",
        time_zone: DEFAULT_TIME_ZONE,
      };
    }

    const start = extractTime(range.start_time || range.start);
    const end = extractTime(range.end_time || range.end);

    return {
      ...day,
      id: range.id ? String(range.id) : undefined,
      enabled: Boolean(range.id || start || end),
      start_time: start,
      end_time: end,
      time_zone: range.time_zone || DEFAULT_TIME_ZONE,
    };
  });
};

const buildDefaultValues = (branch: Branch | null): BranchEditFormValues => ({
  name: branch?.name ?? "",
  street: branch?.street ?? "",
  number: branch?.number ?? "",
  complement: branch?.complement ?? "",
  neighborhood: branch?.neighborhood ?? "",
  zip_code: branch?.zip_code ?? "",
  city: branch?.city ?? "",
  state: branch?.state ?? "",
  country: branch?.country ?? "",
});

export function BranchEditDialog({
  open,
  onOpenChange,
  branch,
  defaultTab = "info",
  onSaved,
}: BranchEditDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<EditTab>(defaultTab);
  const [isSaving, setIsSaving] = useState(false);
  const [scheduleDays, setScheduleDays] = useState<ScheduleDayState[]>([]);
  const [initialScheduleDays, setInitialScheduleDays] = useState<
    ScheduleDayState[]
  >([]);
  const [isScheduleFetching, setIsScheduleFetching] = useState(false);
  const scheduleTouchedRef = useRef(false);

  const defaultValues = useMemo(() => buildDefaultValues(branch), [branch]);

  const { register, handleSubmit, reset, formState } =
    useForm<BranchEditFormValues>({
      defaultValues,
    });

  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
      reset(defaultValues);
    }
  }, [open, defaultTab, reset, defaultValues]);

  const { getBranchWorkSchedule, createBranchWorkSchedule } =
    useBranchWorkSchedule();
  const { updateWorkRange, deleteWorkRange } = useWorkRange();

  useEffect(() => {
    if (!open || !branch) return;

    scheduleTouchedRef.current = false;
    const fallbackSchedule = buildScheduleState(
      branch.work_schedule as ScheduleRange[] | undefined
    );
    setScheduleDays(fallbackSchedule);
    setInitialScheduleDays(fallbackSchedule);

    let cancelled = false;

    const loadSchedule = async () => {
      setIsScheduleFetching(true);
      try {
        const ranges = await getBranchWorkSchedule(branch.id.toString());
        if (cancelled || scheduleTouchedRef.current) return;
        const normalized = buildScheduleState(ranges as ScheduleRange[]);
        setScheduleDays(normalized);
        setInitialScheduleDays(normalized);
      } finally {
        if (!cancelled) setIsScheduleFetching(false);
      }
    };

    loadSchedule();

    return () => {
      cancelled = true;
    };
  }, [open, branch?.id, branch?.work_schedule, getBranchWorkSchedule]);

  const hasScheduleChanges = useMemo(() => {
    if (!scheduleDays.length || !initialScheduleDays.length) return false;

    return scheduleDays.some(day => {
      const initialDay = initialScheduleDays.find(
        item => item.weekday === day.weekday
      );

      if (!initialDay) return true;

      const enabledChanged = day.enabled !== initialDay.enabled;

      if (!day.enabled && !initialDay.enabled) {
        return enabledChanged;
      }

      return (
        enabledChanged ||
        day.start_time !== initialDay.start_time ||
        day.end_time !== initialDay.end_time ||
        day.time_zone !== initialDay.time_zone
      );
    });
  }, [scheduleDays, initialScheduleDays]);

  const handleToggleDay = (weekday: number, enabled: boolean) => {
    scheduleTouchedRef.current = true;
    setScheduleDays(prev =>
      prev.map(day => {
        if (day.weekday !== weekday) return day;
        if (!enabled) return { ...day, enabled: false };

        return {
          ...day,
          enabled: true,
          start_time: day.start_time || DEFAULT_START_TIME,
          end_time: day.end_time || DEFAULT_END_TIME,
          time_zone: day.time_zone || DEFAULT_TIME_ZONE,
        };
      })
    );
  };

  const handleTimeChange = (
    weekday: number,
    field: "start_time" | "end_time",
    value: string
  ) => {
    scheduleTouchedRef.current = true;
    setScheduleDays(prev =>
      prev.map(day =>
        day.weekday === weekday ? { ...day, [field]: value } : day
      )
    );
  };

  const applyScheduleChanges = async (branchId: string) => {
    const initialByWeekday = new Map(
      initialScheduleDays.map(day => [day.weekday, day])
    );
    const rangesToCreate: BranchWorkScheduleRange[] = [];
    const rangesToUpdate: Array<{ id: string; data: ScheduleUpdatePayload }> =
      [];
    const rangesToDelete: string[] = [];

    scheduleDays.forEach(day => {
      const initialDay = initialByWeekday.get(day.weekday);
      const initialId = initialDay?.id;
      const timeZone = day.time_zone || DEFAULT_TIME_ZONE;
      const startTime = day.start_time || DEFAULT_START_TIME;
      const endTime = day.end_time || DEFAULT_END_TIME;

      if (!day.enabled) {
        if (initialId) rangesToDelete.push(initialId);
        return;
      }

      if (initialId) {
        const hasUpdates =
          !initialDay ||
          day.start_time !== initialDay.start_time ||
          day.end_time !== initialDay.end_time ||
          timeZone !== initialDay.time_zone;

        if (hasUpdates) {
          rangesToUpdate.push({
            id: initialId,
            data: {
              start_time: startTime,
              end_time: endTime,
              weekday: day.weekday,
              time_zone: timeZone,
            },
          });
        }
        return;
      }

      rangesToCreate.push({
        branch_id: branchId,
        weekday: day.weekday,
        start_time: startTime,
        end_time: endTime,
        time_zone: timeZone,
        services: [],
      });
    });

    if (
      rangesToCreate.length === 0 &&
      rangesToUpdate.length === 0 &&
      rangesToDelete.length === 0
    ) {
      return null;
    }

    if (rangesToCreate.length > 0) {
      await createBranchWorkSchedule(branchId, {
        branch_work_ranges: rangesToCreate,
      });
    }

    for (const update of rangesToUpdate) {
      await updateWorkRange(branchId, update.id, update.data);
    }

    for (const rangeId of rangesToDelete) {
      await deleteWorkRange(branchId, rangeId);
    }

    const refreshed = await getBranchWorkSchedule(branchId);
    const normalized = buildScheduleState(refreshed as ScheduleRange[]);
    setScheduleDays(normalized);
    setInitialScheduleDays(normalized);
    scheduleTouchedRef.current = false;

    return refreshed;
  };

  const handleSave = async (values: BranchEditFormValues) => {
    if (!branch) return;

    setIsSaving(true);

    try {
      let updatedBranch = branch;

      if (formState.isDirty) {
        const response = await fetch(`/api/branch/${branch.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Erro ao atualizar filial");
        }

        updatedBranch = await response.json();

        reset(buildDefaultValues(updatedBranch));

        toast({
          title: "Filial atualizada!",
          description: "Os dados foram salvos com sucesso.",
        });
      }

      if (hasScheduleChanges) {
        const refreshedSchedule = await applyScheduleChanges(
          branch.id.toString()
        );

        if (refreshedSchedule) {
          updatedBranch = {
            ...updatedBranch,
            work_schedule: refreshedSchedule,
          };
        }
      }

      onSaved?.(updatedBranch);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar alteracoes",
        description:
          error instanceof Error
            ? error.message
            : "Nao foi possivel salvar as alteracoes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="border-b border-border px-6 pb-4 pt-6">
          <DialogTitle>
            {branch ? "Editar filial" : "Carregando filial"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Atualize as informacoes e os horarios da filial.
          </DialogDescription>
        </DialogHeader>

        {!branch ? (
          <div className="space-y-4 px-6 py-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(handleSave)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <Tabs
              value={activeTab}
              onValueChange={value => setActiveTab(value as EditTab)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <TabsList className="mx-6 mt-4 grid w-full grid-cols-2 max-w-[calc(100%-3rem)]">
                <TabsTrigger value="info">Informacoes</TabsTrigger>
                <TabsTrigger value="schedule">Horarios</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 px-6">
                <TabsContent value="info" className="mt-4 space-y-4 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="branch-name">Nome da filial *</Label>
                  <Input
                    id="branch-name"
                    placeholder="Ex: Unidade Centro"
                    {...register("name", { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch-street">Rua *</Label>
                  <Input
                    id="branch-street"
                    placeholder="Nome da rua"
                    {...register("street", { required: true })}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="branch-number">Numero *</Label>
                    <Input
                      id="branch-number"
                      placeholder="Numero"
                      {...register("number", { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-complement">Complemento</Label>
                    <Input
                      id="branch-complement"
                      placeholder="Apto, sala, etc."
                      {...register("complement")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="branch-neighborhood">Bairro</Label>
                    <Input
                      id="branch-neighborhood"
                      placeholder="Bairro"
                      {...register("neighborhood")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-zip">CEP *</Label>
                    <Input
                      id="branch-zip"
                      placeholder="00000-000"
                      {...register("zip_code", { required: true })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="branch-city">Cidade *</Label>
                    <Input
                      id="branch-city"
                      placeholder="Cidade"
                      {...register("city", { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch-state">Estado *</Label>
                    <Input
                      id="branch-state"
                      placeholder="Estado"
                      {...register("state", { required: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch-country">Pais *</Label>
                  <Input
                    id="branch-country"
                    placeholder="Pais"
                    {...register("country", { required: true })}
                  />
                </div>

                {/* TODO: add phone/email when backend supports these fields. */}
                </TabsContent>

                <TabsContent value="schedule" className="mt-4 space-y-3 pb-4">
                  <p className="text-sm text-muted-foreground">
                    Configure os horarios de funcionamento desta filial.
                  </p>

                  <div className="space-y-3">
                    {scheduleDays.length === 0
                      ? WEEKDAYS.map(day => (
                          <Skeleton
                            key={day.weekday}
                            className="h-12 w-full"
                          />
                        ))
                      : scheduleDays.map(day => (
                          <div
                            key={day.weekday}
                            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center"
                          >
                            <Switch
                              checked={day.enabled}
                              onCheckedChange={checked =>
                                handleToggleDay(day.weekday, checked)
                              }
                              disabled={isSaving || isScheduleFetching}
                            />
                            <span className="w-28 text-sm font-medium text-foreground">
                              {day.label}
                            </span>

                            {day.enabled ? (
                              <div className="flex flex-1 items-center gap-2">
                                <Input
                                  type="time"
                                  value={day.start_time}
                                  onChange={event =>
                                    handleTimeChange(
                                      day.weekday,
                                      "start_time",
                                      event.target.value
                                    )
                                  }
                                  className="h-9 w-28"
                                  disabled={isSaving || isScheduleFetching}
                                />
                                <span className="text-sm text-muted-foreground">
                                  as
                                </span>
                                <Input
                                  type="time"
                                  value={day.end_time}
                                  onChange={event =>
                                    handleTimeChange(
                                      day.weekday,
                                      "end_time",
                                      event.target.value
                                    )
                                  }
                                  className="h-9 w-28"
                                  disabled={isSaving || isScheduleFetching}
                                />
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Fechado
                              </span>
                            )}
                          </div>
                        ))}
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="btn-gradient"
                disabled={
                  !branch || isSaving || (!formState.isDirty && !hasScheduleChanges)
                }
              >
                {isSaving ? "Salvando..." : "Salvar alteracoes"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
