"use client";

import React, { useEffect, useRef, useState } from "react";
import { Plus, Star, Upload } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddServiceForm } from "../../../hooks/service/useAddServiceForm";
import type { Service } from "../../../../types/company";

type AddServiceDialogProps = {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreate: (service: Service) => void;
  trigger?: React.ReactNode;
  categories?: string[];
};

type ExtraFields = {
  priceFrom: boolean;
  bufferTime: number;
  category: string;
  active: boolean;
  featured: boolean;
};

const defaultExtraFields: ExtraFields = {
  priceFrom: false,
  bufferTime: 15,
  category: "",
  active: true,
  featured: false,
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

  const [internalOpen, setInternalOpen] = useState(false);
  const [extraFields, setExtraFields] = useState(defaultExtraFields);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isBufferLocked = true;

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const durationValue = watch("duration");
  const priceValue = watch("price");

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setExtraFields(defaultExtraFields);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [form, imagePreview, isOpen]);

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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      )}
      <DialogContent className="services-dialog max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Serviço</DialogTitle>
          <DialogDescription>Preencha os dados do serviço e salve para disponibilizá-lo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submitHandler(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Imagem do Serviço</Label>
            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={handleImageClick}
              role="button"
              tabIndex={0}
              onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                  handleImageClick();
                }
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mx-auto h-24 w-24 rounded-lg object-cover"
                />
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Clique para fazer upload ou arraste uma imagem
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG até 5MB
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

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
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o serviço..."
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={extraFields.category}
                onValueChange={value =>
                  setExtraFields(prev => ({ ...prev, category: value }))
                }
                disabled={categories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      categories.length > 0 ? "Selecione..." : "Sem categorias"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
              <div className="flex items-center gap-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <div className="flex items-center gap-2 ml-auto">
                  <Switch
                    id="priceFrom"
                    checked={extraFields.priceFrom}
                    onCheckedChange={checked =>
                      setExtraFields(prev => ({ ...prev, priceFrom: checked }))
                    }
                  />
                  <Label
                    htmlFor="priceFrom"
                    className="text-sm font-normal text-muted-foreground"
                  >
                    A partir de
                  </Label>
                </div>
              </div>
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

            <div className="space-y-2">
              <Label htmlFor="bufferTime">Intervalo após (min)</Label>
              <Select
                value={isBufferLocked ? "" : String(extraFields.bufferTime)}
                onValueChange={value =>
                  setExtraFields(prev => ({
                    ...prev,
                    bufferTime: Number.parseInt(value, 10),
                  }))
                }
                disabled={isBufferLocked}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Em breve" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sem intervalo</SelectItem>
                  <SelectItem value="5">5 minutos</SelectItem>
                  <SelectItem value="10">10 minutos</SelectItem>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Serviço Ativo</Label>
                <p className="text-sm text-muted-foreground">
                  Serviços inativos não aparecem na página pública
                </p>
              </div>
              <Switch
                checked={extraFields.active}
                onCheckedChange={checked =>
                  setExtraFields(prev => ({ ...prev, active: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent" />
                  Destaque
                </Label>
                <p className="text-sm text-muted-foreground">
                  Serviços em destaque aparecem primeiro
                </p>
              </div>
              <Switch
                checked={extraFields.featured}
                onCheckedChange={checked =>
                  setExtraFields(prev => ({ ...prev, featured: checked }))
                }
              />
            </div>
          </div>

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




