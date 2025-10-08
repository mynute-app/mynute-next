"use client";

import { useState, useEffect, useCallback, memo } from "react";
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
import { DIAS_SEMANA, HORARIOS, TIMEZONES } from "./constants";

interface WorkRangeEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: WorkRangeEditData;
  loading?: boolean;
  disableWeekdayEdit?: boolean;
  branchId: string;
  workRangeId: string;
  onSuccessfulSave?: () => void;
  branchData?: any;
}

interface WorkRangeEditData {
  start_time: string;
  end_time: string;
  weekday: number;
  time_zone: string;
  services: string[];
}

const ServiceCheckboxList = memo(
  ({
    services,
    selectedServices,
    onToggle,
    onSelectAll,
  }: {
    services: any[];
    selectedServices: string[];
    onToggle: (id: string, checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
  }) => {
    const validServices = services.filter(
      s => s && (s.id || s.id === 0) && s.name
    );
    const allSelected =
      validServices.length > 0 &&
      selectedServices.length === validServices.length;

    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted/50">
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={onSelectAll}
          />
          <Label
            htmlFor="select-all"
            className="text-sm font-medium cursor-pointer"
          >
            Selecionar Todos ({validServices.length})
          </Label>
        </div>

        <div className="border rounded-md">
          <div className="max-h-40 overflow-y-auto p-3">
            <div className="grid grid-cols-1 gap-2">
              {validServices.map(service => (
                <div
                  key={service.id}
                  className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded border-b border-muted/30 last:border-b-0"
                >
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={selectedServices.includes(service.id.toString())}
                    onCheckedChange={checked =>
                      onToggle(service.id.toString(), checked as boolean)
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

          <div className="p-2 bg-muted/20 border-t text-center">
            <span className="text-xs text-muted-foreground">
              {selectedServices.length} de {validServices.length} selecionados
            </span>
          </div>
        </div>
      </div>
    );
  }
);

ServiceCheckboxList.displayName = "ServiceCheckboxList";

export function WorkRangeEditDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading = false,
  disableWeekdayEdit = true,
  branchId,
  workRangeId,
  onSuccessfulSave,
  branchData: externalBranchData,
}: WorkRangeEditDialogProps) {
  const { data: branchData, isLoading: loadingBranch } = useGetBranch({
    branchId,
    enabled: !externalBranchData,
  });

  const currentBranchData = externalBranchData || branchData;

  const { addServicesToWorkRange, loading: servicesLoading } =
    useWorkRangeServices({
      onSuccess: () => onSuccessfulSave?.(),
    });

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

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleSave = useCallback(async () => {
    const basicData = {
      start_time: formData.start_time,
      end_time: formData.end_time,
      weekday: formData.weekday,
      time_zone: formData.time_zone,
    };

    await onSave(basicData);

    if (workRangeId && workRangeId !== "new" && formData.services.length > 0) {
      await addServicesToWorkRange(branchId, workRangeId, formData.services);
    }

    onSuccessfulSave?.();
    onClose();
  }, [
    formData,
    onSave,
    workRangeId,
    branchId,
    addServicesToWorkRange,
    onSuccessfulSave,
    onClose,
  ]);

  const updateField = useCallback(
    (field: keyof WorkRangeEditData, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleServiceToggle = useCallback(
    (serviceId: string, checked: boolean) => {
      setFormData(prev => ({
        ...prev,
        services: checked
          ? [...prev.services, serviceId]
          : prev.services.filter(id => id !== serviceId),
      }));
    },
    []
  );

  const handleSelectAllServices = useCallback(
    (checked: boolean) => {
      const allServiceIds =
        currentBranchData?.services
          ?.filter((s: any) => s && (s.id || s.id === 0) && s.name)
          ?.map((s: any) => s.id.toString()) || [];

      setFormData(prev => ({
        ...prev,
        services: checked ? allServiceIds : [],
      }));
    },
    [currentBranchData]
  );

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
                  {DIAS_SEMANA.find(dia => dia.weekday === formData.weekday)
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
                    {DIAS_SEMANA.map(dia => (
                      <SelectItem
                        key={dia.weekday}
                        value={dia.weekday.toString()}
                      >
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
                  {HORARIOS.map(time => (
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
                  {HORARIOS.map(time => (
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
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
              ) : currentBranchData?.services?.length > 0 ? (
                <ServiceCheckboxList
                  services={currentBranchData.services}
                  selectedServices={formData.services}
                  onToggle={handleServiceToggle}
                  onSelectAll={handleSelectAllServices}
                />
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
