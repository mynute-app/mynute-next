"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye } from "lucide-react";
import type { Service } from "../../../../types/company";
import Image from "next/image";
import { ServiceDescription } from "@/components/services/service-description";
import { cn } from "@/lib/utils";

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
  onViewDetails?: (service: Service) => void;
  brandColor?: string;
};

export function ServiceCard({
  service,
  onSelect,
  onViewDetails,
  brandColor,
}: Props) {
  const imageUrl = (service as any)?.design?.images?.profile?.url as
    | string
    | undefined;

  const accentBg = brandColor ? `${brandColor}18` : undefined;
  const accentBorder = brandColor ? `${brandColor}30` : undefined;

  return (
    <div
      className={cn(
        "group relative bg-card rounded-xl border border-border overflow-hidden cursor-pointer",
        "transition-all duration-200 ease-out hover:-translate-y-0.5",
        "shadow-[0_1px_3px_0_hsl(215_25%_15%/0.07)] hover:shadow-[0_6px_16px_-4px_hsl(215_25%_15%/0.12)]",
        "active:scale-[0.98]"
      )}
      onClick={() => onSelect?.(service)}
    >
      {/* Imagem do serviço */}
      <div className="relative w-full h-36 overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={service.name || "Serviço"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={
              accentBg
                ? { background: `linear-gradient(135deg, ${brandColor}22, ${brandColor}0a)` }
                : undefined
            }
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={
                accentBg
                  ? { backgroundColor: accentBg, border: `1px solid ${accentBorder}` }
                  : { backgroundColor: "hsl(var(--muted))" }
              }
            >
              <svg
                className="w-7 h-7 opacity-40"
                style={brandColor ? { color: brandColor } : undefined}
                viewBox="0 0 24 24"
                fill="none"
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
          </div>
        )}

        {/* Badge categoria */}
        {service.category && (
          <div className="absolute top-2.5 left-2.5">
            <Badge
              variant="secondary"
              className="text-xs bg-white/90 text-foreground border-0 shadow-sm backdrop-blur-sm"
            >
              {service.category}
            </Badge>
          </div>
        )}

        {/* Botão de detalhes */}
        {onViewDetails && (
          <button
            type="button"
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-lg bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
            aria-label="Ver detalhes"
            onClick={e => {
              e.stopPropagation();
              onViewDetails(service);
            }}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        {/* Nome */}
        <h3 className="font-semibold text-base leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {service.name}
        </h3>

        {/* Chips de duração e preço */}
        <div className="flex items-center flex-wrap gap-2">
          <div
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium"
            style={
              accentBg
                ? { backgroundColor: accentBg, border: `1px solid ${accentBorder}`, color: brandColor }
                : { backgroundColor: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }
            }
          >
            <Clock className="w-3 h-3" />
            {formatDuration(service.duration)}
          </div>
          {service.price != null && (
            <div
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold"
              style={
                brandColor
                  ? { backgroundColor: `${brandColor}12`, border: `1px solid ${brandColor}25`, color: brandColor }
                  : { backgroundColor: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }
              }
            >
              {formatPrice(service.price)}
            </div>
          )}
        </div>

        {/* Descrição curta */}
        {service.description && (
          <ServiceDescription
            description={service.description}
            maxItemsCollapsed={2}
            showToggle={false}
            className="text-xs text-muted-foreground"
            introClassName="text-xs text-muted-foreground leading-relaxed line-clamp-2"
            listClassName="text-xs text-muted-foreground"
            toggleClassName="text-xs"
          />
        )}

        {/* Botão de agendamento */}
        <Button
          size="sm"
          className="w-full font-semibold rounded-lg h-9"
          style={
            brandColor
              ? { backgroundColor: brandColor, color: "#fff", borderColor: brandColor }
              : undefined
          }
          onClick={e => {
            e.stopPropagation();
            onSelect?.(service);
          }}
        >
          Agendar horário
        </Button>
      </div>
    </div>
  );
}
