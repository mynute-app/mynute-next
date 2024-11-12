import { Button } from "@/components/ui/button";

export function BreaksSection() {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return (
    <div className="space-y-4">
      {days.map((day, index) => (
        <div key={index} className="flex items-center justify-between">
          <p>{day}</p>
          <Button variant="outline">Add break</Button>
        </div>
      ))}
    </div>
  );
}
