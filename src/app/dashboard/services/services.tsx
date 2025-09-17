"use client";

import { useEffect, useState } from "react";
import ServiceCard from "./service-card";
import { AddServiceDialog } from "./add-service-dialog";
import { EditServiceDialog } from "./edit-service-dialog";
import { DeleteServiceDialog } from "./delete-service-dailog";
import ServiceCardSkeleton from "./ServiceCardSkeleton";
import ServiceListSkeleton from "./ServiceListSkeleton";
import { Service } from "../../../../types/company";
import { useDeleteService } from "../../../hooks/service/useDeleteServiceForm";
import { useGetCompany } from "@/hooks/get-company";

export const ServicesPage = () => {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const { company, loading } = useGetCompany();
  const { handleDelete } = useDeleteService();
  useEffect(() => {
    if (company?.services) {
      setServices(company.services);
    }
  }, [company]);
  console.log("Serviços carregados:", company?.services);
  const handleUpdateService = async (updatedService: Service) => {
    // Apenas atualiza o estado local com o serviço já processado
    setServices(prev =>
      prev.map(service =>
        service.id === updatedService.id ? updatedService : service
      )
    );
  };

  const handleDeleteService = async (id: string) => {
    const success = await handleDelete(id);
    if (success) {
      setServices(prev => prev.filter(service => service.id !== id));
    }
  };
  const handleAddService = (newService: Service) => {
    setServices(prev => [...prev, newService]);
  };
  return (
    <div className="flex h-screen min-h-0 pb-16">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-50 p-4 border-r overflow-y-auto">
        {/* Services Section */}
        <div>
          {loading ? (
            <ServiceListSkeleton />
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Serviços ({services.length})
                </h3>
                <AddServiceDialog onCreate={handleAddService} />
              </div>
              <ul className="mt-2 space-y-1">
                {services.map(service => (
                  <li
                    key={service.id}
                    className="text-sm text-gray-700 p-2 rounded hover:bg-gray-100"
                  >
                    {service.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto min-h-0">
        {/* Renderizando cada serviço */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <ServiceCardSkeleton key={index} />
            ))
          ) : services.length > 0 ? (
            services.map(service => (
              <ServiceCard
                key={service.id}
                name={service.name}
                duration={`${service.duration} min`}
                buffer={`${service.buffer} min`}
                price={`R$ ${service.price}`}
                imageUrl={service.design?.images?.profile?.url}
                onEdit={() => {
                  setEditingService(service);
                }}
                onDelete={() => {
                  setDeletingService(service);
                }}
              />
            ))
          ) : (
            <p>Nenhum serviço encontrado.</p>
          )}
        </div>
      </div>

      {/* Modais - renderizar apenas um por vez */}
      {editingService && (
        <EditServiceDialog
          isOpen={!!editingService}
          service={editingService}
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
