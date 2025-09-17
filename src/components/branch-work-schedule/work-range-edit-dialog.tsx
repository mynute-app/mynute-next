"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Save, X, Users } from "lucide-react";
import { useGetBranch } from "@/hooks/branch/use-get-branch";
import { useWorkRangeServices } from "@/hooks/workSchedule/use-work-range-services";

interface WorkRangeEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>; // Aceita qualquer tipo para flexibilidade
  initialData?: WorkRangeEditData;
  loading?: boolean;
  disableWeekdayEdit?: boolean; // Nova prop para desabilitar edição do dia da semana
  branchId: string; // ID da branch - necessário para as rotas
  workRangeId: string; // ID do work_range - necessário para as rotas
  onSuccessfulSave?: () => void; // Callback para atualizar dados do pai
  branchData?: any; // Dados completos da branch para evitar fetch desnecessário
}

interface WorkRangeEditData {
  start_time: string;
  end_time: string;
  weekday: number;
  time_zone: string;
  services: string[]; // Array de IDs dos serviços selecionados (como string para o UI)
}

const diasSemana = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

const gerarHorarios = () => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      times.push(timeString);
    }
  }
  return times;
};

const opcoesHorario = gerarHorarios();

export function WorkRangeEditDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading = false,
  disableWeekdayEdit = true, // Por padrão, desabilita edição do dia da semana
  branchId,
  workRangeId,
  onSuccessfulSave, // Novo callback
  branchData: externalBranchData,
}: WorkRangeEditDialogProps) {
  const { data: branchData, isLoading: loadingBranch } = useGetBranch({
    branchId: branchId,
    enabled: !externalBranchData, // Só busca se não tiver dados externos
  });

  // Usar dados externos se disponíveis, senão usar dados do hook
  const currentBranchData = externalBranchData || branchData;

  // Hook para gerenciar serviços do work_range
  const {
    addServicesToWorkRange,
    removeServiceFromWorkRange,
    loading: servicesLoading,
  } = useWorkRangeServices({
    onSuccess: () => {
      // Notificar o componente pai para atualizar dados
      onSuccessfulSave?.();
    },
    onError: error => {
      console.error("❌ Erro ao atualizar serviços:", error);
    },
  });

  // Log para debug - mostrar dados recebidos quando abre o dialog
  if (isOpen && initialData) {
    const diaLabel =
      diasSemana.find(dia => dia.value === initialData.weekday)?.label ||
      "Indefinido";
  }

  const [formData, setFormData] = useState<WorkRangeEditData>(
    () =>
      initialData || {
        start_time: "09:00",
        end_time: "17:00",
        weekday: 1,
        time_zone: "America/Sao_Paulo",
        services: [],
      }
  );

  // Atualizar formData quando initialData mudar
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      // 1. Salvar dados básicos do work_range (horários, dia, timezone)
      const basicData = {
        start_time: formData.start_time,
        end_time: formData.end_time,
        weekday: formData.weekday,
        time_zone: formData.time_zone,
      };

      await onSave(basicData);

      // 2. Atualizar serviços do work_range apenas se não for um novo registro
      if (
        workRangeId &&
        workRangeId !== "new" &&
        formData.services.length > 0
      ) {
        await addServicesToWorkRange(branchId, workRangeId, formData.services);
      } else if (workRangeId === "new") {
      } else {
        console.log("ℹ️ Dialog - Nenhum serviço selecionado para adicionar");
      }

      // 3. Notificar o componente pai para atualizar dados
      onSuccessfulSave?.();

      onClose();
    } catch (error) {
      console.error("❌ Dialog - Erro ao salvar:", error);
    }
  };

  const updateField = (field: keyof WorkRangeEditData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Funções para gerenciar seleção de serviços
  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, serviceId],
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter(id => id !== serviceId),
      }));
    }
  };

  const handleSelectAllServices = (checked: boolean) => {
    if (checked) {
      const allServiceIds =
        currentBranchData?.services
          ?.filter(
            (service: any) =>
              service && (service.id || service.id === 0) && service.name
          ) // Filtrar serviços válidos
          ?.map((service: any) => service.id.toString()) || [];
      setFormData(prev => ({
        ...prev,
        services: allServiceIds,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        services: [],
      }));
    }
  };

  // Verificar se todos os serviços estão selecionados
  const validServices =
    currentBranchData?.services?.filter(
      (service: any) =>
        service && (service.id || service.id === 0) && service.name
    ) || [];

  const allServicesSelected =
    validServices.length > 0 &&
    formData.services.length === validServices.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {workRangeId === "new" ? "Configurar Horário" : "Editar Horário"}
          </DialogTitle>
          <DialogDescription>
            {workRangeId === "new"
              ? "Configure o horário de funcionamento para este dia."
              : "Modifique os detalhes do horário de funcionamento."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weekday" className="text-right">
              Dia da Semana
            </Label>
            <div className="col-span-3">
              {disableWeekdayEdit ? (
                <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                  {diasSemana.find(dia => dia.value === formData.weekday)
                    ?.label || "Indefinido"}
                </div>
              ) : (
                <Select
                  value={formData.weekday.toString()}
                  onValueChange={value =>
                    updateField("weekday", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[10000]">
                    {diasSemana.map(dia => (
                      <SelectItem key={dia.value} value={dia.value.toString()}>
                        {dia.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start_time" className="text-right">
              Início
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.start_time}
                onValueChange={value => updateField("start_time", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  {opcoesHorario.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end_time" className="text-right">
              Fim
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.end_time}
                onValueChange={value => updateField("end_time", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  {opcoesHorario.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time_zone" className="text-right">
              Fuso Horário
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.time_zone}
                onValueChange={value => updateField("time_zone", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="America/Sao_Paulo">
                    América/São Paulo (GMT-3)
                  </SelectItem>
                  <SelectItem value="America/New_York">
                    América/Nova York (GMT-5)
                  </SelectItem>
                  <SelectItem value="Europe/London">
                    Europa/Londres (GMT+0)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Campo de Serviços */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="services" className="text-right pt-2">
              <Users className="w-4 h-4 inline mr-1" />
              Serviços
            </Label>
            <div className="col-span-3">
              {!externalBranchData && loadingBranch ? (
                <div className="text-sm text-muted-foreground">
                  Carregando serviços...
                </div>
              ) : validServices.length > 0 ? (
                <div className="space-y-3">
                  {/* Opção "Selecionar Todos" */}
                  <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted/50">
                    <Checkbox
                      id="select-all-services"
                      checked={allServicesSelected}
                      onCheckedChange={handleSelectAllServices}
                    />
                    <Label
                      htmlFor="select-all-services"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Selecionar Todos ({validServices.length})
                    </Label>
                  </div>

                  {/* Lista de Serviços - Melhorada para muitos itens */}
                  <div className="border rounded-md">
                    <div className="max-h-40 overflow-y-auto p-3">
                      <div className="grid grid-cols-1 gap-2">
                        {validServices.map((service: any) => (
                          <div
                            key={service.id}
                            className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded border-b border-muted/30 last:border-b-0"
                          >
                            <Checkbox
                              id={`service-${service.id}`}
                              checked={formData.services.includes(
                                service.id.toString()
                              )}
                              onCheckedChange={checked =>
                                handleServiceToggle(
                                  service.id.toString(),
                                  checked as boolean
                                )
                              }
                            />
                            <Label
                              htmlFor={`service-${service.id}`}
                              className="text-sm cursor-pointer flex-1 leading-none"
                            >
                              {service.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer com contador */}
                    <div className="p-2 bg-muted/20 border-t text-center">
                      <span className="text-xs text-muted-foreground">
                        {formData.services.length} de {validServices.length}{" "}
                        selecionados
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground p-4 border rounded-md text-center">
                  Nenhum serviço disponível nesta filial
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading || servicesLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || servicesLoading}>
            <Save className="w-4 h-4 mr-2" />
            {loading || servicesLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
