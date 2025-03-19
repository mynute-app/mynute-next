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
import { FiMapPin, FiHome, FiHash, FiGlobe, FiFlag } from "react-icons/fi";
import { useAddAddressForm } from "./actions/useAddAddressForm";

export const AddAddressDialog = () => {
  const { form, handleSubmit } = useAddAddressForm();
  const { register, handleSubmit: submitHandler, formState } = form;
  const { errors } = formState;

  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = async (data: any) => {
    await handleSubmit(data);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-0 text-white h-10 w-10 bg-primary rounded-full flex justify-center items-center shadow-md"
          onClick={() => setIsOpen(true)}
        >
          <BsPlus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Endereço</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para cadastrar um novo endereço.
          </DialogDescription>
        </DialogHeader>

        {/* Formulário */}
        <form onSubmit={submitHandler(onSubmit)} className="space-y-4">
          {/* Rua */}
          <div className="flex items-center gap-3">
            <FiHome className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="street">Rua*</Label>
              <Input
                id="street"
                placeholder="Digite o nome da rua"
                {...register("street")}
              />
              {errors.street && (
                <p className="text-sm text-red-500">{errors.street.message}</p>
              )}
            </div>
          </div>

          {/* Número */}
          <div className="flex items-center gap-3">
            <FiHash className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="number">Número*</Label>
              <Input
                id="number"
                placeholder="Digite o número"
                {...register("number")}
              />
              {errors.number && (
                <p className="text-sm text-red-500">{errors.number.message}</p>
              )}
            </div>
          </div>

          {/* Cidade */}
          <div className="flex items-center gap-3">
            <FiMapPin className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="city">Cidade*</Label>
              <Input
                id="city"
                placeholder="Digite a cidade"
                {...register("city")}
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center gap-3">
            <FiFlag className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="state">Estado*</Label>
              <Input
                id="state"
                placeholder="Digite o estado"
                {...register("state")}
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>
          </div>

          {/* País */}
          <div className="flex items-center gap-3">
            <FiGlobe className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="country">País*</Label>
              <Input
                id="country"
                placeholder="Digite o país"
                {...register("country")}
              />
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>
          </div>

          {/* Botões no Rodapé */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="default">
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
