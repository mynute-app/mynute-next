"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWizardStore } from "@/context/useWizardStore";
import { CardService } from "../custom/Card-Service";

type Service = {
  id: string;
  title: string;
  subtitle?: string; // Caso precise descrever o serviço
  cost: string;
  duration: string;
};

export const ServiceStep = () => {
  const { setSelectedService, selectedService } = useWizardStore();
  const router = useRouter();

  // Estado para armazenar os serviços
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar os serviços da API
  const fetchServices = async () => {
    try {
      const response = await fetch("http://localhost:3333/services");
      if (!response.ok) {
        throw new Error("Erro ao buscar os serviços.");
      }

      const data = await response.json();
      setServices(data); // Atualiza o estado com os serviços
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // UseEffect para buscar os serviços ao montar o componente
  useEffect(() => {
    fetchServices();
  }, []);

  // Lógica de seleção de serviço
  const handleSelectService = (serviceId: string) => {
    setSelectedService(serviceId);
    const params = new URLSearchParams(window.location.search);
    params.set("service", serviceId);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-4 pr-2 md:pr-6">
      {loading ? (
        <p>Carregando serviços...</p>
      ) : services.length > 0 ? (
        services.map(service => (
          <CardService
            key={service.id}
            title={service.title}
            subtitle={service.subtitle || "Descrição indisponível"}
            price={`R$ ${service.cost}`}
            duration={`${service.duration} min`}
            onClick={() => handleSelectService(service.id)}
            isSelected={selectedService === service.id}
          />
        ))
      ) : (
        <p>Nenhum serviço disponível.</p>
      )}
    </div>
  );
};
