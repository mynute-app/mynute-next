"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Briefcase, Clock, DollarSign, Plus, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useEditService } from "@/hooks/services/use-edit-service";
import { useServiceImage } from "@/hooks/services/use-service-image";
import { useGetService } from "@/hooks/services/use-get-service";
import { useServiceInventoryItems } from "@/hooks/services/use-service-inventory-items";
import { useToast } from "@/hooks/use-toast";
import {
  applyCurrencyMask,
  applyTimeMask,
  unmaskCurrency,
  unmaskTime,
  formatTimeMask,
  formatCurrencyMask,
} from "@/utils/format-masks";
import { ServiceDescriptionEditor } from "@/components/services/service-description-editor";
import { cn } from "@/lib/utils";
import type { Service } from "../../../../types/company";

const editServiceSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  duration: z.string().min(1, "A duração é obrigatória."),
  price: z.string().optional(),
});

export type EditServiceFormValues = z.infer<typeof editServiceSchema>;

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

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  service:
    | (EditServiceFormValues & {
        id: string;
        imageUrl?: string;
        category?: string;
        hidden?: boolean;
        is_active?: boolean;
        show_image?: boolean;
      })
    | null;
  onSave: (updatedService: Service) => void;
  categories?: string[];
};

export const EditServiceDialog = ({
  isOpen,
  onOpenChange,
  service,
  onSave,
}: Props) => {
  const [durationDisplay, setDurationDisplay] = React.useState("");
  const [priceDisplay, setPriceDisplay] = React.useState("");
  const [showImage, setShowImage] = React.useState(true);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [newItemProductId, setNewItemProductId] = React.useState("");
  const [newItemUnitId, setNewItemUnitId] = React.useState("");
  const [newItemQty, setNewItemQty] = React.useState("");

  const { isUpdating, updateService } = useEditService();
  const {
    items: inventoryItems,
    loading: loadingInventory,
    fetchItems,
    addItem,
    deleteItem,
  } = useServiceInventoryItems(service?.id ?? "");
  const { uploadImage } = useServiceImage({
    serviceId: service?.id || "",
    currentImage: service?.imageUrl,
    imageType: "profile",
  });
  const { toast } = useToast();

  const { register, handleSubmit, formState, reset, setValue, watch } =
    useForm<EditServiceFormValues>({
      resolver: zodResolver(editServiceSchema),
    });

  const descriptionValue = watch("description") || "";

  useEffect(() => {
    if (isOpen && service?.id) {
      fetchItems();
    }
  }, [isOpen, service?.id, fetchItems]);

  const handleAddInventoryItem = async () => {
    const qty = parseFloat(newItemQty);
    if (!newItemProductId.trim() || !newItemUnitId.trim() || isNaN(qty) || qty <= 0) return;
    try {
      await addItem({
        product_id: newItemProductId.trim(),
        unit_id: newItemUnitId.trim(),
        default_quantity: qty,
        is_required: false,
      });
      setNewItemProductId("");
      setNewItemUnitId("");
      setNewItemQty("");
    } catch (err) {
      toast({
        title: "Erro ao adicionar insumo",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
    } catch (err) {
      toast({
        title: "Erro ao remover insumo",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (service) {
      const duration = Number(service.duration) || 0;
      const price = Number(service.price) || 0;

      setDurationDisplay(duration > 0 ? formatTimeMask(duration) : "");
      setPriceDisplay(price > 0 ? formatCurrencyMask(price) : "");
      setShowImage(service.show_image ?? true);
      setImagePreview(service.imageUrl || "");
      setImageFile(null);

      reset({
        name: service.name || "",
        description: service.description || "",
        duration: String(service.duration || ""),
        price: String(service.price || ""),
      });
    }
  }, [service, reset]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const onSubmit = async (data: EditServiceFormValues) => {
    if (!service) return;

    try {
      // Fazer upload da imagem se houver arquivo novo
      if (imageFile) {
        setIsUploadingImage(true);
        const uploadSuccess = await uploadImage(imageFile);
        setIsUploadingImage(false);

        if (!uploadSuccess) {
          return; // Não continua se falhar o upload
        }
      }

      // Atualizar dados do serviço
      const updatedService = await updateService({
        id: service.id,
        name: data.name,
        description: data.description,
        price: unmaskCurrency(priceDisplay).toString(),
        duration: unmaskTime(durationDisplay).toString(),
        show_image: showImage,
      });

      if (updatedService) {
        setImageFile(null); // Limpar arquivo após sucesso
        onSave(updatedService);
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar serviço",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="sticky top-0 z-10 border-b border-border bg-background/95 px-6 pb-4 pt-6 backdrop-blur">
          <div className="space-y-1">
            <DialogTitle className="text-xl">Editar Serviço</DialogTitle>
            <DialogDescription className="text-sm">
              Altere os detalhes e configurações do seu serviço
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6">
            <div className="mt-5 space-y-6 pb-5">
              {/* Imagem */}
              <div className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-foreground">
                    Imagem do Serviço
                  </p>
                </div>

                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted">
                        {imagePreview.includes("localhost") ||
                        imagePreview.includes("127.0.0.1") ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 bg-background/50 p-8 transition-colors hover:border-border hover:bg-background">
                      <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        Clique para fazer upload da imagem
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG até 5MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Insumos do Serviço */}
              <div className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-foreground">
                    Insumos do Serviço
                  </p>
                </div>

                {loadingInventory ? (
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : inventoryItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50 text-left text-muted-foreground">
                          <th className="pb-2 font-medium">Produto</th>
                          <th className="pb-2 font-medium">Qtd padrão</th>
                          <th className="pb-2 font-medium">Unidade</th>
                          <th className="pb-2 font-medium">Obrigatório</th>
                          <th className="pb-2 font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryItems.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-border/30 last:border-0"
                          >
                            <td className="py-2">{item.product_name}</td>
                            <td className="py-2">{item.default_quantity}</td>
                            <td className="py-2">{item.unit_symbol ?? "—"}</td>
                            <td className="py-2">
                              {item.is_required ? "Sim" : "Não"}
                            </td>
                            <td className="py-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                aria-label="Remover insumo"
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum insumo cadastrado.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Input
                    type="text"
                    placeholder="ID do produto"
                    value={newItemProductId}
                    onChange={(e) => setNewItemProductId(e.target.value)}
                    className="h-9 flex-1 rounded-lg border-border/70 bg-background/70 text-sm"
                  />
                  <Input
                    type="text"
                    placeholder="ID da unidade"
                    value={newItemUnitId}
                    onChange={(e) => setNewItemUnitId(e.target.value)}
                    className="h-9 w-36 rounded-lg border-border/70 bg-background/70 text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Qtd"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    className="h-9 w-24 rounded-lg border-border/70 bg-background/70 text-sm"
                    min="0.01"
                    step="0.01"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9"
                    onClick={handleAddInventoryItem}
                    disabled={
                      !newItemProductId.trim() ||
                      !newItemUnitId.trim() ||
                      !newItemQty ||
                      loadingInventory
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Dados do Serviço */}
              <div className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-foreground">
                    Dados do Serviço
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="service-name">Nome do Serviço *</Label>
                    <InputWithIcon
                      id="service-name"
                      placeholder="Ex: Corte de cabelo masculino"
                      icon={Briefcase}
                      {...register("name", { required: true })}
                    />
                    {formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service-description">Descrição *</Label>
                    <ServiceDescriptionEditor
                      value={descriptionValue}
                      onChange={value =>
                        setValue("description", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      error={formState.errors.description?.message}
                    />
                    <input type="hidden" {...register("description")} />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="service-duration">Duração (min) *</Label>
                      <InputWithIcon
                        id="service-duration"
                        placeholder="Ex: 30"
                        icon={Clock}
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
                      <Label htmlFor="service-price">Preço (R$)</Label>
                      <InputWithIcon
                        id="service-price"
                        placeholder="Ex: 50,00"
                        icon={DollarSign}
                        value={priceDisplay}
                        onChange={handlePriceChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <Switch
                id="show-image"
                checked={showImage}
                onCheckedChange={setShowImage}
              />
              <Label
                htmlFor="show-image"
                className="cursor-pointer text-sm font-normal"
              >
                Exibir imagem na página pública
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUpdating || isUploadingImage}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="btn-gradient"
                disabled={isUpdating || isUploadingImage}
              >
                {isUploadingImage
                  ? "Enviando imagem..."
                  : isUpdating
                    ? "Salvando..."
                    : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
