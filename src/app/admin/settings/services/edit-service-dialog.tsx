"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  FiClock,
  FiDollarSign,
  FiImage,
  FiLock,
  FiMapPin,
  FiTag,
} from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Esquema de validação Zod
const addServiceSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  duration: z.string().min(1, "A duração é obrigatória."),
  buffer: z.string().optional(),
  cost: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  hidden: z.boolean().optional(),
});

type EditServiceFormValues = z.infer<typeof addServiceSchema>;

type EditServiceDialogProps = {
  service: EditServiceFormValues & { id: string }; // Inclui o ID
  onSave: (updatedService: EditServiceFormValues & { id: string }) => void; // Atualiza o serviço
  onCancel: () => void;
};

export const EditServiceDialog = ({
  service,
  onSave,
  onCancel,
}: EditServiceDialogProps) => {
  const { register, handleSubmit, formState } = useForm<EditServiceFormValues>({
    resolver: zodResolver(addServiceSchema),
    defaultValues: {
      title: service.title,
      duration: service.duration,
      buffer: service.buffer,
      cost: service.cost,
      location: service.location,
      category: service.category,
      hidden: service.hidden,
    },
  });

  const onSubmit = (data: EditServiceFormValues) => {
    onSave({
      ...data,
      id: service.id,
      buffer: data.buffer ?? "", // Garante que seja uma string
      cost: data.cost ?? "",
      location: data.location ?? "",
      category: data.category ?? "",
      hidden: data.hidden ?? false,
    });
  };


  

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-xl rounded-lg">
        <DialogHeader>
          <DialogTitle>Editar Serviço</DialogTitle>
          <DialogDescription>
            Altere os detalhes do serviço abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Título */}
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <FiImage className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <Label htmlFor="title">Título do Serviço*</Label>
              <Input
                id="title"
                placeholder="Digite o título do serviço"
                {...register("title")}
              />
              {formState.errors.title && (
                <p className="text-sm text-red-500">
                  {formState.errors.title.message}
                </p>
              )}
            </div>
          </div>

          {/* Duração */}
          <div className="flex items-center gap-3">
            <FiClock className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="duration">Duração (minutos)*</Label>
              <Input
                id="duration"
                placeholder="Digite a duração"
                {...register("duration")}
              />
              {formState.errors.duration && (
                <p className="text-sm text-red-500">
                  {formState.errors.duration.message}
                </p>
              )}
            </div>
          </div>

          {/* Tempo de Espera */}
          <div className="flex items-center gap-3">
            <FiClock className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="buffer">Tempo de Espera</Label>
              <Input
                id="buffer"
                placeholder="Digite o tempo de espera (opcional)"
                {...register("buffer")}
              />
              {formState.errors.buffer && (
                <p className="text-sm text-red-500">
                  {formState.errors.buffer.message}
                </p>
              )}
            </div>
          </div>

          {/* Custo */}
          <div className="flex items-center gap-3">
            <FiDollarSign className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="cost">Custo (R$)</Label>
              <Input
                id="cost"
                placeholder="Digite o custo (opcional)"
                {...register("cost")}
              />
              {formState.errors.cost && (
                <p className="text-sm text-red-500">
                  {formState.errors.cost.message}
                </p>
              )}
            </div>
          </div>
          {/* Localização */}
          <div className="flex items-center gap-3">
            <FiMapPin className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                placeholder="Ex.: Online"
                {...register("location")}
              />
              {formState.errors.location && (
                <p className="text-sm text-red-500">
                  {formState.errors.location.message}
                </p>
              )}
            </div>
          </div>

          {/* Categoria */}
          <div className="flex items-center justify-center gap-3">
            <FiTag className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="category">Categoria</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="categoria1">Categoria 1</SelectItem>
                  <SelectItem value="categoria2">Categoria 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ocultar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiLock className="text-gray-500 w-5 h-5" />
              <Label htmlFor="hidden">Definir como oculto</Label>
            </div>
            <Switch id="hidden" {...register("hidden")} />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" variant="default">
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
