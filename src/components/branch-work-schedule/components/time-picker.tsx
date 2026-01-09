import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown } from "lucide-react";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export const TimePicker = memo(
  ({ value, onChange, label }: TimePickerProps) => {
    const [hour, minute] = value.split(":").map(Number);

    const adjustTime = (type: "hour" | "minute", delta: number) => {
      let newHour = hour;
      let newMinute = minute;

      if (type === "hour") {
        newHour = (hour + delta + 24) % 24;
      } else {
        newMinute = minute + delta;
        if (newMinute >= 60) {
          newMinute = 0;
          newHour = (hour + 1) % 24;
        } else if (newMinute < 0) {
          newMinute = 45;
          newHour = (hour - 1 + 24) % 24;
        }
      }

      const formatted = `${String(newHour).padStart(2, "0")}:${String(
        newMinute
      ).padStart(2, "0")}`;
      onChange(formatted);
    };

    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <div className="flex items-center justify-center gap-1.5">
          <TimeUnit
            value={hour}
            onAdjust={delta => adjustTime("hour", delta)}
          />
          <span className="text-lg font-semibold text-muted-foreground">:</span>
          <TimeUnit
            value={minute}
            onAdjust={delta => adjustTime("minute", delta)}
          />
        </div>
        <p className="text-center text-[10px] text-muted-foreground">
          Horas: ±1h | Minutos: ±15min
        </p>
      </div>
    );
  }
);

TimePicker.displayName = "TimePicker";

interface TimeUnitProps {
  value: number;
  onAdjust: (delta: number) => void;
}

const TimeUnit = ({ value, onAdjust }: TimeUnitProps) => (
  <div className="flex flex-col items-center gap-0.5">
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      type="button"
      onClick={() => onAdjust(1)}
    >
      <ChevronUp className="h-3 w-3" />
    </Button>
    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/50 bg-primary/5 text-lg font-semibold">
      {String(value).padStart(2, "0")}
    </div>
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      type="button"
      onClick={() => onAdjust(-1)}
    >
      <ChevronDown className="h-3 w-3" />
    </Button>
  </div>
);
