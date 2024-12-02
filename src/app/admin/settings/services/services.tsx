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

type ServiceCategory = {
  id: number;
  name: string;
  items: string[];
};

type Service = {
  id: string;
  title: string;
  duration: string;
  buffer?: string; // Agora é opcional
  cost?: string; // Agora é opcional
  location?: string;
  category?: string;
  hidden?: boolean;
};

export const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ServiceCategory[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  // Função para buscar serviços
  const fetchServices = async () => {
    try {
      const response = await fetch("http://localhost:3333/services");
      if (!response.ok) {
        throw new Error("Erro ao buscar serviços");
      }
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar um serviço
  const handleUpdateService = async (updatedService: Service) => {
    try {
      // Fazendo uma requisição para atualizar o serviço no backend
      const response = await fetch(
        `http://localhost:3333/services/${updatedService.id}`,
        {
          method: "PUT", // Método PUT para atualização
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedService), // Corpo da requisição
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar o serviço.");
      }

      const updatedData = await response.json();

      // Atualiza o estado local
      setServices(prev =>
        prev.map(service =>
          service.id === updatedData.id ? updatedData : service
        )
      );

      console.log("Serviço atualizado:", updatedData);
    } catch (error) {
      console.error("Erro ao atualizar o serviço:", error);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3333/services/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao excluir serviço");
      setServices(prev => prev.filter(service => service.id !== id));
      console.log("Serviço excluído:", id);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

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
                    {service.title}
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
                name={service.title}
                duration={`${service.duration} min`}
                buffer={`${service.buffer} min`}
                price={`R$ ${service.cost}`}
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
          serviceName={deletingService.title}
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
