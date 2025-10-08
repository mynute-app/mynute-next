"use client";

import { memo } from "react";
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
import { DIAS_SEMANA_MAP, DIAS_SEMANA_SHORT, ALL_WEEKDAYS } from "./constants";

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

const DayScheduleRow = memo(
  ({
    weekday,
    dayRanges,
    isEditable,
    onEdit,
    onDelete,
  }: {
    weekday: number;
    dayRanges: BranchWorkScheduleRange[];
    isEditable?: boolean;
    onEdit?: (
      workRangeId: string,
      data: Partial<BranchWorkScheduleRange>
    ) => void;
    onDelete?: (
      workRangeId: string,
      data?: Partial<BranchWorkScheduleRange>
    ) => void;
  }) => {
    const hasConfiguredRanges = dayRanges.some(
      range => range.id && range.start_time && range.end_time
    );
    const dayRecord = dayRanges.find(range => range.weekday === weekday);

    return (
      <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg">
        <div className="flex items-center gap-3 min-w-[140px]">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">{DIAS_SEMANA_MAP[weekday]}</p>
            <p className="text-xs text-muted-foreground">
              {DIAS_SEMANA_SHORT[weekday]}
            </p>
          </div>
        </div>

        <div className="flex-1">
          {!hasConfiguredRanges ? (
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                Não configurado
              </Badge>
              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onEdit?.(dayRecord?.id || "new", {
                      weekday,
                      start_time: dayRecord?.start_time || "",
                      end_time: dayRecord?.end_time || "",
                      time_zone: dayRecord?.time_zone || "America/Sao_Paulo",
                      branch_id: dayRecord?.branch_id,
                    })
                  }
                  className="flex items-center gap-1 h-7 px-2"
                >
                  <Plus className="w-3 h-3" />
                  Configurar
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {dayRanges
                .filter(range => range.id && range.start_time && range.end_time)
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
                        <Badge variant="secondary" className="text-xs">
                          {range.time_zone}
                        </Badge>
                      )}

                      {range.services && range.services.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            Serviços:
                          </span>
                          <Badge variant="default" className="text-xs">
                            {range.services.length} configurados
                          </Badge>
                        </div>
                      )}
                    </div>

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
  }
);

DayScheduleRow.displayName = "DayScheduleRow";

export const BranchWorkScheduleView = memo(
  ({
    workRanges,
    branchName = "Filial",
    className,
    isEditable = false,
    onEdit,
    onDelete,
  }: BranchWorkScheduleViewProps) => {
    const rangesByDay = workRanges.reduce((acc, range) => {
      if (!acc[range.weekday]) acc[range.weekday] = [];
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
              {ALL_WEEKDAYS.map(weekday => (
                <DayScheduleRow
                  key={weekday}
                  weekday={weekday}
                  dayRanges={rangesByDay[weekday] || []}
                  isEditable={isEditable}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

BranchWorkScheduleView.displayName = "BranchWorkScheduleView";
