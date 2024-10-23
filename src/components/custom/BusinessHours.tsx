import { useState } from "react";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Trash2Icon } from "lucide-react";

const BusinessHours = () => {
  type Day =
    | "Segunda"
    | "Terça"
    | "Quarta"
    | "Quinta"
    | "Sexta"
    | "Sábado"
    | "Domingo";

  type Hours = {
    open: boolean;
    main: { start: string; end: string };
    intervals: Array<{ start: string; end: string }>;
  };

  const [hours, setHours] = useState<Record<Day, Hours>>({
    Segunda: {
      open: true,
      main: { start: "09:00 AM", end: "06:00 PM" },
      intervals: [{ start: "12:00 PM", end: "01:00 PM" }],
    },
    Terça: {
      open: true,
      main: { start: "09:00 AM", end: "06:00 PM" },
      intervals: [{ start: "12:00 PM", end: "01:00 PM" }],
    },
    Quarta: {
      open: true,
      main: { start: "09:00 AM", end: "06:00 PM" },
      intervals: [{ start: "12:00 PM", end: "01:00 PM" }],
    },
    Quinta: {
      open: true,
      main: { start: "09:00 AM", end: "06:00 PM" },
      intervals: [{ start: "12:00 PM", end: "01:00 PM" }],
    },
    Sexta: {
      open: true,
      main: { start: "09:00 AM", end: "06:00 PM" },
      intervals: [{ start: "12:00 PM", end: "01:00 PM" }],
    },
    Sábado: {
      open: false,
      main: { start: "09:00 AM", end: "06:00 PM" },
      intervals: [],
    },
    Domingo: {
      open: false,
      main: { start: "09:00 AM", end: "06:00 PM" },
      intervals: [],
    },
  });

  const handleToggle = (day: Day) => {
    setHours({
      ...hours,
      [day]: { ...hours[day], open: !hours[day].open },
    });
  };

  const handleTimeChange = (
    day: Day,
    time: "start" | "end",
    value: string,
    isMain: boolean,
    intervalIndex?: number
  ) => {
    if (isMain) {
      setHours({
        ...hours,
        [day]: {
          ...hours[day],
          main: { ...hours[day].main, [time]: value },
        },
      });
    } else if (intervalIndex !== undefined) {
      const newIntervals = [...hours[day].intervals];
      newIntervals[intervalIndex] = {
        ...newIntervals[intervalIndex],
        [time]: value,
      };

      setHours({
        ...hours,
        [day]: { ...hours[day], intervals: newIntervals },
      });
    }
  };

  const addInterval = (day: Day) => {
    setHours({
      ...hours,
      [day]: {
        ...hours[day],
        intervals: [
          ...hours[day].intervals,
          { start: "01:00 PM", end: "02:00 PM" },
        ],
      },
    });
  };

  const removeInterval = (day: Day, intervalIndex: number) => {
    const newIntervals = hours[day].intervals.filter(
      (_, index) => index !== intervalIndex
    );

    setHours({
      ...hours,
      [day]: { ...hours[day], intervals: newIntervals },
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-medium">Horário comercial</h2>
      <p className="text-sm text-gray-500">
        Destaque os horários de abertura e fechamento do seu negócio na sua
        página de reservas.
      </p>
      <div className="space-y-2">
        {Object.entries(hours).map(([day, { open, main, intervals }]) => {
          const dayName = day as Day;
          return (
            <div key={dayName} className="space-y-4">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={open}
                    onCheckedChange={() => handleToggle(dayName)}
                  />
                  <span className="text-gray-700">{dayName}</span>
                </div>
                <Button
                  className=""
                  onClick={() => addInterval(dayName)}
                  disabled={!open}
                >
                  Adicionar intervalo
                </Button>
              </div>

              {open && (
                <>
                  {/* Horário principal */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={main.start}
                      onChange={e =>
                        handleTimeChange(dayName, "start", e.target.value, true)
                      }
                      className="border border-gray-300 rounded-md p-2"
                    />
                    <span>—</span>
                    <input
                      type="time"
                      value={main.end}
                      onChange={e =>
                        handleTimeChange(dayName, "end", e.target.value, true)
                      }
                      className="border border-gray-300 rounded-md p-2"
                    />
                  </div>

                  {/* Intervalos */}
                  {intervals.map((interval, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border border-dashed border-gray-400"
                    >
                      <input
                        type="time"
                        value={interval.start}
                        onChange={e =>
                          handleTimeChange(
                            dayName,
                            "start",
                            e.target.value,
                            false,
                            index
                          )
                        }
                        className="border border-gray-200 rounded-sm p-1 text-sm text-gray-600"
                      />
                      <span className="text-gray-500 text-sm">—</span>
                      <input
                        type="time"
                        value={interval.end}
                        onChange={e =>
                          handleTimeChange(
                            dayName,
                            "end",
                            e.target.value,
                            false,
                            index
                          )
                        }
                        className="border border-gray-200 rounded-sm p-1 text-sm text-gray-600"
                      />
                      <Button
                        size="icon"
                        className="text-white bg-red-500 "
                        onClick={() => removeInterval(dayName, index)}
                      >
                        <Trash2Icon className="size-5" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BusinessHours;
