"use client";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ServiceCard from "./service-card";

type ServiceCategory = {
  id: number;
  name: string;
  items: string[];
};

const Page = () => {
  const servicesteste = [
    {
      name: "Testador 2",
      duration: "20 mins",
      buffer: "20 min buffer",
      price: "R$50",
    },
    {
      name: "Testador 3",
      duration: "20 mins",
      buffer: "20 min buffer",
      price: "R$50",
    },
    {
      name: "Testador 4",
      duration: "20 mins",
      buffer: "20 min buffer",
      price: "R$50",
    },
    {
      name: "Avaliação",
      duration: "30 mins",
      buffer: "10 min buffer",
      price: "R$80",
    },
  ];
  const [services, setServices] = useState<ServiceCategory[]>([
    { id: 1, name: "Services", items: ["Service 1"] },
  ]);
  const [classes, setClasses] = useState<ServiceCategory[]>([]);

  const handleAddServiceCategory = () => {
    setServices([
      ...services,
      { id: Date.now(), name: `New Service ${services.length + 1}`, items: [] },
    ]);
  };

  const handleAddClassCategory = () => {
    setClasses([
      ...classes,
      { id: Date.now(), name: `New Class ${classes.length + 1}`, items: [] },
    ]);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-50 p-4 border-r">
        <h2 className="text-lg font-semibold mb-4">Services & classes</h2>

        {/* Services Section */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Services ({services.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="p-0 text-gray-500"
              onClick={handleAddServiceCategory}
            >
              <PlusIcon className="w-4 h-4" />
            </Button>
          </div>
          <ul className="mt-2 space-y-1">
            {services.map(service => (
              <li
                key={service.id}
                className="text-sm text-gray-700 p-2 rounded hover:bg-gray-100"
              >
                {service.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Classes Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Classes ({classes.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="p-0 text-gray-500"
              onClick={handleAddClassCategory}
            >
              <PlusIcon className="w-4 h-4" />
            </Button>
          </div>
          <ul className="mt-2 space-y-1">
            {classes.map(classItem => (
              <li
                key={classItem.id}
                className="text-sm text-gray-700 p-2 rounded hover:bg-gray-100"
              >
                {classItem.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full p-6">
        <h2 className="text-xl font-semibold mb-4">
          Services ({services.length})
        </h2>

        {/* Renderizando cada serviço */}
        <div className="space-y-4">
          {servicesteste.map((service, index) => (
            <ServiceCard
              key={index}
              name={service.name}
              duration={service.duration}
              buffer={service.buffer}
              price={service.price}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
