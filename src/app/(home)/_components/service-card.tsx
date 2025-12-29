"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock } from "lucide-react";
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
    <Card
      className="group h-full overflow-hidden border-2 md:border hover:border-primary/50 md:hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.97] md:hover:scale-[1.01]"
      onClick={() => onSelect?.(service)}
    >
      {/* Layout Mobile - Compacto e Visual */}
      <div className="flex md:hidden flex-col">
        {/* Imagem grande no topo */}
        <div className="relative w-full h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={service.name || "Imagem do serviço"}
              width={320}
              height={128}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="text-primary/20">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
          {/* Badge categoria */}
          {service.category && (
            <Badge
              className="absolute top-2 right-2 text-xs"
              variant="secondary"
            >
              {service.category}
            </Badge>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-4 space-y-3">
          {/* Nome do serviço */}
          <div>
            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
              {service.name}
            </h3>
          </div>

          {/* Info Chips - Mobile */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-primary/5 rounded-md px-2.5 py-1.5 border border-primary/10">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-foreground">
                {formatDuration(service.duration)}
              </span>
            </div>
            {service.price != null && (
              <div className="flex items-center gap-1.5 bg-primary/5 rounded-md px-2.5 py-1.5 border border-primary/10">
                <span className="font-bold text-primary">
                  {formatPrice(service.price)}
                </span>
              </div>
            )}
          </div>

          {/* Descrição - Apenas 2 linhas no mobile */}
          {service.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {service.description}
            </p>
          )}
        </div>
      </div>

      {/* Layout Desktop - Original melhorado */}
      <div className="hidden md:block">
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
                  onClick={e => {
                    e.stopPropagation();
                    setExpanded(v => !v);
                  }}
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
            onClick={e => {
              e.stopPropagation();
              onSelect?.(service);
            }}
          >
            Agendar horário
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}
