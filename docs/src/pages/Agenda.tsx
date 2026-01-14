import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7:00 to 18:00

interface Event {
  id: string;
  title: string;
  client: string;
  startHour: number;
  duration: number;
  day: number;
  professional: string;
  color: string;
}

const mockEvents: Event[] = [
  { id: "1", title: "Lavagem Completa", client: "João Silva", startHour: 9, duration: 2, day: 1, professional: "Carlos", color: "bg-primary" },
  { id: "2", title: "Polimento", client: "Maria Santos", startHour: 10, duration: 3, day: 2, professional: "Pedro", color: "bg-accent" },
  { id: "3", title: "Higienização", client: "Pedro Oliveira", startHour: 14, duration: 2, day: 1, professional: "Lucas", color: "bg-success" },
  { id: "4", title: "Lavagem Simples", client: "Ana Costa", startHour: 8, duration: 1, day: 3, professional: "Carlos", color: "bg-warning" },
  { id: "5", title: "Cristalização", client: "Bruno Lima", startHour: 11, duration: 4, day: 4, professional: "Pedro", color: "bg-primary" },
];

export default function Agenda() {
  const [currentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("week");

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return date;
    });
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Agenda</h1>
          <p className="page-description">Visualize e gerencie seus agendamentos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
          <Button className="btn-gradient" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground min-w-[180px] text-center">
              Janeiro 2026
            </h2>
            <Button variant="ghost" size="icon">
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="ml-2">
              Hoje
            </Button>
          </div>
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            {(["day", "week", "month"] as const).map((v) => (
              <Button
                key={v}
                variant={view === v ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "capitalize",
                  view === v && "bg-background shadow-sm"
                )}
                onClick={() => setView(v)}
              >
                {v === "day" ? "Dia" : v === "week" ? "Semana" : "Mês"}
              </Button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Days Header */}
            <div className="grid grid-cols-8 border-b border-border">
              <div className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border">
                Hora
              </div>
              {weekDays.map((date, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 text-center border-r border-border last:border-r-0",
                    date.toDateString() === new Date().toDateString() && "bg-primary/5"
                  )}
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    {daysOfWeek[date.getDay()]}
                  </p>
                  <p
                    className={cn(
                      "text-lg font-semibold",
                      date.toDateString() === new Date().toDateString()
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {date.getDate()}
                  </p>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="relative">
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-border last:border-b-0">
                  <div className="p-2 text-center text-sm text-muted-foreground border-r border-border h-16 flex items-start justify-center">
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                  {weekDays.map((_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={cn(
                        "border-r border-border last:border-r-0 h-16 relative",
                        dayIndex === new Date().getDay() && "bg-primary/5"
                      )}
                    >
                      {mockEvents
                        .filter((e) => e.day === dayIndex && e.startHour === hour)
                        .map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "absolute left-1 right-1 rounded-lg p-2 text-xs cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md",
                              event.color,
                              "text-white"
                            )}
                            style={{
                              height: `${event.duration * 64 - 4}px`,
                              zIndex: 10,
                            }}
                          >
                            <p className="font-medium truncate">{event.title}</p>
                            <p className="opacity-80 truncate">{event.client}</p>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Lavagem</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-sm text-muted-foreground">Polimento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Higienização</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-sm text-muted-foreground">Outros</span>
        </div>
      </div>
    </div>
  );
}
