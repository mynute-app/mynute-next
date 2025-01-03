"use client";

import { useRouter } from "next/navigation";
import { useWizardStore } from "@/context/useWizardStore";
import { CardService } from "../custom/Card-Service";
import { useFetch } from "@/data/loader";

type Service = {
  id: string;
  title: string;
  subtitle?: string; 
  cost: string;
  duration: string;
};

export const ServiceStep = () => {
  const { setSelectedService, selectedService } = useWizardStore();
  const router = useRouter();
  const { data: services, loading, error } = useFetch<Service[]>("/services");

  const handleSelectService = (serviceId: string) => {
    setSelectedService(serviceId);
    const params = new URLSearchParams(window.location.search);
    params.set("service", serviceId);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-4 pr-2 md:pr-6">
        <p>Carregando serviços...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-4 pr-2 md:pr-6">
        <p className="text-red-500">Erro ao carregar os serviços.</p>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-4 pr-2 md:pr-6">
        <p>Nenhum serviço disponível.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-4 pr-2 md:pr-6">
      {services.map(service => (
        <CardService
          key={service.id}
          title={service.title}
          subtitle={service.subtitle || "Descrição indisponível"}
          price={`R$ ${service.cost}`}
          duration={`${service.duration} min`}
          onClick={() => handleSelectService(service.id)}
          isSelected={selectedService === service.id}
        />
      ))}
    </div>
  );
};
