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
import { Clock, Save, X, Users, Building2 } from "lucide-react";
import { useGetCompany } from "@/hooks/get-company";
import { useEmployeeWorkRangeServices } from "@/hooks/employee/use-employee-work-range-services";
import { useToast } from "@/hooks/use-toast";

interface EmployeeWorkRangeEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: EmployeeWorkRangeEditData;
  branches?: Array<{ id: string; name: string }>;
  services?: Array<{ id: string; name: string }>;
  loading?: boolean;
  disableWeekdayEdit?: boolean;
  employeeId: string;
  workRangeId: string;
}

interface EmployeeWorkRangeEditData {
  start_time: string;
  end_time: string;
  weekday: number;
  time_zone: string;
  branch_id: string;
  services: string[];
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

export function EmployeeWorkRangeEditDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
  branches = [],
  services = [],
  loading = false,
  disableWeekdayEdit = true,
  employeeId,
  workRangeId,
}: EmployeeWorkRangeEditDialogProps) {
  const { company, loading: loadingCompany } = useGetCompany();
  const { toast } = useToast();
  const { addServicesToEmployeeWorkRange, removeServiceFromEmployeeWorkRange } =
    useEmployeeWorkRangeServices();

  // Estado para rastrear serviços iniciais
  const [initialServices, setInitialServices] = useState<string[]>([]);

  const [formData, setFormData] = useState<EmployeeWorkRangeEditData>(
    () =>
      initialData || {
        start_time: "09:00",
        end_time: "17:00",
        weekday: 1,
        time_zone: "America/Sao_Paulo",
        branch_id: branches[0]?.id || "",
        services: [],
      }
  );

  // Atualizar formData E initialServices quando initialData mudar
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setInitialServices(initialData.services || []);
    }
  }, [initialData]);

  const handleSave = async () => {
    try {
      // Validar branch_id obrigatório
      if (!formData.branch_id) {
        throw new Error("Selecione uma filial");
      }

      // Dados básicos do work_range (horários, dia, timezone, branch)
      const basicData = {
        start_time: formData.start_time,
        end_time: formData.end_time,
        weekday: formData.weekday,
        time_zone: formData.time_zone,
        branch_id: formData.branch_id,
      };

      await onSave(basicData);

      // ✅ DETECÇÃO DE MUDANÇAS NOS SERVIÇOS
      if (workRangeId !== "new") {
        const currentServices = formData.services;

        // Serviços que foram ADICIONADOS
        const servicesToAdd = currentServices.filter(
          serviceId => !initialServices.includes(serviceId)
        );

        // Serviços que foram REMOVIDOS
        const servicesToRemove = initialServices.filter(
          serviceId => !currentServices.includes(serviceId)
        );

        // Executar adições e remoções em paralelo
        const operations: Promise<any>[] = [];

        // Adicionar novos serviços
        if (servicesToAdd.length > 0) {
          operations.push(
            addServicesToEmployeeWorkRange(
              employeeId,
              workRangeId,
              servicesToAdd,
              { showToast: false }
            )
          );
        }

        // Remover serviços desmarcados (chamadas individuais em paralelo)
        if (servicesToRemove.length > 0) {
          servicesToRemove.forEach(serviceId => {
            operations.push(
              removeServiceFromEmployeeWorkRange(
                employeeId,
                workRangeId,
                serviceId,
                { showToast: false }
              )
            );
          });
        }

        // Aguardar todas as operações
        if (operations.length > 0) {
          await Promise.all(operations);

          // Toast consolidado
          const messages: string[] = [];
          if (servicesToRemove.length > 0) {
            messages.push(
              `${servicesToRemove.length} serviço${
                servicesToRemove.length !== 1 ? "s" : ""
              } removido${servicesToRemove.length !== 1 ? "s" : ""}`
            );
          }
          if (servicesToAdd.length > 0) {
            messages.push(
              `${servicesToAdd.length} serviço${
                servicesToAdd.length !== 1 ? "s" : ""
              } adicionado${servicesToAdd.length !== 1 ? "s" : ""}`
            );
          }

          toast({
            title: "Serviços atualizados",
            description: messages.join(" e "),
          });
        }
      } else {
        // Novo work_range: apenas adicionar serviços se houver
        if (formData.services.length > 0) {
          await addServicesToEmployeeWorkRange(
            employeeId,
            workRangeId,
            formData.services
          );
        }
      }

      onClose();
    } catch (error) {
      console.error("❌ Dialog - Erro ao salvar:", error);
      throw error; // Re-throw para mostrar erro no toast
    }
  };

  const updateField = (field: keyof EmployeeWorkRangeEditData, value: any) => {
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
        company?.services?.map(service => service.id.toString()) || [];
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
  const allServicesSelected =
    company?.services &&
    company.services.length > 0 &&
    formData.services.length === company.services.length;

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
              ? "Configure o horário de trabalho para este dia."
              : "Modifique os detalhes do horário de trabalho."}
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
            <Label htmlFor="branch_id" className="text-right">
              <Building2 className="w-4 h-4 inline mr-1" />
              Filial
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.branch_id}
                onValueChange={value => updateField("branch_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma filial" />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {loadingCompany ? (
                <div className="text-sm text-muted-foreground">
                  Carregando serviços...
                </div>
              ) : company?.services && company.services.length > 0 ? (
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
                      Selecionar Todos ({company.services.length})
                    </Label>
                  </div>

                  {/* Lista de Serviços */}
                  <div className="border rounded-md">
                    <div className="max-h-40 overflow-y-auto p-3">
                      <div className="grid grid-cols-1 gap-2">
                        {company.services.map(service => (
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
                        {formData.services.length} de {company.services.length}{" "}
                        selecionados
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground p-4 border rounded-md text-center">
                  Nenhum serviço disponível
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !formData.branch_id}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
