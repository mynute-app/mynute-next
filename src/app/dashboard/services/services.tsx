"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { AddServiceDialog } from "./add-service-dialog";
import { EditServiceDialog } from "./edit-service-dialog";
import { DeleteServiceDialog } from "./delete-service-dailog";
import type { Service } from "../../../../types/company";
import { useDeleteService } from "../../../hooks/service/useDeleteServiceForm";
import { useServiceApi } from "@/hooks/services/use-service-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { autoLinkService } from "@/lib/services/auto-link-service";
import { ServiceDescription } from "@/components/services/service-description";
import {
  Briefcase,
  Clock,
  DollarSign,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const ServicesPage = () => {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { fetchServices } = useServiceApi();
  const { handleDelete } = useDeleteService();
  const { toast } = useToast();

  const loadServices = useCallback(
    async (force = false) => {
      setIsLoading(true);
      const result = await fetchServices(1, 50, force);
      if (result) {
        setServices(result.services);
      }
      setIsLoading(false);
    },
    [fetchServices],
  );

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  const categories = useMemo(() => {
    const uniqueCategories = services
      .map(service => service.category?.trim())
      .filter((category): category is string => Boolean(category));
    return ["Todos", ...Array.from(new Set(uniqueCategories))];
  }, [services]);

  const categoryOptions = useMemo(
    () => categories.filter(category => category !== "Todos"),
    [categories],
  );

  const filteredServices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return services.filter(service => {
      const name = service.name?.toLowerCase() || "";
      const description = service.description?.toLowerCase() || "";
      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        description.includes(normalizedSearch);
      const matchesCategory =
        selectedCategory === "Todos" || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, selectedCategory]);

  const handleUpdateService = (updatedService: Service) => {
    setServices(prev =>
      prev.map(service =>
        service.id === updatedService.id
          ? { ...service, ...updatedService }
          : service,
      ),
    );
  };

  const handleDeleteService = async (id: string) => {
    const success = await handleDelete(id);
    if (success) {
      setServices(prev => prev.filter(service => service.id !== id));
    }
  };

  const handleToggleStatus = async (service: Service, newValue: boolean) => {
    setServices(prev =>
      prev.map(s => (s.id === service.id ? { ...s, is_active: newValue } : s)),
    );
    try {
      const response = await fetch(`/api/service/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newValue }),
      });
      if (!response.ok) throw new Error();
      const updated = await response.json();
      setServices(prev =>
        prev.map(s => (s.id === updated.id ? { ...s, ...updated } : s)),
      );
    } catch {
      setServices(prev =>
        prev.map(s =>
          s.id === service.id ? { ...s, is_active: !newValue } : s,
        ),
      );
      toast({
        title: "Erro ao atualizar status do serviço",
        variant: "destructive",
      });
    }
  };

  const handleAddService = (newService: Service) => {
    setServices(prev => [...prev, newService]);
    void loadServices(true);
  };

  const formatPrice = (price: Service["price"]) => {
    if (price === undefined || price === null || price === "") {
      return "Preço não informado";
    }
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) return "Preço não informado";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numericPrice);
  };

  const formatDuration = (duration: Service["duration"]) => {
    if (duration === undefined || duration === null || duration === "") {
      return "Duração não informada";
    }
    const numericDuration = Number(duration);
    if (!Number.isNaN(numericDuration) && numericDuration > 0) {
      return `${numericDuration} min`;
    }
    if (typeof duration === "string") {
      return duration;
    }
    return "Duração não informada";
  };

  const hasFilters =
    searchTerm.trim().length > 0 || selectedCategory !== "Todos";
  const firstImageIndex = filteredServices.findIndex(
    service => service.design?.images?.profile?.url,
  );

  return (
    <div className="services-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
          <div className="space-y-6 pb-12 lg:pt-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="page-header mb-0">
                <h1 className="page-title">Serviços</h1>
                <p className="page-description">
                  Gerencie os serviços oferecidos pela sua empresa.
                </p>
              </div>
              <Button
                className="btn-gradient"
                onClick={() => setAddDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Serviço
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar serviço..."
                    className="pl-9 input-focus"
                    value={searchTerm}
                    onChange={event => setSearchTerm(event.target.value)}
                  />
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-muted p-1 overflow-x-auto">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "whitespace-nowrap",
                        selectedCategory === category
                          ? "bg-background text-foreground shadow-sm border border-border"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                  >
                    <Skeleton className="h-32 w-full" />
                    <div className="space-y-3 p-5">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                      <div className="flex gap-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
                <Briefcase className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-3 text-sm font-medium">
                  {hasFilters
                    ? "Nenhum serviço encontrado"
                    : "Nenhum serviço cadastrado"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasFilters
                    ? "Tente ajustar a busca ou os filtros."
                    : "Crie seu primeiro serviço para começar a gerenciá-los aqui."}
                </p>
                {!hasFilters && (
                  <Button
                    className="mt-4 gap-2 btn-gradient"
                    onClick={() => setAddDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Criar serviço
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
                {filteredServices.map((service, index) => {
                  const imageUrl = service.design?.images?.profile?.url;
                  const priceLabel = formatPrice(service.price);
                  const durationLabel = formatDuration(service.duration);
                  const isInactive =
                    service.is_active === false ||
                    (service.is_active === undefined &&
                      service.hidden === true);
                  const isActive = !isInactive;
                  const hasPrice =
                    service.price !== undefined &&
                    service.price !== null &&
                    service.price !== "" &&
                    !Number.isNaN(Number(service.price));

                  return (
                    <div
                      key={service.id}
                      className={cn(
                        "flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm card-hover",
                        isInactive && "opacity-60",
                      )}
                    >
                      <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                        {imageUrl ? (
                          // Use plain img for local dev URLs (localhost), Image component for production URLs
                          imageUrl.includes("localhost") ||
                          imageUrl.includes("127.0.0.1") ? (
                            <img
                              src={imageUrl}
                              alt={service.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Image
                              src={imageUrl}
                              alt={service.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              priority={index === firstImageIndex}
                              className="object-cover"
                            />
                          )
                        ) : (
                          <Briefcase className="h-8 w-8 text-muted-foreground" />
                        )}
                        {isInactive && (
                          <Badge
                            variant="destructive"
                            className="absolute right-3 top-3"
                          >
                            Inativo
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {service.name}
                            </h3>
                            {service.category && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {service.category}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="mb-4">
                          {service.description ? (
                            <ServiceDescription
                              description={service.description}
                              maxItemsCollapsed={2}
                              introClassName="text-sm text-muted-foreground"
                              listClassName="text-sm text-muted-foreground"
                              toggleClassName="text-xs text-muted-foreground"
                            />
                          ) : (
                            <span className="italic text-sm text-muted-foreground">
                              Nenhuma descrição cadastrada.
                            </span>
                          )}
                        </div>

                        <div className="mb-4 flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <DollarSign
                              className={cn(
                                "h-4 w-4",
                                hasPrice
                                  ? "text-success"
                                  : "text-muted-foreground",
                              )}
                            />
                            <span
                              className={cn(
                                "font-semibold text-foreground",
                                !hasPrice && "text-muted-foreground",
                              )}
                            >
                              {priceLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{durationLabel}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border p-4">
                        <div className="flex items-start gap-2">
                          <Switch
                            checked={isActive}
                            onCheckedChange={checked =>
                              handleToggleStatus(service, checked)
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            {isActive ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingService(service)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeletingService(service)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddServiceDialog
        isOpen={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreate={handleAddService}
      />

      {editingService && (
        <EditServiceDialog
          isOpen={!!editingService}
          service={{
            ...editingService,
            duration: editingService.duration
              ? String(editingService.duration)
              : "",
            price: editingService.price ? String(editingService.price) : "",
            imageUrl: editingService.design?.images?.profile?.url,
            category: editingService.category,
            is_active: editingService.is_active,
            show_image: editingService.show_image,
          }}
          categories={categoryOptions}
          onOpenChange={open => {
            if (!open) {
              setEditingService(null);
            }
          }}
          onSave={updatedService => {
            handleUpdateService(updatedService);
            setEditingService(null);
          }}
        />
      )}

      {deletingService && (
        <DeleteServiceDialog
          isOpen={!!deletingService}
          serviceName={deletingService.name}
          onConfirm={() => {
            handleDeleteService(deletingService.id);
            setDeletingService(null);
          }}
          onCancel={() => setDeletingService(null)}
        />
      )}
    </div>
  );
};
