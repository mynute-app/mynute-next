"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Schema simplificado
const editServiceSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  duration: z.string().min(1, "A duração é obrigatória."),
  price: z.string().optional(),
});

export type EditServiceFormValues = z.infer<typeof editServiceSchema>;

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  service: (EditServiceFormValues & { id: string }) | null;
  onSave: (updated: EditServiceFormValues & { id: string }) => void;
};

export const EditServiceDialog = ({
  isOpen,
  onOpenChange,
  service,
  onSave,
}: Props) => {
  const { register, handleSubmit, formState, reset } =
    useForm<EditServiceFormValues>({
      resolver: zodResolver(editServiceSchema),
    });

  // Reset form quando o serviço muda
  useEffect(() => {
    if (service) {
      reset({
        name: service.name || "",
        description: service.description || "",
        duration: String(service.duration || ""),
        price: String(service.price || ""),
      });
    }
  }, [service, reset]);

  const onSubmit = (data: EditServiceFormValues) => {
    if (service) {
      onSave({ ...data, id: service.id });
    }
  };

  if (!service) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar Serviço</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome*</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nome do serviço"
            />
            {formState.errors.name && (
              <p className="text-red-500 text-sm">
                {formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição*</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Descrição do serviço"
            />
            {formState.errors.description && (
              <p className="text-red-500 text-sm">
                {formState.errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="duration">Duração (minutos)*</Label>
            <Input id="duration" {...register("duration")} />
            {formState.errors.duration && (
              <p className="text-red-500 text-sm">
                {formState.errors.duration.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="price">Preço</Label>
            <Input id="price" {...register("price")} />
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
