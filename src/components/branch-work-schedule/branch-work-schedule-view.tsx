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
import { Clock, Building2, Calendar, Edit, Trash2, Plus } from "lucide-react";

interface BranchWorkScheduleRange {
  id?: string;
  branch_id: string;
  end_time: string;
  services: object[];
  start_time: string;
  time_zone: string;
  weekday: number;
}

interface BranchWorkScheduleViewProps {
  workRanges: BranchWorkScheduleRange[];
  branchName?: string;
  className?: string;
  isEditable?: boolean;
  onEdit?: (
    workRangeId: string,
    updatedData: Partial<BranchWorkScheduleRange>
  ) => void;
  onDelete?: (
    workRangeId: string,
    currentData?: Partial<BranchWorkScheduleRange>
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

export function BranchWorkScheduleView({
  workRanges,
  branchName = "Filial",
  className,
  isEditable = false,
  onEdit,
  onDelete,
}: BranchWorkScheduleViewProps) {
  // Criar array de todos os dias da semana (0-6)
  const allWeekdays = [1, 2, 3, 4, 5, 6, 0]; // Segunda a Domingo

  // Organizar por dia da semana
  const rangesByDay = workRanges.reduce((acc, range) => {
    if (!acc[range.weekday]) {
      acc[range.weekday] = [];
    }
    acc[range.weekday].push(range);
    return acc;
  }, {} as Record<number, BranchWorkScheduleRange[]>);

  return (
    <div className={`space-y-4 ${className || ""}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Horários de Funcionamento - {branchName}
          </CardTitle>
          <CardDescription>
            Visualização dos horários configurados para esta filial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                <div
                  key={weekday}
                  className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">
                        {diasSemana[weekday]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {diasSemanaShort[weekday]}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1">
                    {!hasConfiguredRanges ? (
                      // Dia não configurado - mostrar como fechado com opção de configurar
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          Não configurado
                        </Badge>
                        {isEditable && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              onEdit?.(
                                dayRecord?.id || "new", // Usar ID existente se houver, senão "new"
                                {
                                  weekday: weekday,
                                  start_time: dayRecord?.start_time || "",
                                  end_time: dayRecord?.end_time || "",
                                  time_zone:
                                    dayRecord?.time_zone || "America/Sao_Paulo",
                                  branch_id:
                                    dayRecord?.branch_id || emptyDay?.branch_id,
                                }
                              )
                            }
                            className="flex items-center gap-1 h-7 px-2"
                          >
                            <Plus className="w-3 h-3" />
                            Configurar
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
                              className="flex items-center gap-4 flex-wrap justify-between p-3 border rounded-lg bg-muted/20"
                            >
                              <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <Badge variant="outline" className="text-sm">
                                    {range.start_time} - {range.end_time}
                                  </Badge>
                                </div>

                                {range.time_zone && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {range.time_zone}
                                  </Badge>
                                )}

                                {range.services &&
                                  range.services.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-muted-foreground">
                                        Serviços:
                                      </span>
                                      <Badge
                                        variant="default"
                                        className="text-xs"
                                      >
                                        {range.services.length} configurados
                                      </Badge>
                                    </div>
                                  )}
                              </div>

                              {/* Botões de ação (apenas se editável e tiver ID) */}
                              {isEditable && range.id && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      onEdit?.(range.id!, {
                                        start_time: range.start_time,
                                        end_time: range.end_time,
                                        weekday: range.weekday,
                                        time_zone: range.time_zone,
                                        services: range.services,
                                      })
                                    }
                                    className="flex items-center gap-1 h-7 px-2"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      onDelete?.(range.id!, {
                                        weekday: range.weekday,
                                        start_time: range.start_time,
                                        end_time: range.end_time,
                                      })
                                    }
                                    className="flex items-center gap-1 h-7 px-2 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
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
