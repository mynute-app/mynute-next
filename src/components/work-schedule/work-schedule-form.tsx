"use client";

import { useEffect, useState } from "react";
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
import { Clock, Plus, Trash2, MapPin} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useWorkSchedule,
  WorkScheduleRange,
} from "@/hooks/workSchedule/use-work-schedule";
import { useEmployeeWorkRange } from "@/hooks/workSchedule/use-employee-work-range";

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

interface WorkScheduleFormProps {
  employeeId: string;
  initialData?: WorkScheduleRange[];
  branches?: Array<{ id: string; name: string }>;
  services?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function WorkScheduleForm({
  employeeId,
  initialData = [],
  branches = [],
  services = [],
  onSuccess,
}: WorkScheduleFormProps) {
  const [workRanges, setWorkRanges] = useState<
    Map<number, WorkScheduleRange[]>
  >(new Map());
  const [selectedTimeZone, setSelectedTimeZone] = useState("America/Sao_Paulo");

  const { createWorkSchedule, addWorkScheduleRanges, loading } =
    useWorkSchedule({
      onSuccess: () => {
        onSuccess?.();
      },
    });

  // Hook para criar work_range individual (mantido para compatibilidade)
  const { createEmployeeWorkRange, loading: createLoading } =
    useEmployeeWorkRange({
      onSuccess: () => {
        onSuccess?.();
      },
    });

  const { toast } = useToast();

  // Loading combinado
  const isLoading = loading || createLoading;

  // Organizar dados iniciais por dia da semana
  useEffect(() => {
    if (initialData.length > 0) {
      const rangesByDay = new Map<number, WorkScheduleRange[]>();

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
    const defaultBranchId = branches.length > 0 ? branches[0].id : "";

    const newRange: WorkScheduleRange = {
      branch_id: defaultBranchId,
      employee_id: employeeId,
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
    field: keyof WorkScheduleRange,
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
    console.log("💾 Componente - Iniciando salvarHorarios");
    console.log("📊 Componente - workRanges atual:", workRanges);

    const allRanges: WorkScheduleRange[] = [];

    workRanges.forEach(ranges => {
      console.log("📋 Componente - Processando ranges:", ranges);
      allRanges.push(...ranges);
    });

    console.log(
      "🔍 Componente - allRanges final:",
      JSON.stringify(allRanges, null, 2)
    );

    if (allRanges.length === 0) {
      toast({
        title: "Nenhum horário configurado",
        description: "Adicione pelo menos um horário de trabalho.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("🚀 Componente - Usando addWorkScheduleRanges");

      // Usar a nova função que combina existentes com novos
      await addWorkScheduleRanges(employeeId, allRanges);

      toast({
        title: "Horários salvos!",
        description: "Todos os horários foram configurados com sucesso.",
      });
    } catch (error) {
      console.error("❌ Componente - Erro ao salvar horários:", error);
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
          <Clock className="w-5 h-5" />
          Jornada de Trabalho
        </CardTitle>
        <CardDescription>
          Configure os horários de trabalho para cada dia da semana
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Seletor de Timezone */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Fuso horário:</label>
          <Select value={selectedTimeZone} onValueChange={setSelectedTimeZone}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Sao_Paulo">
                São Paulo (GMT-3)
              </SelectItem>
              <SelectItem value="America/New_York">
                Nova York (GMT-5)
              </SelectItem>
              <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Dias da semana */}
        <div className="space-y-4">
          {diasSemana.map(dia => (
            <div key={dia.weekday} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={temHorarios(dia.weekday) ? "default" : "outline"}
                  >
                    {dia.shortLabel}
                  </Badge>
                  <span className="font-medium">{dia.label}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adicionarHorario(dia.weekday)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>

                  {dia.weekday === 1 && temHorarios(1) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => aplicarParaTodos(1)}
                    >
                      Aplicar para todos
                    </Button>
                  )}
                </div>
              </div>

              {/* Horários do dia */}
              <div className="space-y-3">
                {workRanges.get(dia.weekday)?.map((range, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-md"
                  >
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
                      <SelectTrigger className="w-24">
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
                        atualizarHorario(dia.weekday, index, "end_time", value)
                      }
                    >
                      <SelectTrigger className="w-24">
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

                    {branches.length > 0 && (
                      <>
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <Select
                          value={range.branch_id}
                          onValueChange={value =>
                            atualizarHorario(
                              dia.weekday,
                              index,
                              "branch_id",
                              value
                            )
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map(branch => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removerHorario(dia.weekday, index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum horário configurado
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Botão de salvar */}
        <Button
          onClick={salvarHorarios}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Salvando..." : "Salvar Horários"}
        </Button>
      </CardContent>
    </Card>
  );
}
