"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useToast } from "@/hooks/use-toast";
import { ServiceCard } from "./service-card";
import { AddressField } from "./address-field";
import { BusinessSchema } from "../../../../../schema";
import { AddAddressDialog } from "./add-address-dialog";
import { Separator } from "@/components/ui/separator";
import { BranchEmployees } from "./branch-employees";
import { BranchWorkScheduleManager } from "@/components/branch-work-schedule/branch-work-schedule-manager";

import { Branch } from "../../../../../types/company";
import { useGetCompany } from "@/hooks/get-company";
import { useBranchApi } from "@/hooks/branch/use-branch-api";

type BranchForm = Omit<Branch, "id" | "services">;

export default function BranchManager() {
  const { company, loading } = useGetCompany();
  const { toast } = useToast();
  const { fetchBranchById, linkService, unlinkService } = useBranchApi();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

  const services = company?.services ?? [];

  const form = useForm<BranchForm>({
    resolver: zodResolver(BusinessSchema),
    defaultValues: {
      name: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      zip_code: "",
      city: "",
      state: "",
      country: "",
    },
  });

  const { register, watch } = form;

  useEffect(() => {
    if (company?.branches) {
      setBranches(company.branches);
    }
  }, [company]);

  const index = branches.findIndex(b => b.id === selectedBranch?.id);

  const handleSelectBranch = async (branch: Branch) => {
    try {
      const updated = await fetchBranchById(branch.id);
      if (updated) {
        setSelectedBranch(updated);
        setSelectedServices(updated.services || []);
      }
    } catch (error) {
      toast({
        title: "Erro ao buscar filial",
        description:
          "Não foi possível carregar os dados atualizados da filial.",
        variant: "destructive",
      });
    }
  };

  const handleLinkService = async (serviceId: number) => {
    if (!selectedBranch) return;

    try {
      const success = await linkService(selectedBranch.id, serviceId);

      if (success) {
        // Busca a filial pelo ID para obter os dados mais atualizados
        const updatedBranch = await fetchBranchById(selectedBranch.id);
        if (updatedBranch) {
          setSelectedBranch(updatedBranch);
          setSelectedServices(updatedBranch.services || []);
          setBranches(prev =>
            prev.map(b => (b.id === updatedBranch.id ? updatedBranch : b))
          );
        }
      }
    } catch (err) {
      console.error("❌ Erro no handleLinkService:", err);
    }
  };

  const handleUnlinkService = async (serviceId: number) => {
    if (!selectedBranch) return;

    try {
      const success = await unlinkService(selectedBranch.id, serviceId);

      if (success) {
        // Busca a filial pelo ID para obter os dados mais atualizados
        const updatedBranch = await fetchBranchById(selectedBranch.id);
        if (updatedBranch) {
          setSelectedBranch(updatedBranch);
          setSelectedServices(updatedBranch.services || []);
          setBranches(prev =>
            prev.map(b => (b.id === updatedBranch.id ? updatedBranch : b))
          );
        }
      }
    } catch (err) {
      console.error("❌ Erro no handleUnlinkService:", err);
    }
  };

  const handleDeleteBranch = (id: number) => {
    setBranches(prev => prev.filter(branch => branch.id !== id));
    if (selectedBranch?.id === id) {
      setSelectedBranch(null);
    }
  };

  const handleAddAddress = (newAddress: any) => {
    setBranches(prev => [...prev, newAddress]);
  };

  return (
    <div className="flex flex-col md:flex-row h-[90vh] border rounded-lg shadow overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r p-4 overflow-y-auto bg-gray-50">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Filiais</h2>
          <AddAddressDialog onCreate={handleAddAddress} />
        </div>
        <Separator className="my-3" />
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="p-3 rounded-md border bg-white shadow-sm">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          branches.map(branch => (
            <div
              key={branch.id}
              onClick={() => handleSelectBranch(branch)}
              className={`p-3 rounded-md border bg-white shadow-sm mb-3 cursor-pointer transition-colors ${
                selectedBranch?.id === branch.id
                  ? "border-primary bg-primary/5"
                  : "hover:bg-gray-100"
              }`}
            >
              <p className="font-medium">{branch.name}</p>
              <p className="text-xs text-muted-foreground">{branch.city}</p>
            </div>
          ))
        )}
      </div>

      {/* Detail View */}
      <div className="w-full md:w-2/3 p-6 overflow-y-auto">
        {selectedBranch ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {selectedBranch.name} – {selectedBranch.street}
              </h2>
            </div>

            <AddressField
              register={register}
              watch={watch}
              branch={selectedBranch}
              onDelete={handleDeleteBranch}
              index={index}
              branchData={selectedBranch} // Passa os dados da branch para evitar fetch duplicado
            />

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-2">Serviços vinculados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                {services.map(service => (
                  <ServiceCard
                    key={`${service.id}-${selectedServices.join(",")}`}
                    service={{
                      ...service,
                      duration:
                        service.duration !== undefined
                          ? Number(service.duration)
                          : undefined,
                    }}
                    isLinked={selectedServices.includes(service.id)}
                    onLink={handleLinkService}
                    onUnlink={handleUnlinkService}
                  />
                ))}
              </div>
            </div>

            <div className="mt-10">
              <BranchWorkScheduleManager
                branchId={selectedBranch.id.toString()}
                branchName={selectedBranch.name}
                branchData={selectedBranch} // Passar dados da branch para otimização
                initialData={selectedBranch.work_schedule || []}
                services={
                  Array.isArray(selectedBranch.services)
                    ? selectedBranch.services.map(serviceId => {
                        const service = services.find(s => s.id === serviceId);
                        return service
                          ? { id: service.id.toString(), name: service.name }
                          : { id: serviceId.toString(), name: "Serviço" };
                      })
                    : []
                }
                onSuccess={() => {
                  toast({
                    title: "Horários atualizados",
                    description:
                      "Os horários da filial foram configurados com sucesso.",
                  });
                  // Opcionalmente, recarregar dados da filial
                  if (selectedBranch?.id) {
                    handleSelectBranch(selectedBranch);
                  }
                }}
                defaultView="view"
              />
            </div>

            <div className="mt-10">
              <BranchEmployees employees={selectedBranch.employees} />
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            Selecione uma filial à esquerda para visualizar os detalhes.
          </p>
        )}
      </div>
    </div>
  );
}
