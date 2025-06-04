"use client";

import React, { useState, useEffect } from "react";
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
import { BsFillBuildingFill, BsPlus } from "react-icons/bs";
import {
  FiMapPin,
  FiHome,
  FiHash,
  FiGlobe,
  FiFlag,
  FiMail,
} from "react-icons/fi";
import { useAddAddressForm } from "../../your-brand/_components/actions/useAddAddressForm";
import { Branch } from "../../../../../types/company";
import { PlusIcon } from "lucide-react";

type AddBranchDialogProps = {
  onCreate: (branch: Branch) => void;
};

export const AddAddressDialog = ({ onCreate }: AddBranchDialogProps) => {
  const { form, handleSubmit } = useAddAddressForm();
  const { register, handleSubmit: submitHandler, setValue, formState } = form;
  const { errors } = formState;

  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = async (data: any) => {
    const createdBranch = await handleSubmit(data);
    if (createdBranch) {
      onCreate(createdBranch);
      setIsOpen(false);
    }
  };

  const fetchAddressByCEP = async (cep: any) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setValue("street", data.logradouro);
          setValue("city", data.localidade);
          setValue("neighborhood", data.bairro);
          setValue("state", data.uf);
          setValue("country", "Brasil");
        }
      } catch (error) {
        console.error("Erro ao buscar endereço pelo CEP:", error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="" onClick={() => setIsOpen(true)}>
          <PlusIcon />
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
          {/* Nome da Filial */}
          <div className="flex items-center gap-3">
            <BsFillBuildingFill className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="name">Nome*</Label>
              <Input
                id="name"
                placeholder="Nome da filial"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>
          {/* CEP */}
          <div className="flex items-center gap-3">
            <FiMail className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="zip_code">CEP*</Label>
              <Input
                id="zip_code"
                placeholder="Digite o CEP"
                {...register("zip_code")}
                maxLength={8}
                onBlur={e => fetchAddressByCEP(e.target.value)}
              />
              {errors.zip_code && (
                <p className="text-sm text-red-500">
                  {errors.zip_code.message}
                </p>
              )}
            </div>
          </div>

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

          {/* Bairro */}
          <div className="flex items-center gap-3">
            <FiHome className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                placeholder="Digite o bairro"
                {...register("neighborhood")}
              />
            </div>
          </div>
          {/* Número e Complemento */}
          <div className="flex gap-3">
            <div className="flex items-center gap-3 flex-1">
              <FiHash className="text-gray-500 w-5 h-5 mt-7" />
              <div className="flex-1">
                <Label htmlFor="number">Número*</Label>
                <Input
                  id="number"
                  placeholder="Número"
                  {...register("number")}
                />
                {errors.number && (
                  <p className="text-sm text-red-500">
                    {errors.number.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-1">
              <BsFillBuildingFill className="text-gray-500 w-5 h-5 mt-7" />
              <div className="flex-1">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  placeholder="Apartamento, bloco, etc."
                  {...register("complement")}
                />
              </div>
            </div>
          </div>

          {/* Cidade, Estado e País */}
          <div className="flex gap-3">
            <div className="flex items-center gap-3 flex-1">
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
            <div className="flex items-center gap-3 flex-1">
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
            <div className="flex items-center gap-3 flex-1">
              <FiGlobe className="text-gray-500 w-5 h-5 mt-7" />
              <div className="flex-1">
                <Label htmlFor="country">País*</Label>
                <Input
                  id="country"
                  placeholder="Digite o país"
                  {...register("country")}
                />
                {errors.country && (
                  <p className="text-sm text-red-500">
                    {errors.country.message}
                  </p>
                )}
              </div>
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
