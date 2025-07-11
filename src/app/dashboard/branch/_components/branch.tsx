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
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { Employee } from "../../../../../types/company";
import { AboutSection } from "../../your-team/about-section";
import { ServicesSection } from "../../your-team/services-section";
import { BreaksSection } from "../../your-team/breakssection";
import { Branch } from "../../your-team/branch-section";
import { useGetCompany } from "@/hooks/get-company";

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
  image?: string;
  services?: number[];
  employees?: Employee[];
}


type BranchForm = Omit<Branch, "id" | "services">;
type Tab = "about" | "services" | "branch" | "breaks";

export default function BranchManager() {
  const { company, loading } = useGetCompany();
  const { toast } = useToast();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [employeeTab, setEmployeeTab] = useState<Tab>("about");

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
        setSelectedEmployee(null);
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
        {
          method: "POST",
        }
      );

      if (!res.ok) throw new Error("Erro ao vincular o serviço");

      // Busca a filial pelo ID para obter os dados mais atualizados
      const updatedBranch = await fetchBranchById(selectedBranch.id);
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
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Erro ao desvincular o serviço");

      // Busca a filial pelo ID para obter os dados mais atualizados
      const updatedBranch = await fetchBranchById(selectedBranch.id);
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

  const fetchBranchById = async (id: number): Promise<Branch | null> => {
    try {
      const res = await fetch(`/api/branch/${id}`);
      if (!res.ok) throw new Error("Erro ao buscar filial por ID");

      const branchData = await res.json();

      return {
        ...branchData,
        services: Array.isArray(branchData.services)
          ? branchData.services.map((s: any) =>
              typeof s === "number" ? s : s.id
            )
          : [],
        employees: branchData.employees ?? [],
      };
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível buscar os dados da filial por ID.",
        variant: "destructive",
      });
      return null;
    }
  };

  const renderEmployeeTabContent = () => {
    if (!selectedEmployee) return null;

    switch (employeeTab) {
      case "about":
        return <AboutSection selectedMember={selectedEmployee} />;
      case "services":
        return (
          <ServicesSection
            selectedMember={selectedEmployee}
            setSelectedMember={setSelectedEmployee}
          />
        );
      case "branch":
        return (
          <Branch
            selectedMember={selectedEmployee}
            setSelectedMember={setSelectedEmployee}
          />
        );
      case "breaks":
        return <BreaksSection selectedMember={selectedEmployee} />;

      default:
        return null;
    }
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
              {selectedEmployee && (
                <Button
                  variant="ghost"
                  onClick={() => setSelectedEmployee(null)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
            </div>

            {selectedEmployee ? (
              <>
                {/* Employee Tabs */}
                <div className="flex space-x-4 border-b mb-4">
                  <button
                    onClick={() => setEmployeeTab("about")}
                    className={`py-2 ${
                      employeeTab === "about"
                        ? "border-b-2 border-black font-medium"
                        : ""
                    }`}
                  >
                    Sobre
                  </button>
                  <button
                    onClick={() => setEmployeeTab("services")}
                    className={`py-2 ${
                      employeeTab === "services"
                        ? "border-b-2 border-black font-medium"
                        : ""
                    }`}
                  >
                    Serviços
                  </button>
                  <button
                    onClick={() => setEmployeeTab("branch")}
                    className={`py-2 ${
                      employeeTab === "branch"
                        ? "border-b-2 border-black font-medium"
                        : ""
                    }`}
                  >
                    Filial
                  </button>
                  <button
                    onClick={() => setEmployeeTab("breaks")}
                    className={`py-2 ${
                      employeeTab === "breaks"
                        ? "border-b-2 border-black font-medium"
                        : ""
                    }`}
                  >
                    Breaks
                  </button>
                </div>

                {renderEmployeeTabContent()}
              </>
            ) : (
              <>
                <AddressField
                  register={register}
                  watch={watch}
                  branch={selectedBranch}
                  onDelete={handleDeleteBranch}
                  index={index}
                />

                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-2">
                    Serviços vinculados
                  </h3>
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
                  <BranchEmployees
                    employees={selectedBranch.employees}
                    onSelectEmployee={setSelectedEmployee}
                  />
                </div>
              </>
            )}
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
