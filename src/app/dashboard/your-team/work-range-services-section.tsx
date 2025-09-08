"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Service } from "../../../../types/company";
import { toast } from "@/hooks/use-toast";
import {
  CheckCircle,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Search,
} from "lucide-react";
import { useGetCompany } from "@/hooks/get-company";
import { useEmployeeWorkRangeServices } from "@/hooks/employee/use-employee-work-range-services";
import { useEmployeeWorkRange } from "@/hooks/workSchedule/use-employee-work-range";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  selectedMember: any | null;
  setSelectedMember: (member: any) => void;
};

const weekdayNames = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export function WorkRangeServicesSection({
  selectedMember,
  setSelectedMember,
}: Props) {
  const { company, loading: loadingCompany } = useGetCompany();
  const allServices: Service[] = company?.services ?? [];

  // Filtrar apenas serviços vinculados ao funcionário
  const employeeServices: Service[] = selectedMember?.services ?? [];

  const [selectedWorkRangeId, setSelectedWorkRangeId] = useState<string>("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [workRanges, setWorkRanges] = useState<any[]>([]);
  const [showServiceManager, setShowServiceManager] = useState<boolean>(false);

  const {
    getEmployeeWorkRangeServices,
    addServicesToEmployeeWorkRange,
    updateEmployeeWorkRangeServices,
    removeAllEmployeeWorkRangeServices,
    loading: servicesLoading,
    data: workRangeServices,
    error: servicesError,
  } = useEmployeeWorkRangeServices({
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Operação realizada com sucesso!",
      });
      // Recarregar services do work_range se necessário
      if (selectedWorkRangeId && selectedMember?.id) {
        getEmployeeWorkRangeServices(
          selectedMember.id.toString(),
          selectedWorkRangeId
        );
      }
    },
    onError: error => {
      toast({
        title: "Erro",
        description: error,
        variant: "destructive",
      });
    },
  });

  // Funções para vincular/desvincular serviços do employee (reutilizadas da aba Serviços)
  const handleLinkService = async (serviceId: number) => {
    if (!selectedMember) return;

    try {
      const res = await fetch(
        `/api/employee/${selectedMember.id}/service/${serviceId}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) throw new Error("Erro ao vincular o serviço");

      const newService = allServices.find(s => s.id === serviceId);
      if (newService) {
        setSelectedMember({
          ...selectedMember,
          services: [...(selectedMember.services ?? []), newService],
        });
      }

      toast({
        title: "Serviço vinculado",
        description: `O serviço foi vinculado ao funcionário ${selectedMember.name}.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao vincular",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleUnlinkService = async (serviceId: number) => {
    if (!selectedMember) return;

    try {
      const res = await fetch(
        `/api/employee/${selectedMember.id}/service/${serviceId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Erro ao desvincular o serviço");

      const updatedServices =
        selectedMember.services?.filter((s: Service) => s.id !== serviceId) ??
        [];

      setSelectedMember({
        ...selectedMember,
        services: updatedServices,
      });

      // Se o serviço estava selecionado para o work_range, remover da seleção
      setSelectedServiceIds(prev =>
        prev.filter(id => id !== serviceId.toString())
      );

      toast({
        title: "Serviço desvinculado",
        description: `O serviço foi removido do funcionário ${selectedMember.name}.`,
        variant: "destructive",
      });
    } catch (err) {
      toast({
        title: "Erro ao desvincular",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  // Carregar work_ranges do employee quando selecionar um membro
  useEffect(() => {
    if (
      selectedMember?.work_schedule &&
      Array.isArray(selectedMember.work_schedule)
    ) {
      // Converter work_schedule para work_ranges se necessário
      const ranges = selectedMember.work_schedule.map((schedule: any) => ({
        id: schedule.id,
        weekday: schedule.weekday,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        branch: schedule.branch,
        services: schedule.services || [],
      }));
      setWorkRanges(ranges);
    }
  }, [selectedMember]);

  // Carregar services do work_range quando selecionar um
  useEffect(() => {
    if (selectedWorkRangeId && selectedMember?.id) {
      getEmployeeWorkRangeServices(
        selectedMember.id.toString(),
        selectedWorkRangeId
      );
    }
  }, [selectedWorkRangeId, selectedMember?.id]);

  // Atualizar selectedServiceIds quando workRangeServices mudar
  useEffect(() => {
    if (
      workRangeServices?.services &&
      Array.isArray(workRangeServices.services)
    ) {
      const serviceIds = workRangeServices.services.map((service: any) =>
        service.id.toString()
      );
      setSelectedServiceIds(serviceIds);
    } else {
      setSelectedServiceIds([]);
    }
  }, [workRangeServices]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServiceIds(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleSaveServices = async () => {
    if (!selectedMember?.id || !selectedWorkRangeId) {
      toast({
        title: "Erro",
        description: "Selecione um funcionário e um horário",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateEmployeeWorkRangeServices(
        selectedMember.id.toString(),
        selectedWorkRangeId,
        selectedServiceIds
      );
    } catch (error) {
      console.error("Erro ao salvar services:", error);
    }
  };

  const handleRemoveAllServices = async () => {
    if (!selectedMember?.id || !selectedWorkRangeId) {
      toast({
        title: "Erro",
        description: "Selecione um funcionário e um horário",
        variant: "destructive",
      });
      return;
    }

    try {
      await removeAllEmployeeWorkRangeServices(
        selectedMember.id.toString(),
        selectedWorkRangeId
      );
      setSelectedServiceIds([]);
    } catch (error) {
      console.error("Erro ao remover services:", error);
    }
  };

  const selectedWorkRange = workRanges.find(
    wr => wr.id.toString() === selectedWorkRangeId
  );

  if (loadingCompany) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedMember) {
    return (
      <div className="flex justify-center items-center h-40 text-muted-foreground">
        Selecione um funcionário para gerenciar os serviços por horário.
      </div>
    );
  }

  if (!workRanges.length) {
    return (
      <div className="flex justify-center items-center h-40 text-muted-foreground">
        Este funcionário não possui horários configurados. Configure os horários
        na aba "Jornada de trabalho" primeiro.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Serviços por Horário</h3>
          <p className="text-sm text-muted-foreground">
            Configure quais serviços o funcionário pode realizar em cada horário
            específico
          </p>
        </div>
      </div>

      {/* Work Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Selecionar Horário
          </CardTitle>
          <CardDescription>
            Escolha o horário específico para configurar os serviços
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedWorkRangeId}
            onValueChange={setSelectedWorkRangeId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um horário..." />
            </SelectTrigger>
            <SelectContent>
              {workRanges.map(workRange => (
                <SelectItem key={workRange.id} value={workRange.id.toString()}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {weekdayNames[workRange.weekday]}
                    </Badge>
                    <span>
                      {workRange.start_time} - {workRange.end_time}
                    </span>
                    {workRange.branch?.name && (
                      <span className="text-muted-foreground">
                        • {workRange.branch.name}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedWorkRange && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">
                    {weekdayNames[selectedWorkRange.weekday]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {selectedWorkRange.start_time} -{" "}
                    {selectedWorkRange.end_time}
                  </span>
                </div>
                {selectedWorkRange.branch?.name && (
                  <Badge variant="secondary">
                    {selectedWorkRange.branch.name}
                  </Badge>
                )}
              </div>
              {servicesLoading && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Carregando serviços...
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services Configuration */}
      {selectedWorkRangeId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Configurar Serviços
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowServiceManager(!showServiceManager)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Gerenciar Serviços
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAllServices}
                  disabled={servicesLoading || selectedServiceIds.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover Todos
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveServices}
                  disabled={servicesLoading}
                >
                  Salvar Alterações
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Selecione os serviços que o funcionário pode realizar neste
              horário.
              {selectedServiceIds.length > 0 && (
                <span className="ml-2 font-medium">
                  {selectedServiceIds.length} serviço(s) selecionado(s)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!employeeServices.length ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Este funcionário não possui serviços vinculados.</p>
                <p className="text-sm mt-2">
                  Vincule serviços na aba "Serviços" primeiro, ou use o botão
                  "Gerenciar Serviços" abaixo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employeeServices.map((service: Service) => {
                  const isSelected = selectedServiceIds.includes(
                    service.id.toString()
                  );

                  return (
                    <Card
                      key={service.id}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleServiceToggle(service.id.toString())}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              handleServiceToggle(service.id.toString())
                            }
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {isSelected && (
                                <CheckCircle className="text-green-500 w-4 h-4 flex-shrink-0" />
                              )}
                              <h4 className="font-medium truncate">
                                {service.name}
                              </h4>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {service.duration} min
                            </div>
                            <div className="text-sm font-medium mt-1">
                              {service.price && Number(service.price) > 0
                                ? `R$ ${Number(service.price).toFixed(2)}`
                                : "Gratuito"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Service Manager */}
      {showServiceManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Gerenciar Serviços do Funcionário
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowServiceManager(false)}
              >
                ✕
              </Button>
            </CardTitle>
            <CardDescription>
              Vincule ou desvincule serviços do funcionário. Apenas serviços
              vinculados podem ser configurados por horário.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allServices.map((service: Service) => {
                const isLinked = employeeServices.some(
                  s => s.id === service.id
                );

                return (
                  <Card
                    key={service.id}
                    className="flex flex-col justify-between"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        {isLinked && (
                          <CheckCircle className="text-green-500 w-5 h-5" />
                        )}
                        <span className="text-sm font-medium">
                          {service.name}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {service.duration} min •{" "}
                        {service.price && Number(service.price) > 0
                          ? `R$ ${Number(service.price).toFixed(2)}`
                          : "Gratuito"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {isLinked ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => handleUnlinkService(service.id)}
                        >
                          Desvincular
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full"
                          onClick={() => handleLinkService(service.id)}
                        >
                          Vincular
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {servicesError && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="text-sm text-destructive">
              Erro ao carregar serviços: {servicesError}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
