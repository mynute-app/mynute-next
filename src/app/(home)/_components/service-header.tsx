"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import type { Service } from "../../../../types/company";
import Image from "next/image";
import { ServiceDescription } from "@/components/services/service-description";

interface ServiceHeaderProps {
  service: Service;
  onBack: () => void;
}

export function ServiceHeader({ service, onBack }: ServiceHeaderProps) {
  const formatPrice = (value: unknown) => {
    const num = typeof value === "number" ? value : Number(value ?? 0);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  const formatDuration = (value?: string | number) => {
    const n = typeof value === "string" ? parseInt(value) : (value ?? 0);
    return `${n} min`;
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Serviços</h1>
        <p className="text-sm text-muted-foreground">
          Explore e selecione um serviço para continuar o agendamento. 2
        </p>
      </header>
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="shrink-0 mt-1"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>

        <div className="flex items-start gap-3 flex-1">
          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0">
            {(service as any)?.design?.images?.profile?.url ? (
              <Image
                src={(service as any).design.images.profile.url}
                alt={service.name || "Imagem do serviço"}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            ) : (
              <Image
                src="/placeholder.svg"
                alt="Imagem não disponível"
                width={48}
                height={48}
                className="object-cover w-full h-full opacity-80"
              />
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold">{service.name}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(service.duration)}
              </span>
              {service.price && (
                <span className="flex items-center gap-1">
                  {formatPrice(service.price)}
                </span>
              )}
            </div>
            <ServiceDescription
              description={service.description}
              maxItemsCollapsed={2}
              className="mt-2"
              introClassName="text-sm text-muted-foreground"
              listClassName="text-sm text-muted-foreground"
              toggleClassName="text-xs text-muted-foreground"
            />
          </div>
        </div>
      </div>
    </>
  );
}
