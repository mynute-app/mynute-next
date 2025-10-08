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
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2 sm:min-w-[120px]">
          <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-sm">{DIAS_SEMANA_MAP[weekday]}</p>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {!hasConfiguredRanges ? (
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                Não configurado
              </Badge>
              {isEditable && (
                <Button
                  variant="ghost"
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
                  className="h-8 px-2 gap-1 flex-shrink-0"
                >
                  <Plus className="w-3 h-3" />
                  <span className="hidden sm:inline">Configurar</span>
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
                    className="flex items-center gap-2 flex-wrap justify-between p-2 border rounded-md bg-muted/30"
                  >
                    <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <Badge variant="outline" className="text-xs font-mono">
                          {range.start_time} - {range.end_time}
                        </Badge>
                      </div>

                      {range.services && range.services.length > 0 && (
                        <Badge variant="default" className="text-xs">
                          {range.services.length} serviço
                          {range.services.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>

                    {isEditable && range.id && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
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
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onDelete?.(range.id!, {
                              weekday: range.weekday,
                              start_time: range.start_time,
                              end_time: range.end_time,
                            })
                          }
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                Horários de Funcionamento
              </CardTitle>
              <CardDescription className="mt-1">{branchName}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
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
    );
  }
);

BranchWorkScheduleView.displayName = "BranchWorkScheduleView";
