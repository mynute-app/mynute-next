import { Button } from "@/components/ui/button";

export function ServicesSection() {
  const services = [
    { title: "15 Minutes Meeting", duration: "15 mins • Free" },
    { title: "30 Minutes Meeting", duration: "30 mins • Free" },
    { title: "1 Hour Meeting", duration: "60 mins • Free" },
  ];

  return (
    <div className="space-y-4">
      {services.map((service, index) => (
        <div key={index} className="p-4 border rounded-lg flex justify-between">
          <div>
            <p className="font-semibold">{service.title}</p>
            <p className="text-sm text-gray-500">{service.duration}</p>
          </div>
          <Button variant="outline">Share</Button>
        </div>
      ))}
    </div>
  );
}
