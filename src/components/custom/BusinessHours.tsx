import React, { useState } from "react";
import Select from "react-select";

const BusinessHours = () => {
  type Day =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";

  type Hours = {
    open: boolean;
    startTime: string;
    endTime: string;
  };

  const [hours, setHours] = useState<Record<Day, Hours>>({
    Monday: { open: true, startTime: "09:00 AM", endTime: "05:00 PM" },
    Tuesday: { open: true, startTime: "09:00 AM", endTime: "05:00 PM" },
    Wednesday: { open: true, startTime: "09:00 AM", endTime: "05:00 PM" },
    Thursday: { open: true, startTime: "09:00 AM", endTime: "05:00 PM" },
    Friday: { open: true, startTime: "09:00 AM", endTime: "05:00 PM" },
    Saturday: { open: false, startTime: "", endTime: "" },
    Sunday: { open: false, startTime: "", endTime: "" },
  });

  const toggleDay = (day: Day) => {
    setHours({
      ...hours,
      [day]: { ...hours[day], open: !hours[day].open },
    });
  };

  const updateTime = (
    day: Day,
    time: "startTime" | "endTime",
    value: string
  ) => {
    setHours({
      ...hours,
      [day]: { ...hours[day], [time]: value },
    });
  };

  // Gera as opções de horário
  const generateTimeOptions = () => {
    const options = [];
    let hour = 0;
    let minute = 0;

    while (hour < 24) {
      const ampm = hour < 12 ? "AM" : "PM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const displayMinute = minute.toString().padStart(2, "0");

      options.push({
        value: `${displayHour}:${displayMinute} ${ampm}`,
        label: `${displayHour}:${displayMinute} ${ampm}`,
      });

      minute += 15;
      if (minute === 60) {
        minute = 0;
        hour++;
      }
    }

    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Business Hours</h2>
      <p className="text-sm text-gray-500">
        Highlight when your business opens and closes on your Booking Page.
      </p>
      <div className="border rounded-lg p-4">
        {Object.entries(hours).map(([day, { open, startTime, endTime }]) => (
          <div
            key={day}
            className="flex items-center justify-between py-2 border-b last:border-b-0"
          >
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={open}
                onChange={() => toggleDay(day as Day)}
                className="cursor-pointer"
              />
              <span className="font-medium text-gray-800">{day}</span>
            </div>
            {open ? (
              <div className="flex items-center space-x-2">
                <Select
                  className="w-28"
                  options={timeOptions}
                  value={timeOptions.find(option => option.value === startTime)}
                  onChange={selectedOption =>
                    updateTime(
                      day as Day,
                      "startTime",
                      selectedOption?.value || ""
                    )
                  }
                />
                <span className="text-gray-600">—</span>
                <Select
                  className="w-28"
                  options={timeOptions}
                  value={timeOptions.find(option => option.value === endTime)}
                  onChange={selectedOption =>
                    updateTime(
                      day as Day,
                      "endTime",
                      selectedOption?.value || ""
                    )
                  }
                />
              </div>
            ) : (
              <span className="text-sm text-gray-500">Closed</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessHours;
