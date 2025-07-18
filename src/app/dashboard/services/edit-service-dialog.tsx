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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageField } from "@/components/custom/image-field";
import {
  FiClock,
  FiDollarSign,
  FiAlignLeft,
  FiImage,
  FiCamera,
  FiX,
} from "react-icons/fi";
import { useEditService } from "@/hooks/services/use-edit-service";
import { useServiceImage } from "@/hooks/services/use-service-image";

const editServiceSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  duration: z.string().min(1, "A duração é obrigatória."),
  price: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type EditServiceFormValues = z.infer<typeof editServiceSchema>;

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  service: (EditServiceFormValues & { id: string; imageUrl?: string }) | null;
  onSave: (updatedService: any) => void;
};

export const EditServiceDialog = ({
  isOpen,
  onOpenChange,
  service,
  onSave,
}: Props) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Hook para atualizar serviço
  const { isUpdating, updateService } = useEditService();

  // Hook para gerenciar imagens
  const {
    imagePreview,
    isUploading,
    isRemoving,
    handleImageChange,
    handleRemoveImage,
  } = useServiceImage({
    serviceId: service?.id || "",
    currentImage: service?.imageUrl,
    imageType: "profile", // Usar "profile" conforme a estrutura da API
  });

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
        imageUrl: service.imageUrl || "",
      });
    }
  }, [service, reset]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: EditServiceFormValues) => {
    if (!service) return;

    try {
      // Atualizar os dados básicos do serviço
      const updatedService = await updateService({
        id: service.id,
        name: data.name,
        description: data.description,
        price: data.price || "0",
        duration: data.duration,
      });

      if (updatedService) {
        // Adicionar a URL da imagem atual (o hook já gerencia upload/remoção)
        updatedService.imageUrl = imagePreview || undefined;

        // Enviar o serviço atualizado para o componente pai
        onSave(updatedService);
      }
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
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
      <DialogContent className="max-w-xl rounded-lg">
        <DialogHeader>
          <DialogTitle>Editar Serviço</DialogTitle>
          <DialogDescription>
            Atualize os detalhes do serviço abaixo.
          </DialogDescription>
        </DialogHeader>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Título do Serviço com Imagem */}
          <div className="flex items-start gap-4">
            <div className="relative group">
              <div
                className="relative w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={handleImageClick}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <FiCamera className="w-5 h-5 text-gray-500" />
                    <span className="text-xs text-gray-500 mt-1">Foto</span>
                  </div>
                )}

                {/* Overlay para hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  <FiCamera className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Botão de remover imagem */}
              {imagePreview && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  disabled={isRemoving}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                >
                  {isRemoving ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiX className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>

            <div className="flex-1">
              <Label htmlFor="name">Digite o título do serviço*</Label>
              <Input
                id="name"
                placeholder="Digite o título do serviço"
                {...register("name")}
              />
              {formState.errors.name && (
                <p className="text-sm text-red-500">
                  {formState.errors.name.message}
                </p>
              )}
            </div>
          </div>

          {/* Input file escondido */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

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
              {formState.errors.duration && (
                <p className="text-sm text-red-500">
                  {formState.errors.duration.message}
                </p>
              )}
            </div>
          </div>

          {/* Custo */}
          <div className="flex items-center gap-3">
            <FiDollarSign className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="price">Custo</Label>
              <Input
                id="price"
                placeholder="Ex.: R$50"
                {...register("price")}
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="flex items-start gap-3">
            <FiAlignLeft className="text-gray-500 w-5 h-5 mt-3" />
            <div className="flex-1">
              <Label htmlFor="description">Descrição*</Label>
              <Textarea
                id="description"
                placeholder="Digite uma breve descrição do serviço"
                {...register("description")}
              />
              {formState.errors.description && (
                <p className="text-sm text-red-500">
                  {formState.errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Botões no Rodapé */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating || isUploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isUpdating || isUploading}
            >
              {isUpdating
                ? "Salvando dados..."
                : isUploading
                ? "Enviando imagem..."
                : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
