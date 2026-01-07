"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Save, X, Users, ChevronUp, ChevronDown } from "lucide-react";
import { DismissableLayerBranch } from "@radix-ui/react-dismissable-layer";
import { useGetBranch } from "@/hooks/branch/use-get-branch";
import { useWorkRangeServices } from "@/hooks/workSchedule/use-work-range-services";
import { useToast } from "@/hooks/use-toast";
import { DIAS_SEMANA, TIMEZONES } from "./constants";

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

const TimePicker = memo(
  ({
    value,
    onChange,
    label,
    onOpenChange,
  }: {
    value: string;
    onChange: (value: string) => void;
    label: string;
    onOpenChange?: (open: boolean) => void;
  }) => {
    const [hour, minute] = value.split(":").map(Number);
    const [isOpen, setIsOpen] = useState(false);

    const adjustTime = (type: "hour" | "minute", delta: number) => {
      let newHour = hour;
      let newMinute = minute;

      if (type === "hour") {
        newHour = (hour + delta + 24) % 24;
      } else {
        newMinute = minute + delta;
        if (newMinute >= 60) {
          newMinute = 0;
          newHour = (hour + 1) % 24;
        } else if (newMinute < 0) {
          newMinute = 45;
          newHour = (hour - 1 + 24) % 24;
        }
      }

      const formatted = `${String(newHour).padStart(2, "0")}:${String(
        newMinute
      ).padStart(2, "0")}`;
      onChange(formatted);
    };

    const quickTimes = [
      "06:00",
      "07:00",
      "08:00",
      "09:00",
      "12:00",
      "13:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "22:00",
    ];

    const handlePopoverOpenChange = useCallback(
      (open: boolean) => {
        setIsOpen(open);
        onOpenChange?.(open);
      },
      [onOpenChange]
    );

    return (
      <Popover
        open={isOpen}
        onOpenChange={handlePopoverOpenChange}
        modal={true}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            type="button"
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <Clock className="mr-2 h-4 w-4" />
            {value}
          </Button>
        </PopoverTrigger>
        <DismissableLayerBranch asChild>
          <PopoverContent
            className="w-80 p-4 z-[10000]"
            align="start"
            onInteractOutside={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onEscapeKeyDown={e => {
              e.preventDefault();
              handlePopoverOpenChange(false);
            }}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex flex-col items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        adjustTime("hour", 1);
                      }}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-primary bg-primary/5 text-2xl font-bold">
                      {String(hour).padStart(2, "0")}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        adjustTime("hour", -1);
                      }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <span className="text-2xl font-bold">:</span>

                  <div className="flex flex-col items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        adjustTime("minute", 15);
                      }}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-primary bg-primary/5 text-2xl font-bold">
                      {String(minute).padStart(2, "0")}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        adjustTime("minute", -15);
                      }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Horas: ±1h | Minutos: ±15min
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Horários Rápidos
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {quickTimes.map(time => (
                    <Button
                      key={time}
                      variant={value === time ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onChange(time);
                      }}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </DismissableLayerBranch>
      </Popover>
    );
  }
);

TimePicker.displayName = "TimePicker";

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
  const { toast } = useToast();
  const overlayOpenCountRef = useRef(0);
  const [hasOpenPopovers, setHasOpenPopovers] = useState(false);

  const handleOverlayOpenChange = useCallback((open: boolean) => {
    if (open) {
      overlayOpenCountRef.current += 1;
      setHasOpenPopovers(true);
    } else {
      overlayOpenCountRef.current = Math.max(
        0,
        overlayOpenCountRef.current - 1
      );
      if (overlayOpenCountRef.current === 0) {
        setHasOpenPopovers(false);
      }
    }
  }, []);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      // Só permite fechar o Dialog se:
      // 1. O usuário está tentando fechar (open === false)
      // 2. Não há popovers abertos
      // 3. O counter de overlays está em 0
      if (!open && !hasOpenPopovers && overlayOpenCountRef.current === 0) {
        onClose();
      }
    },
    [onClose, hasOpenPopovers]
  );

  // Hook de serviços SEM onSuccess para evitar múltiplas revalidações
  // A revalidação será feita UMA VEZ ao final do handleSave
  const {
    addServicesToWorkRange,
    removeServiceFromWorkRange,
    loading: servicesLoading,
  } = useWorkRangeServices();

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

  // Guardar os serviços iniciais para detectar remoções
  const [initialServices, setInitialServices] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setInitialServices(initialData.services || []);
    }
  }, [initialData]);

  const handleSave = useCallback(async () => {
    try {
      const basicData = {
        start_time: formData.start_time,
        end_time: formData.end_time,
        weekday: formData.weekday,
        time_zone: formData.time_zone,
      };

      // 1. Salvar dados básicos do work_range
      await onSave(basicData);

      // 2. Se for edição (não é "new"), processar mudanças nos serviços
      if (workRangeId && workRangeId !== "new") {
        // Detectar serviços removidos
        const removedServices = initialServices.filter(
          serviceId => !formData.services.includes(serviceId)
        );

        // Detectar serviços adicionados
        const addedServices = formData.services.filter(
          serviceId => !initialServices.includes(serviceId)
        );

        console.log("🔍 Serviços removidos:", removedServices);
        console.log("🔍 Serviços adicionados:", addedServices);

        // 3. Remover serviços desvinculados (em paralelo, sem toast individual)
        if (removedServices.length > 0) {
          await Promise.all(
            removedServices.map(serviceId =>
              removeServiceFromWorkRange(branchId, workRangeId, serviceId, {
                showToast: false,
              })
            )
          );
        }

        // 4. Adicionar novos serviços vinculados (sem toast individual)
        if (addedServices.length > 0) {
          await addServicesToWorkRange(branchId, workRangeId, addedServices, {
            showToast: false,
          });
        }

        // 5. Toast consolidado informando todas as mudanças
        const changes: string[] = [];
        if (removedServices.length > 0) {
          changes.push(`${removedServices.length} serviço(s) removido(s)`);
        }
        if (addedServices.length > 0) {
          changes.push(`${addedServices.length} serviço(s) adicionado(s)`);
        }

        if (changes.length > 0) {
          toast({
            title: "Horário atualizado com sucesso",
            description: changes.join(" • "),
          });
        } else {
          toast({
            title: "Horário atualizado",
            description: "Alterações salvas com sucesso.",
          });
        }
      } else {
        // Para novos work_ranges, apenas confirmação simples
        toast({
          title: "Horário criado",
          description: "Horário de funcionamento configurado com sucesso.",
        });
      }

      onSuccessfulSave?.();
      onClose();
    } catch (error) {
      console.error("❌ Erro ao salvar work_range:", error);
      // O erro já é tratado pelos hooks individuais com toast
    }
  }, [
    formData,
    onSave,
    workRangeId,
    branchId,
    initialServices,
    addServicesToWorkRange,
    removeServiceFromWorkRange,
    toast,
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
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange} modal={true}>
      <DialogContent
        className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={e => {
          // Só previne se não houver popovers abertos ou se o clique for dentro de um popover
          if (hasOpenPopovers || overlayOpenCountRef.current > 0) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onPointerDownOutside={e => {
          if (hasOpenPopovers || overlayOpenCountRef.current > 0) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onFocusOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => {
          if (hasOpenPopovers || overlayOpenCountRef.current > 0) {
            e.preventDefault();
          } else {
            onClose();
          }
        }}
      >
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
                  onOpenChange={handleOverlayOpenChange}
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
              <TimePicker
                value={formData.start_time}
                onChange={value => updateField("start_time", value)}
                label="Horário de Início"
                onOpenChange={handleOverlayOpenChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end_time" className="text-right">
              Fim
            </Label>
            <div className="col-span-3">
              <TimePicker
                value={formData.end_time}
                onChange={value => updateField("end_time", value)}
                label="Horário de Término"
                onOpenChange={handleOverlayOpenChange}
              />
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
                onOpenChange={handleOverlayOpenChange}
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
