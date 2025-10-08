"use client";

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Plus, Trash2, Building2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useBranchWorkSchedule,
  BranchWorkScheduleRange,
} from "@/hooks/workSchedule/use-branch-work-schedule";
import { DIAS_SEMANA, HORARIOS, TIMEZONES } from "./constants";

interface BranchWorkScheduleFormProps {
  branchId: string;
  branchName?: string;
  initialData?: BranchWorkScheduleRange[];
  onSuccess?: () => void;
}

const DayConfigCard = memo(
  ({
    dia,
    ranges,
    onAdd,
    onRemove,
    onUpdate,
    onApplyToAll,
  }: {
    dia: (typeof DIAS_SEMANA)[number];
    ranges: BranchWorkScheduleRange[];
    onAdd: (weekday: number) => void;
    onRemove: (weekday: number, index: number) => void;
    onUpdate: (
      weekday: number,
      index: number,
      field: keyof BranchWorkScheduleRange,
      value: any
    ) => void;
    onApplyToAll: (weekday: number) => void;
  }) => {
    const hasSchedule = ranges.length > 0;

    return (
      <Card className="relative">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={hasSchedule ? "default" : "secondary"}>
                {dia.shortLabel}
              </Badge>
              <h4 className="font-medium">{dia.label}</h4>
            </div>
            <div className="flex items-center gap-2">
              {hasSchedule && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApplyToAll(dia.weekday)}
                  className="flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Aplicar para todos
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAdd(dia.weekday)}
                className="flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Adicionar Horário
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {ranges.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum horário configurado para este dia.
            </p>
          ) : (
            <div className="space-y-4">
              {ranges.map((range, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium min-w-[60px]">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={range.start_time}
                      onValueChange={value =>
                        onUpdate(dia.weekday, index, "start_time", value)
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HORARIOS.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-muted-foreground">até</span>

                    <Select
                      value={range.end_time}
                      onValueChange={value =>
                        onUpdate(dia.weekday, index, "end_time", value)
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HORARIOS.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(dia.weekday, index)}
                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

DayConfigCard.displayName = "DayConfigCard";

export function BranchWorkScheduleForm({
  branchId,
  branchName = "Filial",
  initialData = [],
  onSuccess,
}: BranchWorkScheduleFormProps) {
  const { toast } = useToast();
  const { createBranchWorkSchedule, loading } = useBranchWorkSchedule({
    onSuccess: () => onSuccess?.(),
  });

  const [selectedTimeZone, setSelectedTimeZone] = useState("America/Sao_Paulo");

  const initialRangesByDay = useMemo(() => {
    const rangesByDay = new Map<number, BranchWorkScheduleRange[]>();
    initialData.forEach(range => {
      const dayRanges = rangesByDay.get(range.weekday) || [];
      dayRanges.push(range);
      rangesByDay.set(range.weekday, dayRanges);
    });
    return rangesByDay;
  }, [initialData]);

  const [workRanges, setWorkRanges] = useState(initialRangesByDay);

  useEffect(() => {
    setWorkRanges(initialRangesByDay);
  }, [initialRangesByDay]);

  const adicionarHorario = useCallback(
    (weekday: number) => {
      setWorkRanges(prev => {
        const currentRanges = prev.get(weekday) || [];
        const newRange: BranchWorkScheduleRange = {
          branch_id: branchId,
          start_time: "09:00",
          end_time: "17:00",
          time_zone: selectedTimeZone,
          weekday,
          services: [],
        };
        return new Map(prev.set(weekday, [...currentRanges, newRange]));
      });
    },
    [branchId, selectedTimeZone]
  );

  const removerHorario = useCallback((weekday: number, index: number) => {
    setWorkRanges(prev => {
      const currentRanges = prev.get(weekday) || [];
      const updatedRanges = currentRanges.filter((_, i) => i !== index);
      const newMap = new Map(prev);

      if (updatedRanges.length === 0) {
        newMap.delete(weekday);
      } else {
        newMap.set(weekday, updatedRanges);
      }
      return newMap;
    });
  }, []);

  const atualizarHorario = useCallback(
    (
      weekday: number,
      index: number,
      field: keyof BranchWorkScheduleRange,
      value: any
    ) => {
      setWorkRanges(prev => {
        const currentRanges = prev.get(weekday) || [];
        const updatedRanges = currentRanges.map((range, i) =>
          i === index ? { ...range, [field]: value } : range
        );
        return new Map(prev.set(weekday, updatedRanges));
      });
    },
    []
  );

  const aplicarParaTodos = useCallback(
    (weekday: number) => {
      const sourceRanges = workRanges.get(weekday);
      if (!sourceRanges?.length) return;

      setWorkRanges(prev => {
        const newMap = new Map(prev);
        DIAS_SEMANA.forEach(dia => {
          if (dia.weekday !== weekday) {
            const copiedRanges = sourceRanges.map(range => ({
              ...range,
              weekday: dia.weekday,
            }));
            newMap.set(dia.weekday, copiedRanges);
          }
        });
        return newMap;
      });

      toast({
        title: "Horários aplicados",
        description: "Os horários foram copiados para todos os dias.",
      });
    },
    [workRanges, toast]
  );

  const salvarHorarios = useCallback(async () => {
    const allRanges: BranchWorkScheduleRange[] = [];
    workRanges.forEach(ranges => allRanges.push(...ranges));

    if (allRanges.length === 0) {
      toast({
        title: "Nenhum horário configurado",
        description: "Adicione pelo menos um horário de funcionamento.",
        variant: "destructive",
      });
      return;
    }

    await createBranchWorkSchedule(branchId, { branch_work_ranges: allRanges });
  }, [workRanges, branchId, createBranchWorkSchedule, toast]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Configurar Horários - {branchName}
        </CardTitle>
        <CardDescription>
          Configure os horários de funcionamento da filial. Estes horários
          determinam quando a filial está disponível para atendimento.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Fuso Horário</label>
          <Select value={selectedTimeZone} onValueChange={setSelectedTimeZone}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map(tz => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-6">
          {DIAS_SEMANA.map(dia => (
            <DayConfigCard
              key={dia.weekday}
              dia={dia}
              ranges={workRanges.get(dia.weekday) || []}
              onAdd={adicionarHorario}
              onRemove={removerHorario}
              onUpdate={atualizarHorario}
              onApplyToAll={aplicarParaTodos}
            />
          ))}
        </div>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button
            onClick={salvarHorarios}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            {loading ? "Salvando..." : "Salvar Horários"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
