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
    <div className="flex flex-col h-full md:block md:space-y-4">
      {/* Header - Fixo no mobile */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-3 md:pb-0 md:static">
        <header className="mb-3 md:mb-6">
          <h1 className="text-lg md:text-2xl font-bold tracking-tight">Serviços</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Selecione o serviço desejado
          </p>
        </header>
        <div className="flex items-center gap-3">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar serviço..."
            className="h-9 md:h-10 text-sm"
          />
        </div>
      </div>

      <Separator className="hidden md:block" />

      {loading ? (
        <div className="flex-1 overflow-auto md:overflow-visible grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-20 md:pb-0 pt-3 md:pt-0">
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
        <ul className="flex-1 overflow-auto md:overflow-visible grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-20 md:pb-0 pt-3 md:pt-0">
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
