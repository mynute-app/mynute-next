"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useEmployeeWorkRange } from "@/hooks/workSchedule/use-employee-work-range";
import { useBranchApi } from "@/hooks/branch/use-branch-api";
import { useBranchWorkSchedule } from "@/hooks/workSchedule/use-branch-work-schedule";
import type { Branch, Employee } from "../../../../../types/company";

type ScheduleDayState = {
  weekday: number;
  label: string;
  enabled: boolean;
  start_time: string;
  end_time: string;
  time_zone: string;
  id?: string;
};

type BranchScheduleState = {
  branchId: string;
  branchName: string;
  days: ScheduleDayState[];
};

type NormalizedWorkRange = {
  id?: string;
  branch_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  time_zone: string;
};

type TeamMemberScheduleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Employee | null;
  setMember: React.Dispatch<React.SetStateAction<Employee | null>>;
  onReloadMember?: () => void;
  branches?: Branch[];
  loadingBranches?: boolean;
};

type BranchScheduleSource = {
  id: string | number;
  work_schedule?: any[];
};

const WEEKDAYS: Array<Pick<ScheduleDayState, "weekday" | "label">> = [
  { weekday: 1, label: "Segunda" },
  { weekday: 2, label: "Terca" },
  { weekday: 3, label: "Quarta" },
  { weekday: 4, label: "Quinta" },
  { weekday: 5, label: "Sexta" },
  { weekday: 6, label: "Sabado" },
  { weekday: 0, label: "Domingo" },
];

const DEFAULT_START_TIME = "08:00";
const DEFAULT_END_TIME = "17:00";
const DEFAULT_TIME_ZONE = "America/Sao_Paulo";

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
};

const getBranchDayRangeFromBranch = (
  branch: BranchScheduleSource | null,
  weekday: number
) => {
  const ranges = Array.isArray(branch?.work_schedule)
    ? branch?.work_schedule
    : [];

  const match = ranges.find(
    (range: any) => Number(range?.weekday) === Number(weekday)
  );

  if (!match) return null;

  const start = extractTime(match.start_time || match.start || "");
  const end = extractTime(match.end_time || match.end || "");
  if (!start || !end) return null;

  return { start, end };
};

const clampToBranchRange = (
  start: string,
  end: string,
  range: { start: string; end: string }
) => {
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  const branchStartMin = toMinutes(range.start);
  const branchEndMin = toMinutes(range.end);

  if (
    startMin === null ||
    endMin === null ||
    branchStartMin === null ||
    branchEndMin === null
  ) {
    return { start, end, adjusted: false };
  }

  let nextStart = startMin;
  let nextEnd = endMin;
  let adjusted = false;

  if (nextStart < branchStartMin) {
    nextStart = branchStartMin;
    adjusted = true;
  }
  if (nextEnd > branchEndMin) {
    nextEnd = branchEndMin;
    adjusted = true;
  }

  if (nextStart >= nextEnd) {
    nextStart = branchStartMin;
    nextEnd = branchEndMin;
    adjusted = true;
  }

  const format = (value: number) =>
    `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(
      value % 60
    ).padStart(2, "0")}`;

  return {
    start: format(nextStart),
    end: format(nextEnd),
    adjusted,
  };
};

const extractTime = (value?: string) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toTimeString().slice(0, 5);
    }
  } catch {}
  return value.includes(":") ? value.slice(0, 5) : "";
};

const normalizeWorkSchedule = (ranges: any[]): NormalizedWorkRange[] => {
  if (!Array.isArray(ranges)) return [];

  return ranges
    .map(range => {
      const branchId = range?.branch_id ?? range?.branch?.id ?? "";
      return {
        id: range?.id ? String(range.id) : undefined,
        branch_id: branchId ? String(branchId) : "",
        weekday: Number(range?.weekday ?? 0),
        start_time: extractTime(range?.start_time || range?.start || ""),
        end_time: extractTime(range?.end_time || range?.end || ""),
        time_zone: range?.time_zone || DEFAULT_TIME_ZONE,
      };
    })
    .filter(range => range.branch_id);
};

const buildBranchSchedules = (
  branches: Branch[],
  ranges: NormalizedWorkRange[]
): BranchScheduleState[] => {
  const rangesByBranch = new Map<string, NormalizedWorkRange[]>();

  ranges.forEach(range => {
    if (!rangesByBranch.has(range.branch_id)) {
      rangesByBranch.set(range.branch_id, []);
    }
    rangesByBranch.get(range.branch_id)?.push(range);
  });

  return branches.map(branch => {
    const branchId = String(branch.id);
    const branchRanges = rangesByBranch.get(branchId) || [];
    const byWeekday = new Map<number, NormalizedWorkRange>();

    branchRanges.forEach(range => {
      if (!byWeekday.has(range.weekday)) {
        byWeekday.set(range.weekday, range);
      }
    });

    const days = WEEKDAYS.map(day => {
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

      return {
        ...day,
        enabled: Boolean(range.id || range.start_time || range.end_time),
        start_time: range.start_time,
        end_time: range.end_time,
        time_zone: range.time_zone || DEFAULT_TIME_ZONE,
        id: range.id,
      };
    });

    return {
      branchId,
      branchName: branch.name,
      days,
    };
  });
};

export function TeamMemberScheduleDialog({
  open,
  onOpenChange,
  member,
  setMember,
  onReloadMember,
  branches = [],
  loadingBranches = false,
}: TeamMemberScheduleDialogProps) {
  const { toast } = useToast();
  const { fetchBranchById } = useBranchApi();
  const { getBranchWorkSchedule } = useBranchWorkSchedule();
  const availableBranches = useMemo(
    () =>
      (branches ?? []).filter(
        branch => branch && typeof branch.name === "string"
      ),
    [branches]
  );

  const [branchSchedules, setBranchSchedules] = useState<BranchScheduleState[]>(
    []
  );
  const [branchScheduleCache, setBranchScheduleCache] = useState<
    Record<string, BranchScheduleSource | null>
  >({});
  const {
    createEmployeeWorkRange,
    updateEmployeeWorkRange,
    deleteEmployeeWorkRange,
    loading: isScheduleLoading,
  } = useEmployeeWorkRange();

  const resolveBranchSchedule = async (branchId: string) => {
    if (branchScheduleCache[branchId]) {
      return branchScheduleCache[branchId];
    }

    const localBranch = availableBranches.find(
      branch => String(branch.id) === String(branchId)
    );

    if (localBranch?.work_schedule) {
      setBranchScheduleCache(prev => ({ ...prev, [branchId]: localBranch }));
      return localBranch;
    }

    const fetched = await fetchBranchById(branchId);

    if (fetched?.work_schedule) {
      setBranchScheduleCache(prev => ({ ...prev, [branchId]: fetched }));
      return fetched;
    }

    try {
      const ranges = await getBranchWorkSchedule(branchId);
      const hydrated: BranchScheduleSource = fetched
        ? { ...fetched, work_schedule: ranges }
        : { id: branchId, work_schedule: ranges };
      setBranchScheduleCache(prev => ({ ...prev, [branchId]: hydrated }));
      return hydrated;
    } catch {
      setBranchScheduleCache(prev => ({
        ...prev,
        [branchId]: fetched ?? null,
      }));
      return fetched ?? null;
    }
  };

  useEffect(() => {
    if (!member) {
      setBranchSchedules([]);
      return;
    }

    const normalizedRanges = normalizeWorkSchedule(
      Array.isArray(member.work_schedule) ? member.work_schedule : []
    );
    setBranchSchedules(
      buildBranchSchedules(availableBranches, normalizedRanges)
    );
  }, [member, availableBranches]);

  const linkedBranchIds = new Set(
    member?.branches?.map(branch => branch.id.toString()) ?? []
  );

  const handleLinkBranch = async (branch: Branch) => {
    if (!member) return;

    try {
      const res = await fetch(
        `/api/employee/branch/${member.id}/branch/${branch.id}`,
        { method: "POST" }
      );

      if (!res.ok) throw new Error("Erro ao vincular a filial");

      setMember(prev => {
        if (!prev) return prev;
        const nextBranches = Array.isArray(prev.branches)
          ? [...prev.branches, branch]
          : [branch];
        return { ...prev, branches: nextBranches };
      });

      toast({
        title: "Filial vinculada",
        description: `A filial foi vinculada ao profissional ${member.name}.`,
      });
      onReloadMember?.();
    } catch (err) {
      toast({
        title: "Erro ao vincular",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleUnlinkBranch = async (branch: Branch) => {
    if (!member) return;

    try {
      const res = await fetch(
        `/api/employee/branch/${member.id}/branch/${branch.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Erro ao desvincular a filial");

      setMember(prev => {
        if (!prev) return prev;
        const nextBranches = Array.isArray(prev.branches)
          ? prev.branches.filter(item => item.id !== branch.id)
          : [];
        return { ...prev, branches: nextBranches };
      });

      toast({
        title: "Filial desvinculada",
        description: `A filial foi removida do profissional ${member.name}.`,
        variant: "destructive",
      });
      onReloadMember?.();
    } catch (err) {
      toast({
        title: "Erro ao desvincular",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleToggleBranch = async (branch: Branch) => {
    if (!branch?.id) return;
    if (linkedBranchIds.has(branch.id.toString())) {
      await handleUnlinkBranch(branch);
      return;
    }
    await handleLinkBranch(branch);
  };

  const updateBranchDayState = (
    branchId: string,
    weekday: number,
    updater: (day: ScheduleDayState) => ScheduleDayState
  ) => {
    setBranchSchedules(prev =>
      prev.map(branch => {
        if (branch.branchId !== branchId) return branch;
        return {
          ...branch,
          days: branch.days.map(day =>
            day.weekday === weekday ? updater(day) : day
          ),
        };
      })
    );
  };

  const handleToggleScheduleDay = async (
    branchId: string,
    weekday: number,
    enabled: boolean
  ) => {
    if (!member) return;

    const branch = branchSchedules.find(
      schedule => schedule.branchId === branchId
    );
    const day = branch?.days.find(item => item.weekday === weekday);
    if (!day) return;

    const previousDay = { ...day };
    let nextStart = day.start_time || DEFAULT_START_TIME;
    let nextEnd = day.end_time || DEFAULT_END_TIME;

    const branchData = enabled ? await resolveBranchSchedule(branchId) : null;
    const branchRange = enabled
      ? getBranchDayRangeFromBranch(branchData, weekday)
      : null;

    if (enabled && !branchRange) {
      toast({
        title: "Horario da filial nao configurado",
        description:
          "Defina o horario de funcionamento da filial para este dia antes de vincular o profissional.",
        variant: "destructive",
      });
      updateBranchDayState(branchId, weekday, () => previousDay);
      return;
    }

    if (branchRange) {
      const adjusted = clampToBranchRange(nextStart, nextEnd, branchRange);
      if (adjusted.adjusted) {
        nextStart = adjusted.start;
        nextEnd = adjusted.end;
        toast({
          title: "Horario ajustado",
          description:
            "O horario do profissional foi ajustado para respeitar o horario da filial.",
        });
      }
    }

    const nextDay = enabled
      ? {
          ...day,
          enabled: true,
          start_time: nextStart,
          end_time: nextEnd,
          time_zone: day.time_zone || DEFAULT_TIME_ZONE,
        }
      : { ...day, enabled: false };

    updateBranchDayState(branchId, weekday, () => nextDay);

    try {
      const employeeId = member.id.toString();
      if (!enabled) {
        if (day.id) {
          await deleteEmployeeWorkRange(employeeId, day.id);
          updateBranchDayState(branchId, weekday, current => ({
            ...current,
            id: undefined,
          }));
        }
        onReloadMember?.();
        return;
      }

      const payload = {
        branch_id: branchId,
        weekday,
        start_time: nextDay.start_time,
        end_time: nextDay.end_time,
        time_zone: nextDay.time_zone || DEFAULT_TIME_ZONE,
      };

      if (day.id) {
        await updateEmployeeWorkRange(employeeId, day.id, payload);
      } else {
        const result = await createEmployeeWorkRange(employeeId, payload);
        const created = (result as { data?: { id?: string | number } })?.data;
        const createdId = created?.id ? String(created.id) : undefined;
        if (createdId) {
          updateBranchDayState(branchId, weekday, current => ({
            ...current,
            id: createdId,
          }));
        }
      }

      onReloadMember?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        message
          .toLowerCase()
          .includes("not within any defined branch operating hours")
      ) {
        toast({
          title: "Horario invalido",
          description:
            "O horario do profissional precisa estar dentro do horario da filial.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao salvar horario",
          description: "Nao foi possivel salvar o horario do profissional.",
          variant: "destructive",
        });
      }
      updateBranchDayState(branchId, weekday, () => previousDay);
    }
  };

  const handleScheduleTimeChange = async (
    branchId: string,
    weekday: number,
    field: "start_time" | "end_time",
    value: string
  ) => {
    if (!member) return;

    const branch = branchSchedules.find(
      schedule => schedule.branchId === branchId
    );
    const day = branch?.days.find(item => item.weekday === weekday);
    if (!day) return;

    const previousDay = { ...day };
    let nextDay = {
      ...day,
      [field]: value,
    };

    const branchData = await resolveBranchSchedule(branchId);
    const branchRange = getBranchDayRangeFromBranch(branchData, weekday);

    if (!branchRange) {
      toast({
        title: "Horario da filial nao configurado",
        description:
          "Defina o horario de funcionamento da filial para este dia antes de ajustar o horario do profissional.",
        variant: "destructive",
      });
      updateBranchDayState(branchId, weekday, () => previousDay);
      return;
    }

    if (branchRange && nextDay.start_time && nextDay.end_time) {
      const adjusted = clampToBranchRange(
        nextDay.start_time,
        nextDay.end_time,
        branchRange
      );
      if (adjusted.adjusted) {
        nextDay = {
          ...nextDay,
          start_time: adjusted.start,
          end_time: adjusted.end,
        };
        toast({
          title: "Horario ajustado",
          description:
            "O horario do profissional precisa estar dentro do horario da filial.",
        });
      }
    }

    updateBranchDayState(branchId, weekday, () => nextDay);

    if (!nextDay.start_time || !nextDay.end_time) return;

    try {
      const employeeId = member.id.toString();
      const payload = {
        branch_id: branchId,
        weekday,
        start_time: nextDay.start_time,
        end_time: nextDay.end_time,
        time_zone: nextDay.time_zone || DEFAULT_TIME_ZONE,
      };

      if (day.id) {
        await updateEmployeeWorkRange(employeeId, day.id, payload);
      } else {
        const result = await createEmployeeWorkRange(employeeId, payload);
        const created = (result as { data?: { id?: string | number } })?.data;
        const createdId = created?.id ? String(created.id) : undefined;
        if (createdId) {
          updateBranchDayState(branchId, weekday, current => ({
            ...current,
            id: createdId,
            enabled: true,
          }));
        }
      }

      onReloadMember?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        message
          .toLowerCase()
          .includes("not within any defined branch operating hours")
      ) {
        toast({
          title: "Horario invalido",
          description:
            "O horario do profissional precisa estar dentro do horario da filial.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao salvar horario",
          description: "Nao foi possivel salvar o horario do profissional.",
          variant: "destructive",
        });
      }
      updateBranchDayState(branchId, weekday, () => previousDay);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl h-[90vh] min-h-0 flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>
            {member ? "Filiais e horarios" : "Carregando profissional..."}
          </DialogTitle>
          <DialogDescription>
            {member
              ? "Selecione as filiais onde este profissional atende e ajuste os horarios de atendimento."
              : "Aguarde enquanto carregamos as informacoes do profissional."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 px-6">
          {!member ? (
            <div className="py-6 text-sm text-muted-foreground">
              Buscando dados do profissional...
            </div>
          ) : (
            <div className="mt-4 pb-6 space-y-6">
              <div className="space-y-3">
                <Label>Filiais vinculadas ao profissional</Label>
                <p className="text-sm text-muted-foreground">
                  Selecione as filiais onde este profissional atende.
                </p>
                <div className="flex flex-wrap gap-2">
                  {loadingBranches ? (
                    <span className="text-sm text-muted-foreground">
                      Carregando filiais...
                    </span>
                  ) : availableBranches.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      Nenhuma filial cadastrada
                    </span>
                  ) : (
                    availableBranches.map(branch => {
                      const isLinked = linkedBranchIds.has(
                        branch.id.toString()
                      );
                      return (
                        <button
                          key={branch.id}
                          type="button"
                          onClick={() => handleToggleBranch(branch)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                            isLinked
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                          {branch.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {linkedBranchIds.size === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>
                    Selecione ao menos uma filial para configurar os horarios.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 pt-4">
                  {branchSchedules
                    .filter(branch => linkedBranchIds.has(branch.branchId))
                    .map(branch => (
                      <div key={branch.branchId} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <Label className="text-base font-semibold">
                            {branch.branchName}
                          </Label>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                          {branch.days.map(day => (
                            <div
                              key={`${branch.branchId}-${day.weekday}`}
                              className="flex items-center gap-3 py-2"
                            >
                              <Switch
                                checked={day.enabled}
                                onCheckedChange={checked =>
                                  handleToggleScheduleDay(
                                    branch.branchId,
                                    day.weekday,
                                    checked
                                  )
                                }
                                disabled={isScheduleLoading}
                              />
                              <span className="w-20 text-sm font-medium">
                                {day.label}
                              </span>

                              {day.enabled ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="time"
                                    value={day.start_time}
                                    onChange={event =>
                                      handleScheduleTimeChange(
                                        branch.branchId,
                                        day.weekday,
                                        "start_time",
                                        event.target.value
                                      )
                                    }
                                    className="w-28 h-9"
                                    disabled={isScheduleLoading}
                                  />
                                  <span className="text-muted-foreground text-sm">
                                    as
                                  </span>
                                  <Input
                                    type="time"
                                    value={day.end_time}
                                    onChange={event =>
                                      handleScheduleTimeChange(
                                        branch.branchId,
                                        day.weekday,
                                        "end_time",
                                        event.target.value
                                      )
                                    }
                                    className="w-28 h-9"
                                    disabled={isScheduleLoading}
                                  />
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  Folga
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
