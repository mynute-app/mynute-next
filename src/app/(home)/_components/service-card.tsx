"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Service } from "../../../../types/company";
import Image from "next/image";

function formatPrice(value: unknown) {
  const num = typeof value === "number" ? value : Number(value ?? 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

function formatDuration(value?: string | number) {
  const n = typeof value === "string" ? parseInt(value) : value ?? 0;
  return `${n} min`;
}

type Props = {
  service: Service;
  onSelect?: (service: Service) => void;
  brandColor?: string;
};

export function ServiceCard({ service, onSelect, brandColor }: Props) {
  const imageUrl = (service as any)?.design?.images?.profile?.url as
    | string
    | undefined;
  const [expanded, setExpanded] = useState(false);
  const hasLongDescription = useMemo(
    () => (service.description ? service.description.length > 140 : false),
    [service.description]
  );
  return (
    <div>
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            <div className="relative w-14 h-14 rounded-md overflow-hidden bg-muted shrink-0">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={service.name || "Imagem do serviço"}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Image
                  src="/placeholder.svg"
                  alt="Imagem não disponível"
                  width={56}
                  height={56}
                  className="object-cover w-full h-full opacity-80"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold line-clamp-1">
                  {service.name}
                </CardTitle>
                {service.category && (
                  <Badge variant="secondary" className="ml-auto">
                    {service.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {/* Info chips */}
          
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
              <span className="text-muted-foreground">Duração:</span>
              <span className="font-medium text-foreground">
                {formatDuration(service.duration)}
              </span>
            </div>
            {service.price != null && (
              <div className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
                <span className="text-muted-foreground">Valor:</span>
                <span className="font-medium text-foreground">
                  {formatPrice(service.price)}
                </span>
              </div>
            )}
          </div>

          {service.description && (
            <>
              <p
                className={`${
                  expanded ? "line-clamp-none" : "line-clamp-3"
                } mb-1`}
              >
                {service.description}
              </p>
              {hasLongDescription && (
                <button
                  type="button"
                  onClick={() => setExpanded(v => !v)}
                  className="text-xs text-gray-600 hover:underline cursor-pointer"
                >
                  {expanded ? "Ver menos" : "Ver mais"}
                </button>
              )}
            </>
          )}
          <Separator className="my-3" />
          <Button
            size="sm"
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
            onClick={() => onSelect?.(service)}
          >
            Agendar horário
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
