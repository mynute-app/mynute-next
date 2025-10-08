"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { BranchAvatar } from "@/components/ui/branch-avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Users, Briefcase } from "lucide-react";

import { Branch } from "../../../../../types/company";
import { useGetCompany } from "@/hooks/get-company";
import { useBranchApi } from "@/hooks/branch/use-branch-api";
import { BranchWorkScheduleManager } from "@/components/branch-work-schedule/branch-work-schedule-manager";

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

  // Memoizar serviços da branch selecionada para evitar recálculos
  const branchServicesData = useMemo(() => {
    if (!selectedBranch || !services.length) return [];

    return Array.isArray(selectedBranch.services)
      ? selectedBranch.services
          .map(serviceId => {
            const service = services.find(s => s.id === serviceId);
            return service ? { id: service.id, name: service.name } : null;
          })
          .filter(Boolean)
      : [];
  }, [selectedBranch, services]);

  const handleSelectBranch = useCallback(
    async (branch: Branch) => {
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
    },
    [fetchBranchById, toast]
  );

  const handleLinkService = useCallback(
    async (serviceId: number) => {
      if (!selectedBranch) return;

      try {
        const success = await linkService(selectedBranch.id, serviceId);

        if (success) {
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
    },
    [selectedBranch, linkService, fetchBranchById]
  );

  const handleUnlinkService = useCallback(
    async (serviceId: number) => {
      if (!selectedBranch) return;

      try {
        const success = await unlinkService(selectedBranch.id, serviceId);

        if (success) {
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
    },
    [selectedBranch, unlinkService, fetchBranchById]
  );

  const handleDeleteBranch = useCallback(
    (id: number) => {
      setBranches(prev => prev.filter(branch => branch.id !== id));
      if (selectedBranch?.id === id) {
        setSelectedBranch(null);
      }
    },
    [selectedBranch]
  );

  const handleAddAddress = useCallback((newAddress: any) => {
    setBranches(prev => [...prev, newAddress]);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-[90vh] border rounded-lg shadow overflow-hidden bg-background">
      {/* Sidebar - Lista de Filiais */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-muted/30 overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-background">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Filiais</h2>
            <AddAddressDialog onCreate={handleAddAddress} />
          </div>
          <p className="text-xs text-muted-foreground">
            {branches.length} {branches.length === 1 ? "filial" : "filiais"}{" "}
            cadastrada{branches.length === 1 ? "" : "s"}
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
          ) : branches.length === 0 ? (
            <Card className="p-6 text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhuma filial cadastrada
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {branches.map(branch => (
                <Card
                  key={branch.id}
                  onClick={() => handleSelectBranch(branch)}
                  className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedBranch?.id === branch.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "hover:bg-accent"
                  }`}
                >
                  <p className="font-medium text-sm truncate">{branch.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground truncate">
                      {branch.city}, {branch.state}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content - Detalhes da Filial */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {selectedBranch ? (
          <>
            {/* Header da Filial */}
            <div className="p-6 border-b bg-background">
              <div className="flex items-start gap-4">
                <BranchAvatar
                  name={selectedBranch.name}
                  imageUrl={
                    (selectedBranch as any)?.design?.images?.profile?.url
                  }
                  size="lg"
                  editable={true}
                  branchId={selectedBranch.id}
                  onImageChange={() => handleSelectBranch(selectedBranch)}
                  className="h-20 w-20 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold truncate">
                    {selectedBranch.name}
                  </h2>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm text-muted-foreground truncate">
                      {selectedBranch.street}, {selectedBranch.number} -{" "}
                      {selectedBranch.city}, {selectedBranch.state}
                    </p>
                  </div>
                  {process.env.NODE_ENV === "development" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {selectedBranch.id}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs de Conteúdo */}
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="info" className="w-full">
                <div className="border-b px-6 bg-background sticky top-0 z-10">
                  <TabsList className="w-full justify-start h-12 bg-transparent">
                    <TabsTrigger value="info" className="gap-2">
                      <MapPin className="w-4 h-4" />
                      Informações
                    </TabsTrigger>
                    <TabsTrigger value="services" className="gap-2">
                      <Briefcase className="w-4 h-4" />
                      Serviços
                      <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                        {selectedServices.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="gap-2">
                      <Clock className="w-4 h-4" />
                      Horários
                    </TabsTrigger>
                    <TabsTrigger value="employees" className="gap-2">
                      <Users className="w-4 h-4" />
                      Funcionários
                      <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                        {selectedBranch.employees?.length || 0}
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  {/* Tab: Informações */}
                  <TabsContent value="info" className="mt-0">
                    <AddressField
                      register={register}
                      watch={watch}
                      branch={selectedBranch}
                      onDelete={handleDeleteBranch}
                      index={index}
                    />
                  </TabsContent>

                  {/* Tab: Serviços */}
                  <TabsContent value="services" className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5" />
                          Serviços Disponíveis
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Vincule ou desvincule serviços desta filial
                        </p>
                      </CardHeader>
                      <CardContent>
                        {services.length === 0 ? (
                          <div className="text-center py-8">
                            <Briefcase className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Nenhum serviço cadastrado na empresa
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {services.map(service => (
                              <ServiceCard
                                key={`${service.id}-${selectedServices.join(
                                  ","
                                )}`}
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
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tab: Horários */}
                  <TabsContent value="schedule" className="mt-0">
                    <BranchWorkScheduleManager
                      branchId={selectedBranch.id.toString()}
                      branchName={selectedBranch.name}
                      branchData={{
                        ...selectedBranch,
                        services: branchServicesData,
                      }}
                      initialData={selectedBranch.work_schedule || []}
                      onSuccess={() => {
                        toast({
                          title: "Horários atualizados",
                          description:
                            "Os horários da filial foram configurados com sucesso.",
                        });
                        handleSelectBranch(selectedBranch);
                      }}
                      defaultView="view"
                    />
                  </TabsContent>

                  {/* Tab: Funcionários */}
                  <TabsContent value="employees" className="mt-0">
                    <BranchEmployees employees={selectedBranch.employees} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Selecione uma filial
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  Escolha uma filial na lista ao lado para visualizar e
                  gerenciar seus detalhes
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
