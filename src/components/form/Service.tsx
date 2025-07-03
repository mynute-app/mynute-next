"use client";

import { useRouter } from "next/navigation";
import { useWizardStore } from "@/context/useWizardStore";
import { CardService } from "../custom/Card-Service";
import { useGetCompany } from "@/hooks/get-company";

type Service = {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration: number;
};

export const ServiceStep = () => {
  const { setSelectedService, selectedService } = useWizardStore();
  const router = useRouter();
  const { company, loading } = useGetCompany();

  const handleSelectService = (serviceId: number) => {
    const serviceIdStr = String(serviceId);
    setSelectedService(serviceIdStr);
    const params = new URLSearchParams(window.location.search);
    params.set("service", serviceIdStr);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-4 pr-2 md:pr-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="h-40 w-full bg-gray-200 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-4 pr-2 md:pr-6 p-4">
      {company.services?.map((service: Service) => (
        <CardService
          key={service.id}
          title={service.name}
          subtitle={service.description || "Descrição indisponível"}
          price={`R$ ${service.price}`}
          duration={`${service.duration} min`}
          onClick={() => handleSelectService(service.id)}
          isSelected={selectedService === String(service.id)}
        />
      ))}
    </div>
  );
};
