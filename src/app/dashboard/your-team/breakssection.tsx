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
import { Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useUpdateWorkSchedule } from "@/hooks/use-update-work-schedule";
import { useToast } from "@/hooks/use-toast";

type DiaSemana =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const diasSemana: Record<DiaSemana, string> = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

const gerarHorarios = () => {
  const times: string[] = [];
  const start = 7 * 60;
  const end = 21 * 60;

  for (let minutes = start; minutes <= end; minutes += 15) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const suffix = h >= 12 ? "PM" : "AM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    const formatted = `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
    times.push(formatted);
  }

  return times;
};

const opcoesHorario = gerarHorarios();

type Horario = {
  ativo: boolean;
  inicio: string;
  fim: string;
};

type Agenda = {
  [dia in DiaSemana]: Horario;
};

type BreaksSectionProps = {
  selectedMember: { id: number } | null;
};

export function BreaksSection({ selectedMember }: BreaksSectionProps) {
  const { toast } = useToast();
  const [agenda, setAgenda] = useState<Agenda>(
    () =>
      Object.fromEntries(
        Object.keys(diasSemana).map(dia => [
          dia,
          {
            ativo: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
            ].includes(dia),
            inicio: "7:00 AM",
            fim: "5:00 PM",
          },
        ])
      ) as Agenda
  );

  const { updateWorkSchedule, loading, success, error } =
    useUpdateWorkSchedule();

  const alternarDia = (dia: DiaSemana) => {
    setAgenda(prev => ({
      ...prev,
      [dia]: { ...prev[dia], ativo: !prev[dia].ativo },
    }));
  };

  const atualizarHorario = (
    dia: DiaSemana,
    campo: "inicio" | "fim",
    valor: string
  ) => {
    setAgenda(prev => ({
      ...prev,
      [dia]: { ...prev[dia], [campo]: valor },
    }));
  };

  const aplicarParaTodos = (diaBase: DiaSemana) => {
    const { inicio, fim } = agenda[diaBase];
    const novaAgenda: Agenda = { ...agenda };

    Object.keys(novaAgenda).forEach(dia => {
      const key = dia as DiaSemana;
      if (key !== diaBase && novaAgenda[key].ativo) {
        novaAgenda[key] = { ...novaAgenda[key], inicio, fim };
      }
    });

    setAgenda(novaAgenda);
  };

  const converterPara24h = (hora12h: string) => {
    const [time, modifier] = hora12h.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const salvar = async () => {
    if (!selectedMember) return;

    const work_schedule = Object.fromEntries(
      Object.entries(agenda).map(([dia, { ativo, inicio, fim }]) => {
        if (!ativo) return [dia, []];
        return [
          dia,
          [
            {
              branch_id: 1,
              start: converterPara24h(inicio),
              end: converterPara24h(fim),
            },
          ],
        ];
      })
    );

    const payload = {
      employeeId: selectedMember.id,
      workSchedule: work_schedule,
    };

    console.log("📦 Enviando payload para API:", payload);

    try {
      await updateWorkSchedule(payload);
      toast({
        title: "Horários atualizados",
        description: "A jornada de trabalho foi salva com sucesso.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar os horários.",
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="rounded-md bg-background p-4 space-y-1">
        {Object.entries(diasSemana).map(([dia, label]) => {
          const key = dia as DiaSemana;
          const dados = agenda[key];

          return (
            <div
              key={dia}
              className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-muted transition text-xs"
            >
              <div className="flex items-center gap-3 w-44">
                <Switch
                  checked={dados.ativo}
                  onCheckedChange={() => alternarDia(key)}
                />
                <span className="font-medium">{label}</span>
              </div>

              <div className="flex items-center gap-2 min-w-[300px] justify-end">
                {dados.ativo ? (
                  <>
                    <Select
                      value={dados.inicio}
                      onValueChange={v => atualizarHorario(key, "inicio", v)}
                    >
                      <SelectTrigger className="w-[100px] h-8 px-2 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {opcoesHorario.map(time => (
                          <SelectItem
                            key={time}
                            value={time}
                            className="text-xs"
                          >
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-muted-foreground">—</span>

                    <Select
                      value={dados.fim}
                      onValueChange={v => atualizarHorario(key, "fim", v)}
                    >
                      <SelectTrigger className="w-[100px] h-8 px-2 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {opcoesHorario.map(time => (
                          <SelectItem
                            key={time}
                            value={time}
                            className="text-xs"
                          >
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {key === "monday" ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => aplicarParaTodos("monday")}
                            className="h-8 w-8"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Aplicar para todos</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <div className="w-8" />
                    )}
                  </>
                ) : (
                  <div className="w-[276px] flex justify-end">
                    <Badge
                      variant="outline"
                      className="text-muted-foreground text-[10px] py-[2px] px-2"
                    >
                      Fechado
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="pt-4 border-t">
          <Button
            onClick={salvar}
            disabled={loading}
            className="w-full text-sm h-9"
          >
            {loading ? "Salvando..." : "Salvar horários"}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
