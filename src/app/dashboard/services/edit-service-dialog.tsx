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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FiClock,
  FiDollarSign,
  FiAlignLeft,
  FiCamera,
  FiX,
  FiUsers,
  FiScissors,
} from "react-icons/fi";
import { Star } from "lucide-react";
import { useEditService } from "@/hooks/services/use-edit-service";
import { useServiceImage } from "@/hooks/services/use-service-image";
import { useGetService } from "@/hooks/services/use-get-service";
import {
  applyCurrencyMask,
  applyTimeMask,
  unmaskCurrency,
  unmaskTime,
  formatTimeMask,
  formatCurrencyMask,
} from "@/utils/format-masks";

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
  service:
    | (EditServiceFormValues & {
        id: string;
        imageUrl?: string;
        category?: string;
        hidden?: boolean;
      })
    | null;
  onSave: (updatedService: any) => void;
  categories?: string[];
};

export const EditServiceDialog = ({
  isOpen,
  onOpenChange,
  service,
  onSave,
  categories = [],
}: Props) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [durationDisplay, setDurationDisplay] = React.useState("");
  const [priceDisplay, setPriceDisplay] = React.useState("");
  const isBufferLocked = true;

  // Estados extras (não serão enviados ao backend ainda)
  const [extraFields, setExtraFields] = React.useState({
    priceFrom: false,
    bufferTime: 15,
    category: "",
    active: true,
    featured: false,
  });

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
    imageType: "profile",
  });

  const { service: serviceData, loading: loadingServiceData } = useGetService({
    serviceId: service?.id || "",
    enabled: !!service?.id,
  });

  const { register, handleSubmit, formState, reset, setValue } =
    useForm<EditServiceFormValues>({
      resolver: zodResolver(editServiceSchema),
    });

  // Reset form quando o serviço muda
  useEffect(() => {
    if (service) {
      const duration = Number(service.duration) || 0;
      const price = Number(service.price) || 0;

      setDurationDisplay(duration > 0 ? formatTimeMask(duration) : "");
      setPriceDisplay(price > 0 ? formatCurrencyMask(price) : "");

      // Inicializar campos extras (valores padrão por enquanto)
      setExtraFields({
        priceFrom: false,
        bufferTime: 15,
        category: service.category || "",
        active: !service.hidden,
        featured: false,
      });

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

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyTimeMask(e.target.value);
    setDurationDisplay(maskedValue);
    setValue("duration", unmaskTime(maskedValue).toString());
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyCurrencyMask(e.target.value);
    setPriceDisplay(maskedValue);
    setValue("price", unmaskCurrency(maskedValue).toString());
  };

  const onSubmit = async (data: EditServiceFormValues) => {
    if (!service) return;

    try {
      // Atualizar os dados básicos do serviço
      const updatedService = await updateService({
        id: service.id,
        name: data.name,
        description: data.description,
        price: unmaskCurrency(priceDisplay).toString(),
        duration: unmaskTime(durationDisplay).toString(),
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
      <DialogContent className="services-dialog max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Serviço</DialogTitle>
          <DialogDescription>Atualize os dados do serviço e salve as alterações.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto h-24 w-24 rounded-lg object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <FiCamera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Clique para fazer upload ou arraste uma imagem
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG até 5MB
                  </p>
                </>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome do Serviço *</Label>
              <Input
                id="name"
                placeholder="Ex: Corte de cabelo masculino"
                {...register("name")}
                required
              />
              {formState.errors.name && (
                <p className="text-sm text-red-500">
                  {formState.errors.name.message}
                </p>
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
              {formState.errors.description && (
                <p className="text-sm text-red-500">
                  {formState.errors.description.message}
                </p>
              )}
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
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
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos) *</Label>
              <Input
                id="duration"
                placeholder="Ex: 30"
                value={durationDisplay}
                onChange={handleDurationChange}
              />
              {formState.errors.duration && (
                <p className="text-sm text-red-500">
                  {formState.errors.duration.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
             
                <Label htmlFor="price">Preço (R$)</Label>
                {/* <div className="flex items-center gap-2 ml-auto">
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
                </div> */}
         
              <Input
                id="price"
                placeholder="Ex: 50,00"
                value={priceDisplay}
                onChange={handlePriceChange}
              />
            </div>

            {/* <div className="space-y-2">
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
            </div> */}
          </div>

          {/* <div className="space-y-4 pt-4 border-t border-border">
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
          </div> */}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
              className="btn-gradient"
              disabled={isUpdating || isUploading}
            >
              {isUpdating
                ? "Salvando..."
                : isUploading
                ? "Enviando imagem..."
                : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};




