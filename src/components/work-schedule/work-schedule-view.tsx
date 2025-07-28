"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, MapPin, Calendar } from "lucide-react";

// Definir o tipo localmente até que o hook esteja disponível
interface WorkScheduleRange {
  branch_id: string;
  employee_id: string;
  end_time: string;
  services: object[];
  start_time: string;
  time_zone: string;
  weekday: number;
}

interface WorkScheduleViewProps {
  workRanges: WorkScheduleRange[];
  branches?: Array<{ id: string; name: string }>;
  className?: string;
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

export function WorkScheduleView({
  workRanges,
  branches = [],
  className,
}: WorkScheduleViewProps) {
  // Organizar por dia da semana
  const rangesByDay = workRanges.reduce((acc, range) => {
    if (!acc[range.weekday]) {
      acc[range.weekday] = [];
    }
    acc[range.weekday].push(range);
    return acc;
  }, {} as Record<number, WorkScheduleRange[]>);

  // Ordenar dias da semana (segunda a domingo)
  const sortedDays = Object.keys(rangesByDay)
    .map(Number)
    .sort((a, b) => {
      // Colocar domingo (0) no final
      if (a === 0) return 1;
      if (b === 0) return -1;
      return a - b;
    });

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || branchId;
  };

  if (workRanges.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Nenhum horário de trabalho configurado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Horários de Trabalho
        </CardTitle>
        <CardDescription>
          Horários configurados para esta semana
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {sortedDays.map(weekday => {
            const dayRanges = rangesByDay[weekday];

            return (
              <div key={weekday} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="outline">{diasSemanaShort[weekday]}</Badge>
                  <span className="font-medium">{diasSemana[weekday]}</span>
                </div>

                <div className="space-y-2">
                  {dayRanges.map((range: WorkScheduleRange, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm">
                            {range.start_time} - {range.end_time}
                          </span>
                        </div>

                        {range.time_zone && (
                          <Badge variant="secondary" className="text-xs">
                            {range.time_zone}
                          </Badge>
                        )}
                      </div>

                      {range.branch_id && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {getBranchName(range.branch_id)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
