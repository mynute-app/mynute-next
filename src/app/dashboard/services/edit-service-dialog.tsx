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

// Schema Zod
const editServiceSchema = z.object({
  name: z.string().min(1, "O título é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  duration: z.preprocess(val => String(val), z.string().min(1)),
  buffer: z.preprocess(val => (val ? String(val) : ""), z.string().optional()),
  price: z.preprocess(val => String(val), z.string().optional()),
  location: z.string().optional(),
  category: z.string().optional(),
  hidden: z.boolean().optional(),
});

export type EditServiceFormValues = z.infer<typeof editServiceSchema>;

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  service: EditServiceFormValues & { id: string };
  onSave: (updated: EditServiceFormValues & { id: string }) => void;
};

export const EditServiceDialog = ({
  isOpen,
  onOpenChange,
  service,
  onSave,
}: Props) => {
  const form = useForm<EditServiceFormValues>({
    resolver: zodResolver(editServiceSchema),
    defaultValues: service,
  });

  const { register, handleSubmit, formState } = form;

  const onSubmit = (data: EditServiceFormValues) => {
    onSave({ ...data, id: service.id });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-lg">
        <DialogHeader>
          <DialogTitle>Editar Serviço</DialogTitle>
          <DialogDescription>
            Altere os detalhes do serviço abaixo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <FiImage className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1">
              <Label htmlFor="name">Título*</Label>
              <Input
                id="name"
                {...register("name")}
                autoFocus
                placeholder="Nome do serviço"
              />
              {formState.errors.name && (
                <p className="text-red-500 text-sm">
                  {formState.errors.name.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FiClock className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="duration">Duração*</Label>
              <Input id="duration" {...register("duration")} />
              {formState.errors.duration && (
                <p className="text-red-500 text-sm">
                  {formState.errors.duration.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FiClock className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="buffer">Tempo de Espera</Label>
              <Input id="buffer" {...register("buffer")} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FiDollarSign className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="price">Preço</Label>
              <Input id="price" {...register("price")} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FiMapPin className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="location">Localização</Label>
              <Input id="location" {...register("location")} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FiTag className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="category">Categoria</Label>
              <Input id="category" {...register("category")} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiLock className="text-gray-500 w-5 h-5" />
              <Label htmlFor="hidden">Ocultar serviço</Label>
            </div>
            <Switch id="hidden" {...register("hidden")} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
