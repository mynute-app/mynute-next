"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Service } from "../../../../types/company";

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
};

export function ServiceCard({ service, onSelect }: Props) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold line-clamp-1">
          {service.name}
        </CardTitle>
        {service.category && (
          <Badge variant="secondary" className="w-fit mt-1">
            {service.category}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {service.description && (
          <p className="line-clamp-3 mb-3">{service.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span>{formatDuration(service.duration)}</span>
          {service.price != null && (
            <span className="font-medium text-foreground">
              {formatPrice(service.price)}
            </span>
          )}
        </div>
        <Separator className="my-3" />
        <Button
          size="sm"
          className="w-full"
          onClick={() => onSelect?.(service)}
        >
          Agendar
        </Button>
      </CardContent>
    </Card>
  );
}
