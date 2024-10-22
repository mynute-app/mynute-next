import { useState } from "react";
import { Switch } from "../ui/switch";

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
    start: string;
    end: string;
  };

  const [hours, setHours] = useState<Record<Day, Hours>>({
    Segunda: { open: true, start: "09:00 AM", end: "05:00 PM" },
    Terça: { open: true, start: "09:00 AM", end: "05:00 PM" },
    Quarta: { open: true, start: "09:00 AM", end: "05:00 PM" },
    Quinta: { open: true, start: "09:00 AM", end: "05:00 PM" },
    Sexta: { open: true, start: "09:00 AM", end: "05:00 PM" },
    Sábado: { open: false, start: "09:00 AM", end: "05:00 PM" },
    Domingo: { open: false, start: "09:00 AM", end: "05:00 PM" },
  });

  const handleToggle = (day: Day) => {
    setHours({
      ...hours,
      [day]: { ...hours[day], open: !hours[day].open },
    });
  };

  const handleTimeChange = (day: Day, time: "start" | "end", value: string) => {
    setHours({
      ...hours,
      [day]: { ...hours[day], [time]: value },
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
        {Object.entries(hours).map(([day, { open, start, end }]) => {
          const dayName = day as Day; 
          return (
            <div
              key={dayName}
              className="flex items-center justify-between space-x-4"
            >
              <div className="flex items-center space-x-2">
                <Switch
                  checked={open}
                  onCheckedChange={() => handleToggle(dayName)}
                />
                <span className="text-gray-700">{dayName}</span>
              </div>
              <div className="flex items-center space-x-2">
                {open ? (
                  <>
                    <input
                      type="time"
                      value={start}
                      onChange={e =>
                        handleTimeChange(dayName, "start", e.target.value)
                      }
                      className="border border-gray-300 rounded-md p-2"
                    />
                    <span>—</span>
                    <input
                      type="time"
                      value={end}
                      onChange={e =>
                        handleTimeChange(dayName, "end", e.target.value)
                      }
                      className="border border-gray-300 rounded-md p-2"
                    />
                  </>
                ) : (
                  <span className="text-gray-500">Closed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BusinessHours;
