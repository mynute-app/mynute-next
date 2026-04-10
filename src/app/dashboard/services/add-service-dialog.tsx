"use client";

import React, { useEffect, useState } from "react";
import { Briefcase, Clock, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddServiceForm } from "../../../hooks/service/useAddServiceForm";
import type { Service } from "../../../../types/company";
import { ServiceDescriptionEditor } from "@/components/services/service-description-editor";
import { applyCurrencyMask, unmaskCurrency } from "@/utils/format-masks";
import { cn } from "@/lib/utils";

const InputWithIcon = ({
  icon: Icon,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="relative">
    <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      {...props}
      className={cn(
        "h-10 rounded-lg border-border/70 bg-background/70 pl-9 shadow-sm focus-visible:ring-primary/30",
        className,
      )}
    />
  </div>
);

type AddServiceDialogProps = {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreate: (service: Service) => void;
  trigger?: React.ReactNode;
};

export const AddServiceDialog = ({
  isOpen: controlledOpen,
  onOpenChange,
  onCreate,
  trigger,
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

  const [internalOpen, setInternalOpen] = useState(false);
  const [priceDisplay, setPriceDisplay] = useState("");

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const descriptionValue = watch("description") || "";
  const durationValue = watch("duration");

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setPriceDisplay("");
    }
  }, [form, isOpen]);

  const onSubmit = async (data: any) => {
    const createdService = await handleSubmit({
      ...data,
      price: unmaskCurrency(priceDisplay),
    });
    if (createdService) {
      onCreate(createdService);
      setIsOpen(false);
      setPriceDisplay("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && trigger && (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      )}
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="sticky top-0 z-10 border-b border-border bg-background/95 px-6 pb-4 pt-6 backdrop-blur">
          <div className="space-y-1">
            <DialogTitle className="text-xl">Novo Serviço</DialogTitle>
            <DialogDescription className="text-sm">
              Adicione um novo serviço à sua agenda de atendimentos
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={submitHandler(onSubmit)}>
          <div className="px-6">
            <div className="mt-5 space-y-6 pb-5">
              <div className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-foreground">
                    Dados do Serviço
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-service-name">Nome do Serviço *</Label>
                    <InputWithIcon
                      id="add-service-name"
                      placeholder="Ex: Corte de cabelo masculino"
                      icon={Briefcase}
                      {...register("name")}
                      required
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="add-service-desc">Descrição *</Label>
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

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="add-service-duration">
                        Duração (min) *
                      </Label>
                      <InputWithIcon
                        id="add-service-duration"
                        placeholder="Ex: 30"
                        icon={Clock}
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
                          {String(
                            errors.duration.message ||
                              "A duração é obrigatória",
                          )}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="add-service-price">Preço (R$) *</Label>
                      <InputWithIcon
                        id="add-service-price"
                        placeholder="Ex: 50,00"
                        icon={DollarSign}
                        value={priceDisplay}
                        onChange={event => {
                          const masked = applyCurrencyMask(event.target.value);
                          setPriceDisplay(masked);
                        }}
                      />
                      {errors.price && (
                        <p className="text-sm text-red-500">
                          {String(errors.price.message || "")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
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
