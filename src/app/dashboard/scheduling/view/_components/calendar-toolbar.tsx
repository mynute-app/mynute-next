"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Grid3X3,
  List,
} from "lucide-react";

type ViewType = "week" | "month" | "day";

interface CalendarToolbarProps {
  viewType: ViewType;
  onViewChange: (view: ViewType) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarToolbar({
  viewType,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToday}>
          Hoje
        </Button>

        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 border rounded-lg p-1">
        <Button
          variant={viewType === "month" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewChange("month")}
          className="flex items-center gap-1"
        >
          <Grid3X3 className="h-4 w-4" />
          Mês
        </Button>
        <Button
          variant={viewType === "week" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewChange("week")}
          className="flex items-center gap-1"
        >
          <Calendar className="h-4 w-4" />
          Semana
        </Button>
        <Button
          variant={viewType === "day" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewChange("day")}
          className="flex items-center gap-1"
        >
          <List className="h-4 w-4" />
          Dia
        </Button>
      </div>
    </div>
  );
}
