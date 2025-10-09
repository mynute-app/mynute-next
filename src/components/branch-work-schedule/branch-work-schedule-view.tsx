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
      <div className="group relative">
        <div className="flex items-center gap-3 p-4 border rounded-lg hover:border-primary/50 transition-all bg-card hover:shadow-sm">
          {/* Indicador visual */}
          <div
            className={`w-1 h-12 rounded-full flex-shrink-0 ${
              hasConfiguredRanges ? "bg-primary" : "bg-muted"
            }`}
          />

          {/* Nome do dia */}
          <div className="min-w-[100px]">
            <p className="font-semibold text-sm">{DIAS_SEMANA_MAP[weekday]}</p>
            <p className="text-xs text-muted-foreground">
              {DIAS_SEMANA_SHORT[weekday]}
            </p>
          </div>

          {/* Horários ou estado vazio */}
          <div className="flex-1 min-w-0">
            {!hasConfiguredRanges ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Fechado
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
                    className="ml-auto h-8 gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Definir horário
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {dayRanges
                  .filter(
                    range => range.id && range.start_time && range.end_time
                  )
                  .map((range, index) => (
                    <div
                      key={range.id || index}
                      className="flex items-center gap-3 p-2.5 rounded-md bg-muted/50 border border-muted"
                    >
                      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {range.start_time}
                        </Badge>
                        <span className="text-sm text-muted-foreground font-medium">
                          às
                        </span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {range.end_time}
                        </Badge>
                      </div>

                      {range.services && range.services.length > 0 && (
                        <Badge variant="default" className="text-xs ml-2">
                          {range.services.length} serviço
                          {range.services.length !== 1 ? "s" : ""}
                        </Badge>
                      )}

                      {isEditable && range.id && (
                        <div className="flex items-center gap-1 ml-auto flex-shrink-0">
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
                              })
                            }
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
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
      <Card className="w-full border-2">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            Horários de Funcionamento
          </CardTitle>
          <CardDescription className="text-base">
            Visualização dos horários de{" "}
            <span className="font-medium">{branchName}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
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
        </CardContent>
      </Card>
    );
  }
);

BranchWorkScheduleView.displayName = "BranchWorkScheduleView";
