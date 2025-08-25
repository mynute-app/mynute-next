"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ServiceCard } from "@/app/(home)/_components/service-card";
import { ServiceSkeleton } from "@/app/(home)/_components/service-skeleton";
import { EmptyState } from "@/app/(home)/_components/service-empty";
import type { Service as CompanyService } from "../../../../types/company";

export type Service = CompanyService;

type Props = {
  services: Service[];
  loading?: boolean;
  error?: string;
  brandColor?: string;
};

export function ServiceList({ services, loading, error, brandColor }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter(s =>
      [s.name, s.description, s.category]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    );
  }, [services, query]);

  return (
    <div className="space-y-4">
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
              <ServiceCard service={s} brandColor={brandColor} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
