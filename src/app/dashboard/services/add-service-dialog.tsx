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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BsPlus } from "react-icons/bs";
import {
  FiClock,
  FiMapPin,
  FiDollarSign,
  FiTag,
  FiLock,
  FiImage,
  FiAlignLeft,
} from "react-icons/fi";
import { useAddServiceForm } from "../../../hooks/service/useAddServiceForm";
import { Textarea } from "@/components/ui/textarea";
import { Service } from "../../../../types/company";

type AddServiceDialogProps = {
  onCreate: (service: Service) => void;
};

export const AddServiceDialog = ({ onCreate }: AddServiceDialogProps) => {
  const { form, handleSubmit } = useAddServiceForm();
  const { register, handleSubmit: submitHandler, formState } = form;
  const { errors } = formState;

  const [isOpen, setIsOpen] = useState(false);

  const onSubmit = async (data: any) => {
    const createdService = await handleSubmit(data);
    if (createdService) {
      onCreate(createdService); // 👈 ATUALIZA A LISTA NO COMPONENTE PAI
      setIsOpen(false);
    }
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
          <DialogTitle>Criar novo serviço</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para criar um novo serviço.
          </DialogDescription>
        </DialogHeader>

        {/* Formulário */}
        <form onSubmit={submitHandler(onSubmit)} className="space-y-4">
          {/* Título do Serviço */}
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <FiImage className="w-6 h-6 text-gray-400" />
            </div>
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
                placeholder="Ex.: 30 minutos"
                {...register("duration")}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">
                  {errors.duration.message}
                </p>
              )}
            </div>
          </div>

          {/* Tempo de Espera */}
          {/* <div className="flex items-center gap-3">
            <FiClock className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="buffer">Tempo de espera</Label>
              <Input
                id="buffer"
                placeholder="Ex.: 10 minutos"
                {...register("buffer")}
              />
              {errors.buffer && (
                <p className="text-sm text-red-500">{errors.buffer.message}</p>
              )}
            </div>
          </div> */}

          {/* Custo */}
          <div className="flex items-center gap-3">
            <FiDollarSign className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="cost">Custo</Label>
              <Input id="cost" placeholder="Ex.: R$50" {...register("price")} />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
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
          {/* Localização */}
          {/* <div className="flex items-center gap-3">
            <FiMapPin className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                placeholder="Ex.: Online"
                {...register("location")}
              />
              {errors.location && (
                <p className="text-sm text-red-500">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div> */}

          {/* Categoria */}
          {/* <div className="flex items-center justify-center gap-3">
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
          </div> */}

          {/* Ocultar */}
          {/* <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiLock className="text-gray-500 w-5 h-5" />
              <Label htmlFor="hidden">Definir como oculto</Label>
            </div>
            <Switch id="hidden" {...register("hidden")} />
          </div> */}

          {/* Botões no Rodapé */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)} // Fecha o modal ao cancelar
            >
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
