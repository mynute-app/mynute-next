"use client";

import React, { useState } from "react";
import { CalendarToolbar } from "./calendar-toolbar";
import { CalendarHeader } from "./calendar-header";
import { WeekView } from "./week-view";
import { MonthView } from "./month-view";

type ViewType = "week" | "month" | "day";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>("week");

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (view: ViewType) => {
    setViewType(view);
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <CalendarToolbar
        viewType={viewType}
        onViewChange={handleViewChange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />

      <CalendarHeader currentDate={currentDate} viewType={viewType} />

      <div className="flex-1 overflow-hidden">
        {viewType === "week" && (
          <WeekView currentDate={currentDate} onDateChange={handleDateChange} />
        )}
        {viewType === "month" && (
          <MonthView
            currentDate={currentDate}
            onDateChange={handleDateChange}
          />
        )}
      </div>
    </div>
  );
}
