"use client";

import { useState } from "react";
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
import { Clock, Save, X } from "lucide-react";

interface WorkRangeEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WorkRangeEditData) => Promise<void>;
  initialData?: WorkRangeEditData;
  loading?: boolean;
}

interface WorkRangeEditData {
  start_time: string;
  end_time: string;
  weekday: number;
  time_zone: string;
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
}: WorkRangeEditDialogProps) {
  const [formData, setFormData] = useState<WorkRangeEditData>(
    initialData || {
      start_time: "09:00",
      end_time: "17:00",
      weekday: 1,
      time_zone: "America/Sao_Paulo",
    }
  );

  const handleSave = async () => {
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const updateField = (field: keyof WorkRangeEditData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Editar Horário
          </DialogTitle>
          <DialogDescription>
            Modifique os detalhes do horário de funcionamento.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weekday" className="text-right">
              Dia da Semana
            </Label>
            <div className="col-span-3">
              <Select
                value={formData.weekday.toString()}
                onValueChange={value => updateField("weekday", parseInt(value))}
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
