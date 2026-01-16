"use client";

import { useEffect, useRef, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Service } from "../../../../types/company";
import { toast } from "@/hooks/use-toast";
import {
  Briefcase,
  CheckCircle,
  Clock,
  Calendar,
  Plus,
  Trash2,
} from "lucide-react";
import { useGetCompany } from "@/hooks/get-company";

type Props = {
  selectedMember: any | null;
  setSelectedMember: (member: any) => void;
  onReloadMember?: () => void;
};

type WorkRange = {
  id: string | number;
  weekday: number;
  start_time: string;
  end_time: string;
  branch?: { name?: string };
  services?: Array<{ id: string | number } | string | number>;
};

const weekdayNames = [
  "Domingo",
  "Segunda",
  "Terca",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sabado",
];

const formatTime = (time: string): string => {
  if (!time) return "";

  if (time.includes("T")) {
    const timePart = time.split("T")[1];
    return timePart.substring(0, 5);
  }

  if (time.includes(" ")) {
    const timePart = time.split(" ")[1];
    return timePart.substring(0, 5);
  }

  return time.substring(0, 5);
};

const toServiceIds = (
  services: WorkRange["services"] | undefined
): string[] => {
  if (!Array.isArray(services)) return [];

  return services
    .map(service =>
      typeof service === "object" && service !== null
        ? service.id
        : service
    )
    .filter(value => value !== undefined && value !== null)
    .map(value => value.toString());
};

export function WorkRangeServicesSection({
  selectedMember,
  setSelectedMember,
  onReloadMember,
}: Props) {
  const { company, loading: loadingCompany } = useGetCompany();
  const allServices: Service[] = company?.services ?? [];
  const employeeServices: Service[] = selectedMember?.services ?? [];

  const [selectedWorkRangeId, setSelectedWorkRangeId] = useState<string>("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [workRanges, setWorkRanges] = useState<WorkRange[]>([]);
  const [showServiceManager, setShowServiceManager] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const previousMemberIdRef = useRef<string | number | null>(null);

  const handleLinkService = async (serviceId: number) => {
    if (!selectedMember) return;

    try {
      const res = await fetch(
        `/api/employee/${selectedMember.id}/service/${serviceId}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) throw new Error("Erro ao vincular o servico");

      const newService = allServices.find(service => service.id === serviceId);
      if (newService) {
        setSelectedMember({
          ...selectedMember,
          services: [...(selectedMember.services ?? []), newService],
        });
      }

      toast({
        title: "Servico vinculado",
        description: `O servico foi vinculado ao funcionario ${selectedMember.name}.`,
      });
      onReloadMember?.();
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

      if (!res.ok) throw new Error("Erro ao desvincular o servico");

      const updatedServices =
        selectedMember.services?.filter((service: Service) =>
          service.id !== serviceId
        ) ?? [];

      setSelectedMember({
        ...selectedMember,
        services: updatedServices,
      });

      setSelectedServiceIds(prev =>
        prev.filter(id => id !== serviceId.toString())
      );

      toast({
        title: "Servico desvinculado",
        description: `O servico foi removido do funcionario ${selectedMember.name}.`,
        variant: "destructive",
      });
      onReloadMember?.();
    } catch (err) {
      toast({
        title: "Erro ao desvincular",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (
      selectedMember?.work_schedule &&
      Array.isArray(selectedMember.work_schedule)
    ) {
      const ranges = selectedMember.work_schedule.map((schedule: any) => ({
        id: schedule.id,
        weekday: schedule.weekday,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        branch: schedule.branch,
        services: schedule.services || [],
      }));
      setWorkRanges(ranges);
    } else {
      setWorkRanges([]);
    }

    const nextMemberId = selectedMember?.id ?? null;
    if (previousMemberIdRef.current !== nextMemberId) {
      setSelectedWorkRangeId("");
      setSelectedServiceIds([]);
      previousMemberIdRef.current = nextMemberId;
    }
  }, [selectedMember]);

  useEffect(() => {
    if (selectedWorkRangeId && selectedMember?.id) {
      const selectedRange = workRanges.find(
        range => range.id.toString() === selectedWorkRangeId
      );
      setSelectedServiceIds(toServiceIds(selectedRange?.services));
      return;
    }

    setSelectedServiceIds([]);
  }, [selectedWorkRangeId, selectedMember?.id, workRanges]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServiceIds(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  };

  const handleSaveServices = async () => {
    if (!selectedMember?.id || !selectedWorkRangeId) {
      toast({
        title: "Erro",
        description: "Selecione um funcionario e um horario",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/employee/${selectedMember.id}/work_range/${selectedWorkRangeId}/services`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            services: selectedServiceIds.map(id => ({ id })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao salvar servicos");
      }

      const updatedWorkRanges = workRanges.map(range => {
        if (range.id.toString() === selectedWorkRangeId) {
          const updatedServices = employeeServices.filter(service =>
            selectedServiceIds.includes(service.id.toString())
          );
          return { ...range, services: updatedServices };
        }
        return range;
      });
      setWorkRanges(updatedWorkRanges);
      onReloadMember?.();

      toast({
        title: "Sucesso",
        description: "Servicos configurados com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar servicos do horario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAllServices = async () => {
    if (!selectedMember?.id || !selectedWorkRangeId) {
      toast({
        title: "Erro",
        description: "Selecione um funcionario e um horario",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/employee/${selectedMember.id}/work_range/${selectedWorkRangeId}/services`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ services: [] }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao remover servicos");
      }

      setSelectedServiceIds([]);

      const updatedWorkRanges = workRanges.map(range => {
        if (range.id.toString() === selectedWorkRangeId) {
          return { ...range, services: [] };
        }
        return range;
      });
      setWorkRanges(updatedWorkRanges);
      onReloadMember?.();

      toast({
        title: "Sucesso",
        description: "Todos os servicos foram removidos do horario!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover servicos do horario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAllServices = () => {
    setSelectedServiceIds(
      employeeServices.map(service => service.id.toString())
    );
  };

  const handleClearSelectedServices = () => {
    setSelectedServiceIds([]);
  };

  const getRangeServiceCount = (range: WorkRange) => {
    if (range.id.toString() === selectedWorkRangeId) {
      return selectedServiceIds.length;
    }
    return toServiceIds(range.services).length;
  };

  const selectedWorkRange = workRanges.find(
    range => range.id.toString() === selectedWorkRangeId
  );

  if (loadingCompany) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/2 mb-2" />
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
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        Selecione um funcionario para gerenciar os servicos por horario.
      </div>
    );
  }

  if (!workRanges.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <Clock className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium text-foreground">Sem horarios configurados</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure os horarios na aba "Filiais e horarios" primeiro.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Servicos por horario</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure quais servicos o funcionario pode realizar em cada horario
          especifico.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Label>Selecionar horario</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Escolha o horario especifico para configurar os servicos.
              </p>
            </div>
           
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {workRanges.map(range => {
              const isSelected =
                range.id.toString() === selectedWorkRangeId;
              const rangeLabel = weekdayNames[range.weekday] || "Dia";
              const serviceCount = getRangeServiceCount(range);

              return (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => setSelectedWorkRangeId(range.id.toString())}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-medium">{rangeLabel}</span>
                  <Clock className="w-3 h-3 ml-1" />
                  <span className="text-xs text-muted-foreground">
                    {formatTime(range.start_time)} -{" "}
                    {formatTime(range.end_time)}
                  </span>
                  {range.branch?.name && (
                    <span className="text-xs text-muted-foreground">
                      ({range.branch.name})
                    </span>
                  )}
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {serviceCount} servico(s)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedWorkRange ? (
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <Label>Configurar servicos</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Selecione os servicos disponiveis para{" "}
                  <span className="font-medium text-foreground">
                    {weekdayNames[selectedWorkRange.weekday] || "Dia"}
                  </span>{" "}
                  ({formatTime(selectedWorkRange.start_time)} -{" "}
                  {formatTime(selectedWorkRange.end_time)})
                  {selectedWorkRange.branch?.name && (
                    <span> - {selectedWorkRange.branch.name}</span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllServices}
                  disabled={
                    !selectedWorkRangeId ||
                    isLoading ||
                    employeeServices.length === 0
                  }
                >
                  Marcar todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearSelectedServices}
                  disabled={!selectedWorkRangeId || isLoading}
                >
                  Limpar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAllServices}
                  disabled={
                    !selectedWorkRangeId ||
                    isLoading ||
                    selectedServiceIds.length === 0
                  }
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover todos
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveServices}
                  disabled={!selectedWorkRangeId || isLoading}
                >
                  Salvar alteracoes
                </Button>
              </div>
            </div>

            {isLoading && (
              <div className="text-xs text-muted-foreground">
                Salvando servicos...
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              {selectedServiceIds.length} servico(s) selecionado(s)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {!employeeServices.length ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <p>
                    Este funcionario nao possui servicos vinculados. Vincule
                    servicos na aba "Servicos" ou use "Gerenciar servicos"
                    acima.
                  </p>
                </div>
              ) : (
                employeeServices.map(service => {
                  const isSelected = selectedServiceIds.includes(
                    service.id.toString()
                  );
                  const price =
                    service.price && Number(service.price) > 0
                      ? `R$ ${Number(service.price).toFixed(2)}`
                      : "Gratuito";
                  const durationLabel = service.duration
                    ? `${service.duration} min`
                    : "--";

                  return (
                    <div
                      key={service.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() =>
                        handleServiceToggle(service.id.toString())
                      }
                      onKeyDown={event => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleServiceToggle(service.id.toString());
                        }
                      }}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 opacity-60"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        className="mt-0.5 pointer-events-none"
                        tabIndex={-1}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          {isSelected && (
                            <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm font-medium truncate ${
                              isSelected ? "text-primary" : ""
                            }`}
                          >
                            {service.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{durationLabel}</span>
                          <span>{price}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Selecione um horario para visualizar os servicos.
          </div>
        )}
      </div>
    </div>
  );
}
