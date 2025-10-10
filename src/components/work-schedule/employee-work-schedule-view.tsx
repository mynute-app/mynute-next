"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, User, Calendar, Edit, Trash2, Plus } from "lucide-react";

interface WorkScheduleRange {
  id?: string;
  employee_id: string;
  branch_id: string;
  end_time: string;
  services: object[];
  start_time: string;
  time_zone: string;
  weekday: number;
}

interface EmployeeWorkScheduleViewProps {
  workRanges: WorkScheduleRange[];
  employeeName?: string;
  branches?: Array<{ id: string; name: string }>;
  className?: string;
  isEditable?: boolean;
  onEdit?: (
    workRangeId: string,
    updatedData: Partial<WorkScheduleRange>
  ) => void;
  onDelete?: (
    workRangeId: string,
    currentData?: Partial<WorkScheduleRange>
  ) => void;
}

const diasSemana: Record<number, string> = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

const diasSemanaShort: Record<number, string> = {
  0: "DOM",
  1: "SEG",
  2: "TER",
  3: "QUA",
  4: "QUI",
  5: "SEX",
  6: "SAB",
};

export function EmployeeWorkScheduleView({
  workRanges,
  employeeName = "Funcionário",
  branches = [],
  className,
  isEditable = false,
  onEdit,
  onDelete,
}: EmployeeWorkScheduleViewProps) {
  workRanges.forEach((range, index) => {
    if (range.start_time && range.end_time) {
    }
  });

  // Criar array de todos os dias da semana (0-6)
  const allWeekdays = [1, 2, 3, 4, 5, 6, 0]; // Segunda a Domingo

  // Organizar por dia da semana
  const rangesByDay = workRanges.reduce((acc, range) => {
    if (!acc[range.weekday]) {
      acc[range.weekday] = [];
    }
    acc[range.weekday].push(range);
    return acc;
  }, {} as Record<number, WorkScheduleRange[]>);

  // Função para obter nome da filial
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || `Filial ${branchId}`;
  };

  return (
    <div className={`space-y-4 ${className || ""}`}>
      <Card className="border-2">
        <CardHeader className="space-y-3 pb-6">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            Jornada de Trabalho
          </CardTitle>
          <CardDescription className="text-base">
            Visualização dos horários de trabalho configurados para{" "}
            <span className="font-medium">{employeeName}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allWeekdays.map(weekday => {
              const dayRanges = rangesByDay[weekday] || [];
              const hasConfiguredRanges = dayRanges.some(
                range => range.id && range.start_time && range.end_time
              );

              // Encontrar o registro do dia (pode ter ID mas estar vazio)
              const dayRecord = dayRanges.find(
                range => range.weekday === weekday
              );
              const emptyDay = dayRanges.find(
                range => !range.start_time && !range.end_time
              );

              return (
                <div key={weekday} className="group relative">
                  <div className="flex items-center gap-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-all bg-card hover:shadow-sm">
                    {/* Indicador de status */}
                    <div
                      className={`w-1 h-12 rounded-full flex-shrink-0 ${
                        hasConfiguredRanges ? "bg-primary" : "bg-muted"
                      }`}
                    />

                    {/* Nome do dia */}
                    <div className="min-w-[100px]">
                      <p className="font-semibold text-sm">
                        {diasSemana[weekday]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {diasSemanaShort[weekday]}
                      </p>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      {!hasConfiguredRanges ? (
                        // Dia não configurado
                        <div className="flex items-center justify-between gap-3">
                          <Badge variant="outline" className="text-xs">
                            Fechado
                          </Badge>
                          {isEditable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                onEdit?.(dayRecord?.id || "new", {
                                  weekday: weekday,
                                  start_time: dayRecord?.start_time || "",
                                  end_time: dayRecord?.end_time || "",
                                  time_zone:
                                    dayRecord?.time_zone || "America/Sao_Paulo",
                                  employee_id:
                                    dayRecord?.employee_id ||
                                    emptyDay?.employee_id,
                                  branch_id:
                                    dayRecord?.branch_id ||
                                    emptyDay?.branch_id ||
                                    "",
                                })
                              }
                              className="ml-auto h-8 gap-1.5"
                            >
                              <Plus className="w-4 h-4" />
                              Definir horário
                            </Button>
                          )}
                        </div>
                      ) : (
                        // Dia configurado - mostrar horários
                        <div className="space-y-2">
                          {dayRanges
                            .filter(
                              range =>
                                range.id && range.start_time && range.end_time
                            )
                            .map((range, index) => (
                              <div
                                key={range.id || index}
                                className="flex items-center gap-3 p-2.5 rounded-md bg-muted/50 border border-muted"
                              >
                                <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs"
                                >
                                  {range.start_time}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  às
                                </span>
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs"
                                >
                                  {range.end_time}
                                </Badge>

                                {range.branch_id && (
                                  <Badge
                                    variant="default"
                                    className="text-xs ml-2"
                                  >
                                    {getBranchName(range.branch_id)}
                                  </Badge>
                                )}

                                {range.services &&
                                  range.services.length > 0 && (
                                    <Badge
                                      variant="default"
                                      className="text-xs ml-2"
                                    >
                                      {range.services.length} serviço
                                      {range.services.length !== 1 ? "s" : ""}
                                    </Badge>
                                  )}

                                {/* Botões de ação */}
                                {isEditable && range.id && (
                                  <div className="flex items-center gap-1 ml-auto">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        onEdit?.(range.id!, {
                                          start_time: range.start_time,
                                          end_time: range.end_time,
                                          weekday: range.weekday,
                                          time_zone: range.time_zone,
                                          branch_id: range.branch_id,
                                          employee_id: range.employee_id,
                                          services: range.services,
                                        })
                                      }
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        onDelete?.(range.id!, {
                                          weekday: range.weekday,
                                          start_time: range.start_time,
                                          end_time: range.end_time,
                                          branch_id: range.branch_id,
                                        })
                                      }
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
