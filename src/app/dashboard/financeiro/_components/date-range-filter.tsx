"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onApply: (startDate: string, endDate: string) => void;
  isLoading?: boolean;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onApply,
  isLoading = false,
}: DateRangeFilterProps) {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    if (localStartDate && localEndDate && localEndDate < localStartDate) {
      setError("Data final deve ser maior ou igual a data inicial.");
      return;
    }

    setError(null);
    onApply(localStartDate, localEndDate);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="financial-start-date">Data inicial</Label>
          <Input
            id="financial-start-date"
            type="date"
            value={localStartDate}
            onChange={(event) => setLocalStartDate(event.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="financial-end-date">Data final</Label>
          <Input
            id="financial-end-date"
            type="date"
            value={localEndDate}
            onChange={(event) => setLocalEndDate(event.target.value)}
          />
        </div>

        <div className="flex items-end">
          <Button onClick={handleApply} disabled={isLoading} className="w-full md:w-auto">
            Aplicar
          </Button>
        </div>
      </div>

      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
