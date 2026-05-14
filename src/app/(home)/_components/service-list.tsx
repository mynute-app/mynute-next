"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ServiceCard } from "@/app/(home)/_components/service-card";
import { ServiceSkeleton } from "@/app/(home)/_components/service-skeleton";
import { EmptyState } from "@/app/(home)/_components/service-empty";
import { BookingProvider } from "@/app/(home)/_components/booking";
import { BookingOrchestrator } from "@/app/(home)/_components/booking-orchestrator";
import { useServiceAvailability } from "@/hooks/service/useServiceAvailability";
import type { Service as CompanyService } from "../../../../types/company";
import { ServiceDetailsSheet } from "@/app/(home)/_components/service-details-sheet";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [detailsService, setDetailsService] = useState<Service | null>(null);

  const { fetchAvailability, loading: availabilityLoading } =
    useServiceAvailability();
  const isMobile = useIsMobile();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter(s =>
      [s.name, s.description, s.category]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q)),
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

  useEffect(() => {
    if (!detailsService) {
      return;
    }
    if (
      !isMobile &&
      typeof window !== "undefined" &&
      window.innerWidth >= 768
    ) {
      setDetailsService(null);
    }
  }, [detailsService, isMobile]);

  const handleViewDetails = (service: Service) => {
    setDetailsService(service);
  };

  const handleCloseDetails = () => {
    setDetailsService(null);
  };

  const handleContinueFromDetails = async (service: Service) => {
    setDetailsService(null);
    await handleServiceSelect(service);
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
    <>
      <div className="flex flex-col h-full md:block md:space-y-5">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-3 md:pb-0 md:static">
          <header className="mb-3 md:mb-5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Serviços
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Selecione o serviço desejado para agendar
            </p>
          </header>
          <div className="relative flex items-center">
            <svg
              className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar serviço..."
              className="h-10 pl-9 text-sm bg-card border-border rounded-xl shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex-1 overflow-auto md:overflow-visible grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24 md:pb-0 pt-4 md:pt-2">
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
          <ul className="flex-1 overflow-auto md:overflow-visible grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24 md:pb-0 pt-4 md:pt-2">
            {filtered.map(s => (
              <li key={String(s.id)}>
                <ServiceCard
                  service={s}
                  brandColor={brandColor}
                  onSelect={handleServiceSelect}
                  onViewDetails={handleViewDetails}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {isMobile && (
        <ServiceDetailsSheet
          service={detailsService}
          open={!!detailsService}
          onClose={handleCloseDetails}
          onContinue={handleContinueFromDetails}
          brandColor={brandColor}
        />
      )}
    </>
  );
}
