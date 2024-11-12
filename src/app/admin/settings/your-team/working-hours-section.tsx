export function WorkingHoursSection() {
  const workingHours = [
    { day: "Monday", hours: "9:00 AM - 5:00 PM" },
    { day: "Tuesday", hours: "9:00 AM - 5:00 PM" },
    { day: "Wednesday", hours: "9:00 AM - 5:00 PM" },
    { day: "Thursday", hours: "9:00 AM - 5:00 PM" },
    { day: "Friday", hours: "9:00 AM - 5:00 PM" },
    { day: "Saturday", hours: "Add hours" },
    { day: "Sunday", hours: "Add hours" },
  ];

  return (
    <div className="space-y-4">
      {workingHours.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <p>{item.day}</p>
          <p className="text-gray-500">{item.hours}</p>
        </div>
      ))}
    </div>
  );
}
