"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useBranchWorkSchedule,
  type BranchWorkScheduleRange,
} from "@/hooks/workSchedule/use-branch-work-schedule";
import { useWorkRange } from "@/hooks/workSchedule/use-work-range";
import { useToast } from "@/hooks/use-toast";
import type { Branch } from "../../../../../types/company";

type BranchScheduleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch | null;
  onSaved?: (branch: Branch) => void;
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
  ranges: ScheduleRange[] | null | undefined,
): ScheduleDayState[] => {
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

export function BranchScheduleDialog({
  open,
  onOpenChange,
  branch,
  onSaved,
}: BranchScheduleDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [scheduleDays, setScheduleDays] = useState<ScheduleDayState[]>([]);
  const [initialScheduleDays, setInitialScheduleDays] = useState<
    ScheduleDayState[]
  >([]);
  const [isScheduleFetching, setIsScheduleFetching] = useState(false);
  const scheduleTouchedRef = useRef(false);

  const { getBranchWorkSchedule, createBranchWorkSchedule } =
    useBranchWorkSchedule();
  const { updateWorkRange, deleteWorkRange } = useWorkRange();

  useEffect(() => {
    if (!open || !branch) return;

    scheduleTouchedRef.current = false;
    const fallbackSchedule = buildScheduleState(
      branch.work_schedule as ScheduleRange[] | undefined,
    );
    setScheduleDays(fallbackSchedule);
    setInitialScheduleDays(fallbackSchedule);

    let cancelled = false;

    const loadSchedule = async () => {
      setIsScheduleFetching(true);
      try {
        const ranges = await getBranchWorkSchedule(branch.id.toString(), {
          showErrorToast: false,
        });
        if (cancelled || scheduleTouchedRef.current) return;
        const normalized = buildScheduleState(ranges as ScheduleRange[]);
        setScheduleDays(normalized);
        setInitialScheduleDays(normalized);
      } catch {
        if (cancelled || scheduleTouchedRef.current) return;
        // Keep fallback based on branch.work_schedule when request fails.
      } finally {
        if (!cancelled) setIsScheduleFetching(false);
      }
    };

    loadSchedule();

    return () => {
      cancelled = true;
    };
  }, [open, branch, getBranchWorkSchedule]);

  const hasScheduleChanges = useMemo(() => {
    if (!scheduleDays.length || !initialScheduleDays.length) return false;

    return scheduleDays.some(day => {
      const initialDay = initialScheduleDays.find(
        item => item.weekday === day.weekday,
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
      }),
    );
  };

  const handleTimeChange = (
    weekday: number,
    field: "start_time" | "end_time",
    value: string,
  ) => {
    scheduleTouchedRef.current = true;
    setScheduleDays(prev =>
      prev.map(day =>
        day.weekday === weekday ? { ...day, [field]: value } : day,
      ),
    );
  };

  const applyScheduleChanges = async (branchId: string) => {
    const initialByWeekday = new Map(
      initialScheduleDays.map(day => [day.weekday, day]),
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
      await createBranchWorkSchedule(
        branchId,
        {
          branch_work_ranges: rangesToCreate,
        },
        {
          showSuccessToast: false,
          showErrorToast: false,
        },
      );
    }

    if (rangesToUpdate.length > 0) {
      await Promise.all(
        rangesToUpdate.map(update =>
          updateWorkRange(branchId, update.id, update.data, {
            showSuccessToast: false,
            showErrorToast: false,
          }),
        ),
      );
    }

    if (rangesToDelete.length > 0) {
      await Promise.all(
        rangesToDelete.map(rangeId =>
          deleteWorkRange(branchId, rangeId, {
            showSuccessToast: false,
            showErrorToast: false,
          }),
        ),
      );
    }

    const refreshed = await getBranchWorkSchedule(branchId, {
      showErrorToast: false,
    });
    const normalized = buildScheduleState(refreshed as ScheduleRange[]);
    setScheduleDays(normalized);
    setInitialScheduleDays(normalized);
    scheduleTouchedRef.current = false;

    return refreshed;
  };

  const handleSave = async () => {
    if (!branch) return;

    if (!hasScheduleChanges) {
      onOpenChange(false);
      return;
    }

    setIsSaving(true);

    try {
      const refreshedSchedule = await applyScheduleChanges(
        branch.id.toString(),
      );

      if (refreshedSchedule) {
        onSaved?.({
          ...branch,
          work_schedule: refreshedSchedule,
        });
      }

      toast({
        title: "Horários atualizados!",
        description: "Os horários da filial foram salvos com sucesso.",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar horários",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar os horários.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="sticky top-0 z-10 border-b border-border bg-background px-6 pb-4 pt-6">
          <DialogTitle>
            {branch ? "Horários da filial" : "Carregando filial"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Configure os horários de funcionamento da filial.
          </DialogDescription>
        </DialogHeader>

        {!branch ? (
          <div className="space-y-4 px-6 py-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div>
            <div className="px-6">
              <div className="mt-4 space-y-4 pb-4">
                <p className="text-sm text-muted-foreground">
                  Configure os horários de funcionamento desta filial.
                </p>

                <div className="space-y-3">
                  {scheduleDays.length === 0
                    ? WEEKDAYS.map(day => (
                        <Skeleton key={day.weekday} className="h-12 w-full" />
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
                                    event.target.value,
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
                                    event.target.value,
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
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="btn-gradient"
                disabled={!branch || isSaving || !hasScheduleChanges}
                onClick={handleSave}
              >
                {isSaving ? "Salvando..." : "Salvar horários"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
