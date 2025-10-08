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
import { Clock, Plus, Trash2, Copy, Calendar } from "lucide-react";
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
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
        {/* Cabeçalho do Dia */}
        <div className="flex items-center gap-2 sm:min-w-[120px]">
          <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-sm">{dia.label}</p>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 min-w-0 space-y-2">
          {ranges.length === 0 ? (
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                Não configurado
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAdd(dia.weekday)}
                className="h-8 px-2 gap-1 flex-shrink-0"
              >
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline">Configurar</span>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {ranges.map((range, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 flex-wrap justify-between p-2 border rounded-md bg-muted/30"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />

                      <Select
                        value={range.start_time}
                        onValueChange={value =>
                          onUpdate(dia.weekday, index, "start_time", value)
                        }
                      >
                        <SelectTrigger className="h-8 w-[80px]">
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

                      <span className="text-xs text-muted-foreground">-</span>

                      <Select
                        value={range.end_time}
                        onValueChange={value =>
                          onUpdate(dia.weekday, index, "end_time", value)
                        }
                      >
                        <SelectTrigger className="h-8 w-[80px]">
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
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(dia.weekday, index)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Ações do Dia */}
              <div className="flex items-center gap-1 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAdd(dia.weekday)}
                  className="h-7 px-2 gap-1 text-xs"
                >
                  <Plus className="w-3 h-3" />
                  Adicionar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onApplyToAll(dia.weekday)}
                  className="h-7 px-2 gap-1 text-xs"
                >
                  <Copy className="w-3 h-3" />
                  Copiar p/ todos
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
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
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5" />
              Configurar Horários
            </CardTitle>
            <CardDescription className="mt-1">
              {branchName} • Defina os horários de funcionamento da filial
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-0">
        {/* Seletor de Fuso Horário */}
        <div className="flex items-center gap-4 p-3 border rounded-lg bg-muted/30">
          <label className="text-sm font-medium min-w-[100px]">
            Fuso Horário
          </label>
          <Select value={selectedTimeZone} onValueChange={setSelectedTimeZone}>
            <SelectTrigger className="flex-1 max-w-md">
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

        {/* Lista de Dias */}
        <div className="space-y-2">
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

        {/* Botão de Salvar */}
        <div className="flex justify-end">
          <Button
            onClick={salvarHorarios}
            disabled={loading}
            size="lg"
            className="gap-2 min-w-[160px]"
          >
            <Clock className="w-4 h-4" />
            {loading ? "Salvando..." : "Salvar Configuração"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
