"use client";

import { useEffect, useState } from "react";
import { AddServiceDialog } from "./add-service-dialog";
import { EditServiceDialog } from "./edit-service-dialog";
import { DeleteServiceDialog } from "./delete-service-dailog";
import ServiceListSkeleton from "./ServiceListSkeleton";
import { Service } from "../../../../types/company";
import { useDeleteService } from "../../../hooks/service/useDeleteServiceForm";
import { useGetCompany } from "@/hooks/get-company";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";

export const ServicesPage = () => {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { company, loading } = useGetCompany();
  const { handleDelete } = useDeleteService();

  useEffect(() => {
    if (company?.services) {
      setServices(company.services);
    }
  }, [company]);

  const handleUpdateService = async (updatedService: Service) => {
    // Apenas atualiza o estado local com o serviço já processado
    setServices(prev =>
      prev.map(service =>
        service.id === updatedService.id ? updatedService : service
      )
    );
    // Atualiza o serviço selecionado se for o mesmo
    if (selectedService?.id === updatedService.id) {
      setSelectedService(updatedService);
    }
  };

  const handleDeleteService = async (id: string) => {
    const success = await handleDelete(id);
    if (success) {
      setServices(prev => prev.filter(service => service.id !== id));
      if (selectedService?.id === id) {
        setSelectedService(null);
      }
    }
  };

  const handleAddService = (newService: Service) => {
    setServices(prev => [...prev, newService]);
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[100vh] border rounded-lg shadow overflow-hidden bg-background">
      {/* Sidebar - Lista de Serviços */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-muted/30 overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-background">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Serviços</h2>
            <AddServiceDialog onCreate={handleAddService} />
          </div>
          <p className="text-xs text-muted-foreground">
            {services.length} {services.length === 1 ? "serviço" : "serviços"}{" "}
            cadastrado{services.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-3">
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </Card>
              ))}
            </div>
          ) : services.length === 0 ? (
            <Card className="p-6 text-center">
              <Briefcase className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhum serviço cadastrado
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {services.map(service => (
                <Card
                  key={service.id}
                  onClick={() => handleSelectService(service)}
                  className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedService?.id === service.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "hover:bg-accent"
                  }`}
                >
                  <p className="font-medium text-sm truncate">{service.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <DollarSign className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground truncate">
                      R$ {service.price}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content - Detalhes do Serviço */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {selectedService ? (
          <>
            {/* Header do Serviço */}
            <div className="p-6 border-b bg-background">
              <div className="flex items-start gap-4">
                {/* Imagem do Serviço */}
                <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {selectedService.design?.images?.profile?.url ? (
                    <Image
                      src={selectedService.design.images.profile.url}
                      alt={selectedService.name}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Briefcase className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold truncate">
                        {selectedService.name}
                      </h2>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>R$ {selectedService.price}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{selectedService.duration} min</span>
                        </div>
                      </div>
                      {process.env.NODE_ENV === "development" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ID: {selectedService.id}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingService(selectedService)}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingService(selectedService)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
     
                  <Card className="border hover:border-primary/30 transition-colors shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1.5 rounded-md bg-primary/10">
                          <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-xs font-medium text-muted-foreground">
                          Duração
                        </h3>
                      </div>
                      <p className="text-xl font-bold">
                        {selectedService.duration}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          min
                        </span>
                      </p>
                    </CardContent>
                  </Card>

                  {/* Card Intervalo */}
                  <Card className="border hover:border-orange-500/30 transition-colors shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1.5 rounded-md bg-orange-500/10">
                          <Clock className="w-4 h-4 text-orange-500" />
                        </div>
                        <h3 className="text-xs font-medium text-muted-foreground">
                          Intervalo
                        </h3>
                      </div>
                      <p className="text-xl font-bold">
                        {selectedService.buffer}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          min
                        </span>
                      </p>
                    </CardContent>
                  </Card>

                  {/* Card Preço */}
                  <Card className="border hover:border-green-500/30 transition-colors shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1.5 rounded-md bg-green-500/10">
                          <DollarSign className="w-4 h-4 text-green-500" />
                        </div>
                        <h3 className="text-xs font-medium text-muted-foreground">
                          Preço
                        </h3>
                      </div>
                      <p className="text-xl font-bold">
                        R${" "}
                        {Number(selectedService.price).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Card Descrição */}
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-md bg-blue-500/10">
                        <Briefcase className="w-4 h-4 text-blue-500" />
                      </div>
                      <h3 className="text-sm font-semibold">
                        Descrição do Serviço
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {selectedService.description || (
                        <span className="italic">
                          Nenhuma descrição cadastrada para este serviço.
                        </span>
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="max-w-md w-full border-none shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Selecione um serviço
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  Escolha um serviço na lista ao lado para visualizar e
                  gerenciar seus detalhes
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Modais - renderizar apenas um por vez */}
      {editingService && (
        <EditServiceDialog
          isOpen={!!editingService}
          service={{
            ...editingService,
            duration: String(editingService.duration),
            price: editingService.price
              ? String(editingService.price)
              : undefined,
          }}
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
