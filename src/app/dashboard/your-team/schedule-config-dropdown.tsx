"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings2, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateWorkSchedule } from "@/hooks/use-update-work-schedule";
import { useCompany } from "@/hooks/get-company";
import { Checkbox } from "@/components/ui/checkbox";

export type Intervalo = {
  start: string;
  end: string;
  branch_id: number;
  services?: number[];
};

type Props = {
  dia: string;
  intervalos: Intervalo[];
  onChange: (novos: Intervalo[]) => void;
  employeeId: any;
};

const gerarHorarios = () => {
  const times: string[] = [];
  const start = 7 * 60;
  const end = 21 * 60;
  for (let minutes = start; minutes <= end; minutes += 15) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const suffix = h >= 12 ? "PM" : "AM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    const formatted = `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
    times.push(formatted);
  }
  return times;
};

const opcoesHorario = gerarHorarios();

export function ScheduleConfigDropdown({
  dia,
  intervalos,
  onChange,
  employeeId,
}: Props) {
  const [items, setItems] = useState<Intervalo[]>(intervalos);
  const { toast } = useToast();
  const { updateWorkSchedule, loading } = useUpdateWorkSchedule();
  const { company } = useCompany();

  const branches = company?.branches ?? [];
  const services = company?.services ?? [];

  const handleAdd = () => {
    const novos = [
      ...items,
      {
        start: "09:00 AM",
        end: "01:00 PM",
        branch_id: branches[0]?.id || 1,
        services: [],
      },
    ];
    setItems(novos);
    onChange(novos);
  };

  const handleChange = (
    index: number,
    field: keyof Intervalo,
    value: string | number | number[]
  ) => {
    const novos = [...items];
    novos[index] = {
      ...novos[index],
      [field]: value,
    };
    setItems(novos);
    onChange(novos);
  };

  const toggleService = (intervalIndex: number, serviceId: number) => {
    const novos = [...items];
    const current = novos[intervalIndex].services || [];
    if (current.includes(serviceId)) {
      novos[intervalIndex].services = current.filter(id => id !== serviceId);
    } else {
      novos[intervalIndex].services = [...current, serviceId];
    }
    setItems(novos);
    onChange(novos);
  };

  const handleRemove = (index: number) => {
    const novos = [...items];
    novos.splice(index, 1);
    setItems(novos);
    onChange(novos);
  };

  const salvar = async () => {
    try {
      const workSchedule = {
        [dia]: items,
      };
      await updateWorkSchedule({ employeeId, workSchedule });
      toast({
        title: "Horários atualizados",
        description: `Horários de ${dia} salvos com sucesso.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os horários.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar {dia}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {items.map((intervalo, i) => (
            <div key={i} className="flex flex-col gap-2 border-b pb-4">
              <div className="flex gap-2 items-center">
                <Select
                  value={intervalo.start}
                  onValueChange={v => handleChange(i, "start", v)}
                >
                  <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue placeholder="Início" />
                  </SelectTrigger>
                  <SelectContent>
                    {opcoesHorario.map(time => (
                      <SelectItem key={time} value={time} className="text-xs">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-muted-foreground">—</span>

                <Select
                  value={intervalo.end}
                  onValueChange={v => handleChange(i, "end", v)}
                >
                  <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue placeholder="Fim" />
                  </SelectTrigger>
                  <SelectContent>
                    {opcoesHorario.map(time => (
                      <SelectItem key={time} value={time} className="text-xs">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={String(intervalo.branch_id)}
                  onValueChange={v => handleChange(i, "branch_id", Number(v))}
                >
                  <SelectTrigger className="w-24 text-xs h-8">
                    <SelectValue placeholder="Filial" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch: any) => (
                      <SelectItem key={branch.id} value={String(branch.id)}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => handleRemove(i)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 ml-[2px]">
                {services.map((service: any) => (
                  <label
                    key={service.id}
                    className="flex items-center gap-1 text-xs border px-2 py-1 rounded-md cursor-pointer"
                  >
                    <Checkbox
                      checked={intervalo.services?.includes(service.id)}
                      onCheckedChange={() => toggleService(i, service.id)}
                    />
                    {service.name}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <Button
            onClick={handleAdd}
            variant="outline"
            size="sm"
            className="w-full text-xs"
          >
            <Plus className="w-4 h-4 mr-1" /> Adicionar horário
          </Button>

          <Button
            onClick={salvar}
            disabled={loading}
            className="w-full text-sm mt-2"
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
