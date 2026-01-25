"use client";

import Image from "next/image";
import { ArrowLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ServiceDescription } from "@/components/services/service-description";
import type { Service } from "../../../../types/company";

type ServiceDetailsSheetProps = {
  service: Service | null;
  open: boolean;
  onClose: () => void;
  onContinue: (service: Service) => void;
  brandColor?: string;
};

function formatPrice(value: unknown) {
  const num = typeof value === "number" ? value : Number(value ?? 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

function formatDuration(value?: string | number) {
  const n = typeof value === "string" ? parseInt(value) : (value ?? 0);
  return `${n} min`;
}

export function ServiceDetailsSheet({
  service,
  open,
  onClose,
  onContinue,
  brandColor,
}: ServiceDetailsSheetProps) {
  if (!service) {
    return null;
  }

  const imageUrl = (service as any)?.design?.images?.profile?.url as
    | string
    | undefined;
  const priceLabel =
    service.price !== undefined && service.price !== null
      ? formatPrice(service.price)
      : null;

  return (
    <Sheet
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <SheetContent
        side="right"
        className="w-full max-w-full p-0 md:hidden [&>button]:hidden"
      >
        <SheetTitle className="sr-only">Detalhes do serviço</SheetTitle>
        <div className="flex h-full flex-col bg-background">
          <div className="flex items-center gap-2 border-b px-4 py-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Detalhes do servico
              </p>
              <h2 className="text-base font-semibold truncate">
                {service.name}
              </h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <div className="relative h-40 w-full overflow-hidden rounded-xl bg-muted">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={service.name || "Imagem do servico"}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Clock className="h-8 w-8 opacity-60" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold text-foreground">
                  {formatDuration(service.duration)}
                </span>
              </div>
              {priceLabel && (
                <div className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5">
                  <span className="font-bold text-primary">{priceLabel}</span>
                </div>
              )}
              {service.category && (
                <Badge variant="outline" className="text-xs">
                  {service.category}
                </Badge>
              )}
            </div>

            <ServiceDescription
              description={service.description}
              defaultExpanded
              showToggle={false}
              introClassName="text-sm font-medium text-foreground/90"
              listClassName="text-sm text-muted-foreground/90"
            />
          </div>

          <div className="border-t px-4 py-4 space-y-2">
            <Button
              type="button"
              className="w-full"
              style={
                brandColor
                  ? {
                      backgroundColor: brandColor,
                      color: "#fff",
                      borderColor: brandColor,
                    }
                  : undefined
              }
              onClick={() => onContinue(service)}
            >
              Continuar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onClose}
            >
              Voltar para servicos
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
