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
import { Clock, Plus, Trash2, Copy } from "lucide-react";
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
    const hasRanges = ranges.length > 0;

    return (
      <div className="group relative">
        <div className="flex items-center gap-3 p-4 border rounded-lg hover:border-primary/50 transition-all bg-card hover:shadow-sm">
          {/* Indicador visual */}
          <div
            className={`w-1 h-12 rounded-full flex-shrink-0 ${
              hasRanges ? "bg-primary" : "bg-muted"
            }`}
          />

          {/* Nome do dia */}
          <div className="min-w-[100px]">
            <p className="font-semibold text-sm">{dia.label}</p>
            <p className="text-xs text-muted-foreground">{dia.shortLabel}</p>
          </div>

          {/* Horários ou estado vazio */}
          <div className="flex-1 min-w-0">
            {!hasRanges ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Fechado
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAdd(dia.weekday)}
                  className="ml-auto h-8 gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Definir horário
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {ranges.map((range, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2.5 rounded-md bg-muted/50 border border-muted"
                  >
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                    <div className="flex items-center gap-2">
                      <Select
                        value={range.start_time}
                        onValueChange={value =>
                          onUpdate(dia.weekday, index, "start_time", value)
                        }
                      >
                        <SelectTrigger className="h-9 w-[90px] border-0 bg-background shadow-sm">
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

                      <span className="text-sm text-muted-foreground font-medium">
                        às
                      </span>

                      <Select
                        value={range.end_time}
                        onValueChange={value =>
                          onUpdate(dia.weekday, index, "end_time", value)
                        }
                      >
                        <SelectTrigger className="h-9 w-[90px] border-0 bg-background shadow-sm">
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
                      className="ml-auto h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {/* Botões de ação quando tem horários */}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAdd(dia.weekday)}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar período
                  </Button>
                  {ranges.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onApplyToAll(dia.weekday)}
                      className="h-8 text-xs gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Replicar para todos
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
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

  // Fuso horário fixo para América/São Paulo
  const TIME_ZONE = "America/Sao_Paulo";

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
          time_zone: TIME_ZONE,
          weekday,
          services: [],
        };
        return new Map(prev.set(weekday, [...currentRanges, newRange]));
      });
    },
    [branchId]
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
    <Card className="w-full border-2">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="flex items-center gap-2.5 text-xl">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          Configurar Horários de Funcionamento
        </CardTitle>
        <CardDescription className="text-base">
          Defina quando <span className="font-medium">{branchName}</span> estará
          aberta para atendimento durante a semana
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lista de Dias */}
        <div className="space-y-3">
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

        <Separator className="my-6" />

        {/* Informação e Botão de Salvar */}
        <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex-1">
            <p className="text-sm font-medium">
              Configure pelo menos um dia da semana
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Os horários determinam quando a filial está disponível
            </p>
          </div>
          <Button
            onClick={salvarHorarios}
            disabled={loading}
            size="lg"
            className="gap-2 min-w-[180px] shadow-sm"
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                Salvar Horários
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
