"use client";
import { useState, useEffect } from "react";
import { useCompany } from "@/hooks/get-company";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";

import { useToast } from "@/hooks/use-toast";
import { ServiceCard } from "./service-card";
import { AddressField } from "../../your-brand/_components/address-field";
import { BusinessSchema } from "../../../../../schema";
import { AddAddressDialog } from "../../your-brand/_components/add-address-dialog";
import { Separator } from "@/components/ui/separator";

// Tipos
interface Branch {
  id: number;
  name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
  services?: number[];
}

interface Service {
  id: number;
  name: string;
  description?: string;
  duration?: number;
  price?: number;
}

type BranchForm = Omit<Branch, "id" | "services">;

export default function BranchManager() {
  const { company, loading } = useCompany();
  const { toast } = useToast();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

  const services: Service[] = company?.services ?? [];

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
      const updated = await fetchBranchByName(branch.name);
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
      const res = await fetch(
        `/api/branch/${selectedBranch.id}/service/${serviceId}`,
        { method: "POST" }
      );

      if (!res.ok) throw new Error("Erro ao vincular o serviço");

      const updatedBranch = await fetchBranchByName(selectedBranch.name);
      if (updatedBranch) {
        setSelectedBranch(updatedBranch);
        setSelectedServices(updatedBranch.services || []);

        setBranches(prev =>
          prev.map(b => (b.id === updatedBranch.id ? updatedBranch : b))
        );
      }

      toast({
        title: "Serviço vinculado",
        description: `Serviço vinculado à filial ${selectedBranch.name}.`,
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleUnlinkService = async (serviceId: number) => {
    if (!selectedBranch) return;

    try {
      const res = await fetch(
        `/api/branch/${selectedBranch.id}/service/${serviceId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Erro ao desvincular o serviço");

      const updatedBranch = await fetchBranchByName(selectedBranch.name);
      if (updatedBranch) {
        setSelectedBranch(updatedBranch);
        setSelectedServices(updatedBranch.services || []);

        setBranches(prev =>
          prev.map(b => (b.id === updatedBranch.id ? updatedBranch : b))
        );
      }

      toast({
        title: "Serviço desvinculado",
        description: `Serviço removido da filial ${selectedBranch.name}.`,
        variant: "destructive",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: (err as Error).message,
        variant: "destructive",
      });
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

  const fetchBranchByName = async (name: string): Promise<Branch | null> => {
    try {
      const res = await fetch(`/api/branch/name/${encodeURIComponent(name)}`);

      if (!res.ok) throw new Error("Erro ao buscar filial");

      const branchData = await res.json();

      return {
        ...branchData,
        services: Array.isArray(branchData.services)
          ? branchData.services.map((s: any) =>
              typeof s === "number" ? s : s.id
            )
          : [],
      };
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados da filial.",
        variant: "destructive",
      });
      return null;
    }
  };

  return (
    <div className="flex h-[80vh] border rounded-lg shadow overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r p-4 overflow-y-auto bg-gray-50">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold"> Filiais </h2>
          <AddAddressDialog onCreate={handleAddAddress} />
        </div>
        <Separator className="my-3" />
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
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
      <div className="w-2/3 p-6 overflow-y-auto">
        {selectedBranch ? (
          <>
            <h2 className="text-xl font-semibold mb-4">
              {selectedBranch.name} – {selectedBranch.street}
            </h2>

            <AddressField
              register={register}
              watch={watch}
              branch={selectedBranch}
              onDelete={handleDeleteBranch}
              index={index}
            />

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-2">Serviços vinculados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                {services.map(service => (
                  <ServiceCard
                    key={`${service.id}-${selectedServices.join(",")}`}
                    service={service}
                    isLinked={selectedServices.includes(service.id)}
                    onLink={handleLinkService}
                    onUnlink={handleUnlinkService}
                  />
                ))}
              </div>
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
