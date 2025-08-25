"use client";

import { useMemo } from "react";
import { useGetCompany } from "@/hooks/get-company";
import { ServiceList } from "@/app/(home)/_components/service-list";

export default function Page() {
  const { company, loading, error } = useGetCompany();

  const services = useMemo(() => company?.services ?? [], [company]);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Serviços</h1>
        <p className="text-sm text-muted-foreground">
          Explore e selecione um serviço para continuar o agendamento.
        </p>
      </header>

      <ServiceList
        services={services}
        loading={loading}
        error={error ?? undefined}
      />
    </div>
  );
}
