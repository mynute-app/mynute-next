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
import { Clock, Save, X, Users, MapPin } from "lucide-react";
import { useGetCompany } from "@/hooks/get-company";

interface WorkRangeEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: WorkRangeEditData;
  loading?: boolean;
  disableWeekdayEdit?: boolean;
  employeeId: string;
  workRangeId: string;
  branches?: Array<{ id: string; name: string }>;
  services?: Array<{ id: string; name: string }>;
}

interface WorkRangeEditData {
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
  loading = false,
  disableWeekdayEdit = true,
  employeeId,
  workRangeId,
  branches = [],
  services = [],
}: WorkRangeEditDialogProps) {
  const { company, loading: loadingCompany } = useGetCompany();

  const [formData, setFormData] = useState<WorkRangeEditData>({
    start_time: "09:00",
    end_time: "17:00",
    weekday: 1,
    time_zone: "America/Sao_Paulo",
    branch_id: "",
    services: [],
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Resetar form quando o dialog abrir/fechar
  useEffect(() => {
    if (isOpen && initialData) {
      console.log("🔄 Dialog - Carregando dados iniciais:", initialData);
      setFormData({
        start_time: initialData.start_time || "09:00",
        end_time: initialData.end_time || "17:00",
        weekday: initialData.weekday ?? 1,
        time_zone: initialData.time_zone || "America/Sao_Paulo",
        branch_id:
          initialData.branch_id || (branches.length > 0 ? branches[0].id : ""),
        services: initialData.services || [],
      });
      setSelectedServices(initialData.services || []);
    } else if (isOpen && !initialData) {
      // Reset para novos
      setFormData({
        start_time: "09:00",
        end_time: "17:00",
        weekday: 1,
        time_zone: "America/Sao_Paulo",
        branch_id: branches.length > 0 ? branches[0].id : "",
        services: [],
      });
      setSelectedServices([]);
    }
  }, [isOpen, initialData, branches]);

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        employee_id: employeeId,
        services: selectedServices.map(serviceId => ({ id: serviceId })),
      };

      console.log("💾 Dialog - Salvando dados:", dataToSave);
      await onSave(dataToSave);
    } catch (error) {
      console.error("❌ Dialog - Erro ao salvar:", error);
    }
  };

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setSelectedServices(prev => {
      if (checked) {
        return [...prev, serviceId];
      } else {
        return prev.filter(id => id !== serviceId);
      }
    });
  };

  const isEditing = workRangeId !== "new";
  const title = isEditing ? "Editar Horário" : "Novo Horário";
  const description = isEditing
    ? "Atualize as informações do horário de trabalho"
    : "Configure um novo horário de trabalho";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dia da Semana */}
          <div className="space-y-2">
            <Label>Dia da Semana</Label>
            <Select
              value={formData.weekday.toString()}
              onValueChange={value =>
                setFormData(prev => ({ ...prev, weekday: parseInt(value) }))
              }
              disabled={disableWeekdayEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dia" />
              </SelectTrigger>
              <SelectContent>
                {diasSemana.map(dia => (
                  <SelectItem key={dia.value} value={dia.value.toString()}>
                    {dia.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hora de Início</Label>
              <Select
                value={formData.start_time}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, start_time: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {opcoesHorario.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hora de Fim</Label>
              <Select
                value={formData.end_time}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, end_time: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {opcoesHorario.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filial */}
          {branches.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Filial
              </Label>
              <Select
                value={formData.branch_id}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, branch_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma filial" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Fuso Horário */}
          <div className="space-y-2">
            <Label>Fuso Horário</Label>
            <Select
              value={formData.time_zone}
              onValueChange={value =>
                setFormData(prev => ({ ...prev, time_zone: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Sao_Paulo">
                  São Paulo (GMT-3)
                </SelectItem>
                <SelectItem value="America/New_York">
                  Nova York (GMT-5)
                </SelectItem>
                <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Serviços */}
          {services.length > 0 && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Serviços Disponíveis
              </Label>
              <div className="grid grid-cols-1 gap-3 max-h-32 overflow-y-auto border rounded-md p-3">
                {services.map(service => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={checked =>
                        handleServiceToggle(service.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`service-${service.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {service.name}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selecione os serviços que estarão disponíveis neste horário
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
