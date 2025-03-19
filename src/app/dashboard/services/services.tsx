"use client";

import { useState, useEffect } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ServiceCard from "./service-card";
import { AddServiceDialog } from "./add-service-dialog";
import { EditServiceDialog } from "./edit-service-dialog";
import { DeleteServiceDialog } from "./delete-service-dailog";
import ServiceCardSkeleton from "./ServiceCardSkeleton";
import ServiceListSkeleton from "./ServiceListSkeleton";
import { useGetCompany } from "@/hooks/get-one-company";

type Service = {
  id: string;
  name: string;
  duration: string;
  buffer?: string; // Agora é opcional
  price?: string; // Agora é opcional
  location?: string;
  category?: string;
  hidden?: boolean;
};

export const ServicesPage = () => {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  const companyId = 1;
  const { company, loading } = useGetCompany(companyId);
  const services: Service[] = company?.services ?? [];

  // Função para atualizar um serviço
  const handleUpdateService = async (updatedService: Service) => {
    console.log("log");
  };

  const handleDeleteService = async (id: string) => {
    console.log("aaee");
  };
  useEffect(() => {
    console.log("🛠️ Serviços da empresa:", services);
  }, [services]);
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-50 p-4 border-r">
        <h2 className="text-lg font-semibold mb-4">Services & Classes</h2>

        {/* Services Section */}
        <div>
          {loading ? (
            <ServiceListSkeleton />
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Services ({services.length})
                </h3>
                <Button variant="ghost" size="sm" className="p-0 text-gray-500">
                  <PlusIcon className="w-4 h-4" />
                </Button>
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
      <div className="w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-light text-gray-700">
            Services ({services.length})
          </h2>
          <AddServiceDialog />
        </div>

        {/* Renderizando cada serviço */}
        <div className="space-y-4">
          {loading ? (
            // Renderiza múltiplos skeletons para simular a lista
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
                onEdit={() => setEditingService(service)}
                onDelete={() => {
                  console.log("Definindo serviço para exclusão:", service);
                  setDeletingService(service);
                }}
              />
            ))
          ) : (
            <p>Nenhum serviço encontrado.</p>
          )}
        </div>
      </div>

      {/* Modal de edição */}
      {editingService && (
        <EditServiceDialog
          service={editingService} // Serviço selecionado para edição
          onSave={updatedService => {
            handleUpdateService(updatedService); // Chama a função para salvar
            setEditingService(null); // Fecha o modal após salvar
          }}
          onCancel={() => setEditingService(null)} // Fecha o modal ao cancelar
        />
      )}

      {deletingService && (
        <DeleteServiceDialog
          serviceName={deletingService.name}
          onConfirm={() => {
            handleDeleteService(deletingService.id); // Exclui o serviço
            setDeletingService(null); // Fecha o modal
          }}
          onCancel={() => setDeletingService(null)} // Fecha o modal sem excluir
        />
      )}
    </div>
  );
};
