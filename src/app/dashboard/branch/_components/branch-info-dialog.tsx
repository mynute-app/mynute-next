"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Building2,
  Globe,
  Hash,
  Home,
  ImagePlus,
  Map,
  MapPin,
  Navigation,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranchImage } from "@/hooks/branch/use-branch-image";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Branch } from "../../../../../types/company";

type BranchInfoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch | null;
  onSaved?: (branch: Branch) => void;
};

type BranchEditFormValues = {
  name: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
};

const buildDefaultValues = (branch: Branch | null): BranchEditFormValues => ({
  name: branch?.name ?? "",
  street: branch?.street ?? "",
  number: branch?.number ?? "",
  complement: branch?.complement ?? "",
  neighborhood: branch?.neighborhood ?? "",
  zip_code: branch?.zip_code ?? "",
  city: branch?.city ?? "",
  state: branch?.state ?? "",
  country: branch?.country ?? "",
});

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

export function BranchInfoDialog({
  open,
  onOpenChange,
  branch,
  onSaved,
}: BranchInfoDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [isImageMarkedForRemoval, setIsImageMarkedForRemoval] = useState(false);

  const { uploadImage, removeImage, isUploading, isRemoving } = useBranchImage({
    branchId: branch?.id ?? "",
    currentImage: imageUrl || undefined,
    imageType: "profile",
  });

  const defaultValues = useMemo(() => buildDefaultValues(branch), [branch]);
  const { register, handleSubmit, reset, formState } =
    useForm<BranchEditFormValues>({
      defaultValues,
    });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
      const currentImage =
        branch?.design?.images?.profile?.url ||
        branch?.design?.images?.logo?.url ||
        "";
      setImageUrl(currentImage);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
      }
      setPendingImageFile(null);
      setIsImageMarkedForRemoval(false);
    }
  }, [
    open,
    reset,
    defaultValues,
    branch?.design?.images?.profile?.url,
    branch?.design?.images?.logo?.url,
  ]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleImageClick = () => {
    if (isSaving || isUploading || isRemoving) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(previewUrl);
    setImageUrl(previewUrl);
    setPendingImageFile(file);
    setIsImageMarkedForRemoval(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMarkRemoveImage = () => {
    if (isSaving || isUploading || isRemoving) return;

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }

    setPendingImageFile(null);
    setImageUrl("");
    setIsImageMarkedForRemoval(true);
  };

  const handleSave = async (values: BranchEditFormValues) => {
    if (!branch) return;

    const hasPendingImage = Boolean(pendingImageFile);
    const hasImageChanges = hasPendingImage || isImageMarkedForRemoval;

    if (!formState.isDirty && !hasImageChanges) {
      onOpenChange(false);
      return;
    }

    setIsSaving(true);

    try {
      if (hasPendingImage && pendingImageFile) {
        const ok = await uploadImage(pendingImageFile, {
          showSuccessToast: false,
          showErrorToast: false,
        });
        if (!ok) {
          throw new Error("Erro ao enviar a imagem da filial.");
        }
        setPendingImageFile(null);
        setIsImageMarkedForRemoval(false);
      } else if (isImageMarkedForRemoval) {
        const ok = await removeImage({
          showSuccessToast: false,
          showErrorToast: false,
        });
        if (!ok) {
          throw new Error("Erro ao remover a imagem da filial.");
        }
        setIsImageMarkedForRemoval(false);
      }

      let updatedBranch = branch;

      if (formState.isDirty) {
        const response = await fetch(`/api/branch/${branch.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Erro ao atualizar filial");
        }

        updatedBranch = await response.json();
        reset(buildDefaultValues(updatedBranch));

        toast({
          title: "Filial atualizada!",
          description: "Os dados foram salvos com sucesso.",
        });
      }

      onSaved?.(updatedBranch);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar alterações",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="sticky top-0 z-10 border-b border-border bg-background/95 px-6 pb-4 pt-6 backdrop-blur">
          <DialogTitle>
            {branch ? "Editar filial" : "Carregando filial"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Atualize as informações da filial.
          </DialogDescription>
        </DialogHeader>

        {!branch ? (
          <div className="space-y-4 px-6 py-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleSave)}>
            <div className="px-6">
              <div className="mt-5 space-y-6 pb-5">
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-foreground">
                      Imagem da filial
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Adicione uma foto para facilitar a identificação da
                      unidade.
                    </p>
                  </div>

                  <div className="flex items-center gap-5">
                    <button
                      type="button"
                      className="group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-primary/15 to-primary/5"
                      onClick={handleImageClick}
                      disabled={isSaving || isUploading || isRemoving}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={branch?.name || "Filial"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImagePlus className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className="absolute inset-0 hidden items-center justify-center bg-black/35 text-white group-hover:flex">
                        <Upload className="h-4 w-4" />
                      </div>
                    </button>

                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Clique na imagem para selecionar uma nova foto. Ela será
                        enviada ao salvar.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleImageClick}
                          disabled={isSaving || isUploading || isRemoving}
                          className="gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          {isUploading ? "Enviando..." : "Escolher arquivo"}
                        </Button>
                        {imageUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkRemoveImage}
                            disabled={isSaving || isUploading || isRemoving}
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remover foto
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-card p-4">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-foreground">
                      Dados da filial
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="branch-name">Nome da filial *</Label>
                      <InputWithIcon
                        id="branch-name"
                        placeholder="Ex: Unidade Centro"
                        icon={Building2}
                        {...register("name", { required: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="branch-street">Rua *</Label>
                      <InputWithIcon
                        id="branch-street"
                        placeholder="Nome da rua"
                        icon={MapPin}
                        {...register("street", { required: true })}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="branch-number">Número *</Label>
                        <InputWithIcon
                          id="branch-number"
                          placeholder="Número"
                          icon={Hash}
                          {...register("number", { required: true })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="branch-complement">Complemento</Label>
                        <InputWithIcon
                          id="branch-complement"
                          placeholder="Apto, sala, etc."
                          icon={Home}
                          {...register("complement")}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="branch-neighborhood">Bairro</Label>
                        <InputWithIcon
                          id="branch-neighborhood"
                          placeholder="Bairro"
                          icon={Navigation}
                          {...register("neighborhood")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="branch-zip">CEP *</Label>
                        <InputWithIcon
                          id="branch-zip"
                          placeholder="00000-000"
                          icon={MapPin}
                          {...register("zip_code", { required: true })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="branch-city">Cidade *</Label>
                        <InputWithIcon
                          id="branch-city"
                          placeholder="Cidade"
                          icon={Building2}
                          {...register("city", { required: true })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="branch-state">Estado *</Label>
                        <InputWithIcon
                          id="branch-state"
                          placeholder="Estado"
                          icon={Map}
                          {...register("state", { required: true })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="branch-country">País *</Label>
                      <InputWithIcon
                        id="branch-country"
                        placeholder="País"
                        icon={Globe}
                        {...register("country", { required: true })}
                      />
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="btn-gradient"
                disabled={
                  !branch ||
                  isSaving ||
                  isUploading ||
                  isRemoving ||
                  (!formState.isDirty &&
                    !pendingImageFile &&
                    !isImageMarkedForRemoval)
                }
              >
                {isSaving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
