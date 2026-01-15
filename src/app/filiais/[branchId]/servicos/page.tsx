"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useBranchApi } from "@/hooks/branch/use-branch-api";
import { useGetCompany } from "@/hooks/get-company";
import { useToast } from "@/hooks/use-toast";
import type { Branch, Service } from "../../../../../types/company";

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div className="dashboard-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
    <div className="custom-scrollbar flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">{children}</div>
    </div>
  </div>
);

const formatDuration = (duration?: Service["duration"]) => {
  if (duration === undefined || duration === null || duration === "") return null;
  if (typeof duration === "number") return `${duration} min`;
  const numericValue = Number(duration);
  if (Number.isFinite(numericValue)) return `${numericValue} min`;
  return String(duration);
};

const formatPrice = (price?: Service["price"]) => {
  if (price === undefined || price === null || price === "") return null;
  const numericValue = Number(price);
  if (!Number.isFinite(numericValue)) return String(price);
  if (numericValue <= 0) return "Gratuito";
  return `R$ ${numericValue.toFixed(2)}`;
};

export default function FilialServicosPage() {
  const params = useParams();
  const branchIdParam = Array.isArray(params?.branchId)
    ? params.branchId[0]
    : params?.branchId;
  const branchId = typeof branchIdParam === "string" ? branchIdParam : "";

  const { company, loading: isCompanyLoading } = useGetCompany();
  const { fetchBranchById, linkService, unlinkService } = useBranchApi();
  const { toast } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [enabledServiceIds, setEnabledServiceIds] = useState<Set<string>>(
    new Set()
  );
  const [initialServiceIds, setInitialServiceIds] = useState<Set<string>>(
    new Set()
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (Array.isArray(company?.services)) {
      setServices(company.services as Service[]);
    } else {
      setServices([]);
    }
  }, [company?.services]);

  const branchName = useMemo(() => {
    if (branch?.name) return branch.name;
    const fallback = company?.branches?.find(
      item => String(item.id) === branchId
    );
    return fallback?.name ?? "Filial";
  }, [branch?.name, company?.branches, branchId]);

  useEffect(() => {
    if (!branchId) return;

    let cancelled = false;
    const loadBranch = async () => {
      const data = await fetchBranchById(branchId);
      if (cancelled) return;

      if (data) {
        setBranch(data);
        const ids = new Set((data.services ?? []).map(id => String(id)));
        setEnabledServiceIds(ids);
        setInitialServiceIds(new Set(ids));
      }
    };

    loadBranch();

    return () => {
      cancelled = true;
    };
  }, [branchId, fetchBranchById]);

  useEffect(() => {
    if (!branchId || branch || !company?.branches?.length) return;
    if (enabledServiceIds.size > 0 || initialServiceIds.size > 0) return;

    const fallbackBranch = company.branches.find(
      item => String(item.id) === branchId
    );

    if (!fallbackBranch || !Array.isArray(fallbackBranch.services)) return;

    const ids = new Set(fallbackBranch.services.map(id => String(id)));
    setEnabledServiceIds(ids);
    setInitialServiceIds(new Set(ids));
  }, [
    branchId,
    branch,
    company?.branches,
    enabledServiceIds.size,
    initialServiceIds.size,
  ]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredServices = useMemo(() => {
    if (!normalizedSearch) return services;

    return services.filter(service => {
      const haystack = [
        service.name,
        service.category ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [services, normalizedSearch]);

  const groupedCategories = useMemo(() => {
    const groups = new Map<string, Service[]>();
    filteredServices.forEach(service => {
      const category =
        typeof service.category === "string" ? service.category.trim() : "";
      const label = category || "Outros";
      const current = groups.get(label) ?? [];
      current.push(service);
      groups.set(label, current);
    });

    return Array.from(groups.entries());
  }, [filteredServices]);

  const activeCount = useMemo(
    () =>
      services.reduce(
        (total, service) =>
          total + (enabledServiceIds.has(String(service.id)) ? 1 : 0),
        0
      ),
    [services, enabledServiceIds]
  );

  const inactiveCount = Math.max(services.length - activeCount, 0);

  const hasChanges = useMemo(() => {
    if (enabledServiceIds.size !== initialServiceIds.size) return true;
    for (const id of enabledServiceIds) {
      if (!initialServiceIds.has(id)) return true;
    }
    return false;
  }, [enabledServiceIds, initialServiceIds]);

  const toggleService = (serviceId: string) => {
    setEnabledServiceIds(prev => {
      const next = new Set(prev);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      return next;
    });
  };

  const enableAll = () => {
    setEnabledServiceIds(new Set(services.map(service => String(service.id))));
  };

  const disableAll = () => {
    setEnabledServiceIds(new Set());
  };

  const handleSave = async () => {
    if (!branchId) return;

    const toEnable = services
      .filter(
        service =>
          enabledServiceIds.has(String(service.id)) &&
          !initialServiceIds.has(String(service.id))
      )
      .map(service => service.id);

    const toDisable = services
      .filter(
        service =>
          initialServiceIds.has(String(service.id)) &&
          !enabledServiceIds.has(String(service.id))
      )
      .map(service => service.id);

    if (toEnable.length === 0 && toDisable.length === 0) return;

    setIsSaving(true);

    const results = await Promise.allSettled([
      ...toEnable.map(serviceId => linkService(branchId, serviceId)),
      ...toDisable.map(serviceId => unlinkService(branchId, serviceId)),
    ]);

    const failed = results.some(
      result => result.status === "rejected" || result.value === false
    );

    const refreshed = await fetchBranchById(branchId);
    if (refreshed) {
      setBranch(refreshed);
      const ids = new Set((refreshed.services ?? []).map(id => String(id)));
      setEnabledServiceIds(ids);
      setInitialServiceIds(new Set(ids));
    } else {
      setInitialServiceIds(new Set(enabledServiceIds));
    }

    if (failed) {
      toast({
        title: "Erro ao salvar servicos",
        description:
          "Nem todas as alteracoes foram aplicadas. Revise os servicos.",
        variant: "destructive",
      });
    }

    setIsSaving(false);
  };

  if (!branchId) {
    return (
      <PageShell>
        <div className="p-6 text-muted-foreground">Filial nao encontrada.</div>
      </PageShell>
    );
  }

  const isLoading = isCompanyLoading && !company && services.length === 0;
  const isCompanyBusy = isLoading;

  return (
    <PageShell>
      <div className="space-y-6 pt-12 lg:pt-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/filiais">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="page-title">Servicos da filial</h1>
            <p className="text-muted-foreground">{branchName}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar servicos..."
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              className="pl-10"
              disabled={isCompanyBusy}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={enableAll}
              disabled={isCompanyBusy || isSaving}
            >
              <Check className="mr-2 h-4 w-4" />
              Ativar todos
            </Button>
            <Button
              variant="outline"
              onClick={disableAll}
              disabled={isCompanyBusy || isSaving}
            >
              <X className="mr-2 h-4 w-4" />
              Desativar todos
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="rounded-lg border bg-card px-4 py-3">
            <span className="text-2xl font-bold text-primary">
              {isCompanyBusy ? "-" : activeCount}
            </span>
            <span className="ml-2 text-muted-foreground">ativos</span>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3">
            <span className="text-2xl font-bold">
              {isCompanyBusy ? "-" : inactiveCount}
            </span>
            <span className="ml-2 text-muted-foreground">inativos</span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : groupedCategories.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-muted-foreground">
            Nenhum servico encontrado.
          </div>
        ) : (
          groupedCategories.map(([category, categoryServices]) => (
            <div key={category} className="space-y-3">
              <h2 className="text-lg font-semibold">{category}</h2>
              <div className="grid gap-3">
                {categoryServices.map(service => {
                  const serviceId = String(service.id);
                  const isEnabled = enabledServiceIds.has(serviceId);
                  const priceLabel = formatPrice(service.price);
                  const durationLabel = formatDuration(service.duration);

                  return (
                    <div
                      key={serviceId}
                      className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => toggleService(serviceId)}
                          disabled={isSaving}
                        />
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          {(priceLabel || durationLabel) && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {priceLabel && <span>{priceLabel}</span>}
                              {priceLabel && durationLabel && <span>|</span>}
                              {durationLabel && <span>{durationLabel}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={isEnabled ? "default" : "secondary"}>
                        {isEnabled ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        <div className="flex justify-end border-t pt-4">
          <Button
            className="btn-gradient"
            onClick={handleSave}
            disabled={!hasChanges || isSaving || isCompanyBusy}
          >
            {isSaving ? "Salvando..." : "Salvar alteracoes"}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
