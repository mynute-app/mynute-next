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

  const imageUrl = (service as any)?.design?.images?.profile?.url as
    | string
    | undefined;

  return (
    <div className="space-y-4">
      {/* Título da seção */}
      <header>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Agendamento
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Selecione uma data e horário disponível
        </p>
      </header>

      {/* Card do serviço selecionado */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border shadow-[0_1px_3px_0_hsl(215_25%_15%/0.07)]">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0 h-8 w-8 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={service.name || "Imagem do serviço"}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <svg
                className="w-5 h-5 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-base leading-tight line-clamp-1 text-foreground">
            {service.name}
          </h2>
          <div className="flex items-center flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(service.duration)}
            </span>
            {service.price != null && (
              <span className="font-medium text-foreground">
                {formatPrice(service.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

