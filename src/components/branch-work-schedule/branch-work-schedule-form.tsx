"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBranchWorkSchedule,
  BranchWorkScheduleRange,
} from "@/hooks/workSchedule/use-branch-work-schedule";

type DiaSemana = {
  weekday: number;
  label: string;
  shortLabel: string;
};

const diasSemana: DiaSemana[] = [
  { weekday: 1, label: "Segunda-feira", shortLabel: "SEG" },
  { weekday: 2, label: "Terça-feira", shortLabel: "TER" },
  { weekday: 3, label: "Quarta-feira", shortLabel: "QUA" },
  { weekday: 4, label: "Quinta-feira", shortLabel: "QUI" },
  { weekday: 5, label: "Sexta-feira", shortLabel: "SEX" },
  { weekday: 6, label: "Sábado", shortLabel: "SAB" },
  { weekday: 0, label: "Domingo", shortLabel: "DOM" },
];

const gerarHorarios = () => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      times.push(timeString);
    }
  }
  return times;
};

const opcoesHorario = gerarHorarios();

interface BranchWorkScheduleFormProps {
  branchId: string;
  branchName?: string;
  initialData?: BranchWorkScheduleRange[];
  services?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function BranchWorkScheduleForm({
  branchId,
  branchName = "Filial",
  initialData = [],
  services = [],
  onSuccess,
}: BranchWorkScheduleFormProps) {
  const [workRanges, setWorkRanges] = useState<
    Map<number, BranchWorkScheduleRange[]>
  >(new Map());
  const [selectedTimeZone, setSelectedTimeZone] = useState("America/Sao_Paulo");

  const { createBranchWorkSchedule, loading } = useBranchWorkSchedule({
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const { toast } = useToast();

  // Organizar dados iniciais por dia da semana
  useEffect(() => {
    if (initialData.length > 0) {
      const rangesByDay = new Map<number, BranchWorkScheduleRange[]>();

      initialData.forEach(range => {
        const dayRanges = rangesByDay.get(range.weekday) || [];
        dayRanges.push(range);
        rangesByDay.set(range.weekday, dayRanges);
      });

      setWorkRanges(rangesByDay);
    }
  }, [initialData]);

  const adicionarHorario = (weekday: number) => {
    const currentRanges = workRanges.get(weekday) || [];

    const newRange: BranchWorkScheduleRange = {
      branch_id: branchId,
      start_time: "09:00",
      end_time: "17:00",
      time_zone: selectedTimeZone,
      weekday,
      services: [],
    };

    setWorkRanges(
      prev => new Map(prev.set(weekday, [...currentRanges, newRange]))
    );
  };

  const removerHorario = (weekday: number, index: number) => {
    const currentRanges = workRanges.get(weekday) || [];
    const updatedRanges = currentRanges.filter((_, i) => i !== index);

    if (updatedRanges.length === 0) {
      setWorkRanges(prev => {
        const newMap = new Map(prev);
        newMap.delete(weekday);
        return newMap;
      });
    } else {
      setWorkRanges(prev => new Map(prev.set(weekday, updatedRanges)));
    }
  };

  const atualizarHorario = (
    weekday: number,
    index: number,
    field: keyof BranchWorkScheduleRange,
    value: any
  ) => {
    const currentRanges = workRanges.get(weekday) || [];
    const updatedRanges = currentRanges.map((range, i) =>
      i === index ? { ...range, [field]: value } : range
    );

    setWorkRanges(prev => new Map(prev.set(weekday, updatedRanges)));
  };

  const aplicarParaTodos = (weekday: number) => {
    const sourceRanges = workRanges.get(weekday);
    if (!sourceRanges || sourceRanges.length === 0) return;

    const newWorkRanges = new Map(workRanges);

    diasSemana.forEach(dia => {
      if (dia.weekday !== weekday) {
        const copiedRanges = sourceRanges.map(range => ({
          ...range,
          weekday: dia.weekday,
        }));
        newWorkRanges.set(dia.weekday, copiedRanges);
      }
    });

    setWorkRanges(newWorkRanges);

    toast({
      title: "Horários aplicados",
      description: "Os horários foram copiados para todos os dias.",
    });
  };

  const salvarHorarios = async () => {
    const allRanges: BranchWorkScheduleRange[] = [];

    workRanges.forEach(ranges => {
      allRanges.push(...ranges);
    });

    if (allRanges.length === 0) {
      toast({
        title: "Nenhum horário configurado",
        description: "Adicione pelo menos um horário de funcionamento.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createBranchWorkSchedule(branchId, {
        branch_work_ranges: allRanges,
      });
    } catch (error) {
      console.error("❌ Branch Form - Erro ao salvar horários:", error);
    }
  };

  const temHorarios = (weekday: number) => {
    return (
      workRanges.has(weekday) && (workRanges.get(weekday)?.length ?? 0) > 0
    );
  };

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
        {/* Timezone Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Fuso Horário</label>
          <Select value={selectedTimeZone} onValueChange={setSelectedTimeZone}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Sao_Paulo">
                América/São Paulo (GMT-3)
              </SelectItem>
              <SelectItem value="America/New_York">
                América/Nova York (GMT-5)
              </SelectItem>
              <SelectItem value="Europe/London">
                Europa/Londres (GMT+0)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Configuração por dia */}
        <div className="space-y-6">
          {diasSemana.map(dia => {
            const ranges = workRanges.get(dia.weekday) || [];
            const hasSchedule = ranges.length > 0;

            return (
              <Card key={dia.weekday} className="relative">
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
                          onClick={() => aplicarParaTodos(dia.weekday)}
                          className="flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Aplicar para todos
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adicionarHorario(dia.weekday)}
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
                                atualizarHorario(
                                  dia.weekday,
                                  index,
                                  "start_time",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {opcoesHorario.map(time => (
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
                                atualizarHorario(
                                  dia.weekday,
                                  index,
                                  "end_time",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {opcoesHorario.map(time => (
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
                            onClick={() => removerHorario(dia.weekday, index)}
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
          })}
        </div>

        <Separator />

        {/* Botão Salvar */}
        <div className="flex justify-end gap-2">
          <Button
            onClick={salvarHorarios}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Skeleton className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            {loading ? "Salvando..." : "Salvar Horários"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
