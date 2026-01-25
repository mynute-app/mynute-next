"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddServiceForm } from "../../../hooks/service/useAddServiceForm";
import type { Service } from "../../../../types/company";
import { ServiceDescriptionEditor } from "@/components/services/service-description-editor";

type AddServiceDialogProps = {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreate: (service: Service) => void;
  trigger?: React.ReactNode;
  categories?: string[];
};

export const AddServiceDialog = ({
  isOpen: controlledOpen,
  onOpenChange,
  onCreate,
  trigger,
  categories = [],
}: AddServiceDialogProps) => {
  const { form, handleSubmit } = useAddServiceForm();
  const {
    register,
    handleSubmit: submitHandler,
    formState,
    setValue,
    watch,
  } = form;
  const { errors } = formState;

  void categories;

  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const descriptionValue = watch("description") || "";
  const durationValue = watch("duration");
  const priceValue = watch("price");

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [form, isOpen]);

  const onSubmit = async (data: any) => {
    const createdService = await handleSubmit(data);
    if (createdService) {
      onCreate(createdService);
      setIsOpen(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline">
      <Plus className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      )}
      <DialogContent className="services-dialog max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Serviço</DialogTitle>
          <DialogDescription>
            Preencha os dados do serviço e salve para disponibilizá-lo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitHandler(onSubmit)} className="space-y-6">
          {/* TODO: Imagem do servi�o (requer serviceId para upload). */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome do Serviço *</Label>
              <Input
                id="name"
                placeholder="Ex: Corte de cabelo masculino"
                {...register("name")}
                required
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <ServiceDescriptionEditor
                value={descriptionValue}
                onChange={value =>
                  setValue("description", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                error={errors.description?.message}
              />
              <input type="hidden" {...register("description")} />
            </div>

            {/* TODO: Categoria (quando tiver suporte no backend). */}

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos) *</Label>
              <Input
                id="duration"
                type="number"
                value={durationValue ? Number(durationValue) : ""}
                onChange={event =>
                  setValue("duration", Number(event.target.value) || 0)
                }
                min={5}
                step={5}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">
                  {String(errors.duration.message || "A duração é obrigatória")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                value={priceValue ? Number(priceValue) : ""}
                onChange={event =>
                  setValue("price", Number(event.target.value) || 0)
                }
                min={0}
                step={0.01}
              />
              {errors.price && (
                <p className="text-sm text-red-500">
                  {String(errors.price.message || "")}
                </p>
              )}
            </div>

            {/* TODO: Intervalo ap�s (quando tiver suporte no backend). */}
          </div>

          {/* TODO: Status e destaque (quando tiver suporte no backend). */}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="btn-gradient">
              Criar Serviço
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
