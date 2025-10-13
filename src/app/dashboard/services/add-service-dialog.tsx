"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { BsPlus } from "react-icons/bs";
import { FiClock, FiDollarSign, FiAlignLeft, FiSettings } from "react-icons/fi";
import { useAddServiceForm } from "../../../hooks/service/useAddServiceForm";
import { Textarea } from "@/components/ui/textarea";
import { Service } from "../../../../types/company";
import {
  applyCurrencyMask,
  applyTimeMask,
  unmaskCurrency,
  unmaskTime,
} from "@/utils/format-masks";

type AddServiceDialogProps = {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreate: (service: Service) => void;
};

export const AddServiceDialog = ({
  isOpen: controlledOpen,
  onOpenChange,
  onCreate,
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

  // Se controlado externamente, usar isOpen; senão usar estado interno
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Watch dos valores para aplicar máscaras
  const durationValue = watch("duration");
  const priceValue = watch("price");

  const onSubmit = async (data: any) => {
    const createdService = await handleSubmit(data);
    if (createdService) {
      onCreate(createdService);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!controlledOpen && (
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => setIsOpen(true)}>
            <BsPlus className="w-6 h-6" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-xl rounded-lg">
        <DialogHeader>
          <DialogTitle>Criar novo serviço</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para criar um novo serviço.
          </DialogDescription>
        </DialogHeader>

        {/* Formulário */}
        <form onSubmit={submitHandler(onSubmit)} className="space-y-4">
          {/* Título do Serviço */}
          <div className="flex items-center gap-3">
            <FiSettings className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="title">Digite o título do serviço*</Label>
              <Input
                id="title"
                placeholder="Digite o título do serviço"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Duração */}
          <div className="flex items-center gap-3">
            <FiClock className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="duration">Duração*</Label>
              <Input
                id="duration"
                placeholder="Ex.: 30"
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, ""); // só números
                  setValue("duration", Number(value) || 0);
                }}
                value={durationValue ? `${durationValue} min` : ""}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">
                  {String(errors.duration.message || "A duração é obrigatória")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FiDollarSign className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="cost">Custo</Label>
              <Input
                id="cost"
                placeholder="Ex.: 50"
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, ""); // só números
                  const numValue = Number(value) / 100; // divide por 100 para centavos
                  setValue("price", numValue || 0);
                }}
                value={
                  priceValue && priceValue > 0
                    ? `R$ ${Number(priceValue).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : ""
                }
              />
              {errors.price && (
                <p className="text-sm text-red-500">
                  {String(errors.price.message || "")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiAlignLeft className="text-gray-500 w-5 h-5 mt-3" />
            <div className="flex-1">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Digite uma breve descrição do serviço"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="default">
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
