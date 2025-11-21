"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ServiceCard } from "@/app/(home)/_components/service-card";
import { ServiceSkeleton } from "@/app/(home)/_components/service-skeleton";
import { EmptyState } from "@/app/(home)/_components/service-empty";
import { BookingProvider } from "@/app/(home)/_components/booking";
import { BookingOrchestrator } from "@/app/(home)/_components/booking-orchestrator";
import { useServiceAvailability } from "@/hooks/service/useServiceAvailability";
import type { Service as CompanyService } from "../../../../types/company";

export type Service = CompanyService;

type Props = {
  services: Service[];
  employees?: any[];
  branches?: any[];
  loading?: boolean;
  error?: string;
  brandColor?: string;
  companyId?: string;
};

export function ServiceList({
  services,
  employees = [],
  branches = [],
  loading,
  error,
  brandColor,
  companyId,
}: Props) {
  const [query, setQuery] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [availabilityData, setAvailabilityData] = useState<any>(null);

  const { fetchAvailability, loading: availabilityLoading } =
    useServiceAvailability();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter(s =>
      [s.name, s.description, s.category]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    );
  }, [services, query]);

  const handleServiceSelect = async (service: Service) => {
    if (!companyId) {
      return;
    }

    try {
      const availabilityData = await fetchAvailability({
        serviceId: service.id,
        companyId: companyId,
        timezone: "America/Sao_Paulo",
        dateForwardStart: 0,
        dateForwardEnd: 3,
      });

      // Adicionar employee_info e branch_info se não vieram da API
      const enrichedData = {
        ...availabilityData,
        employee_info: availabilityData?.employee_info || employees,
        branch_info: availabilityData?.branch_info || branches,
      };

      setAvailabilityData(enrichedData);
    } catch (error) {
      // Error handling silencioso, toast já é mostrado pelo hook
    }

    setSelectedService(service);
  };

  const handleBackToServices = () => {
    setSelectedService(null);
    setAvailabilityData(null);
  };

  // Se tem um serviço selecionado, mostra a tela de agendamento
  // Envolvido no BookingProvider para gerenciar estado do novo fluxo
  if (selectedService) {
    return (
      <BookingProvider
        companyId={companyId}
        brandColor={brandColor}
        service={selectedService}
      >
        <BookingOrchestrator
          service={selectedService}
          onBack={handleBackToServices}
          brandColor={brandColor}
          initialAvailabilityData={availabilityData}
        />
      </BookingProvider>
    );
  }

  return (
    <div className="space-y-4">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Serviços</h1>
        <p className="text-sm text-muted-foreground">
          Explore e selecione um serviço para continuar o agendamento.
        </p>
      </header>
      <div className="flex items-center gap-3">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar serviço..."
          className="max-w-sm"
        />
      </div>

      <Separator />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ServiceSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Erro ao carregar" description={error} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhum serviço encontrado"
          description="Tente ajustar a busca ou verifique mais tarde."
        />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <li key={String(s.id)}>
              <ServiceCard
                service={s}
                brandColor={brandColor}
                onSelect={handleServiceSelect}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
