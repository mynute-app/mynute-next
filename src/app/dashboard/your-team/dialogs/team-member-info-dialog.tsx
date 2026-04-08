"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Mail, Phone, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useUploadEmployeeImage } from "@/hooks/use-upload-employee-image";
import type { Employee } from "../../../../../types/company";

type TeamMemberInfoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Employee | null;
  onReloadMember?: () => void;
};

type MemberFormState = {
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: string;
};

export function TeamMemberInfoDialog({
  open,
  onOpenChange,
  member,
  onReloadMember,
}: TeamMemberInfoDialogProps) {
  const { toast } = useToast();
  const { uploadImage, loading: isUploading } = useUploadEmployeeImage();
  const emptyState = useMemo<MemberFormState>(
    () => ({
      name: "",
      surname: "",
      email: "",
      phone: "",
      role: "",
    }),
    []
  );
  const [formState, setFormState] = useState<MemberFormState>(emptyState);
  const [initialState, setInitialState] =
    useState<MemberFormState>(emptyState);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [serverAvatarUrl, setServerAvatarUrl] = useState("");
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousMemberIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open || !member) {
      setFormState(emptyState);
      setInitialState(emptyState);
      setAvatarUrl("");
      setServerAvatarUrl("");
      setPendingImageFile(null);
      previousMemberIdRef.current = null;
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl(null);
      }
      return;
    }

    const displayEmail =
      member.email ||
      (member as { user?: { email?: string } } | null)?.user?.email ||
      "";
    const displayPhone =
      member.phone ||
      (member as { phone_number?: string } | null)?.phone_number ||
      "";
    const displayRole = member.role || member.permission || "";

    const nextState: MemberFormState = {
      name: member.name || "",
      surname: member.surname || "",
      email: displayEmail,
      phone: displayPhone,
      role: displayRole,
    };

    setFormState(nextState);
    setInitialState(nextState);

    const profileImageUrl =
      member?.meta?.design?.images?.profile?.url || "";
    const nextMemberId = member.id ?? null;
    const isNewMember = previousMemberIdRef.current !== nextMemberId;
    previousMemberIdRef.current = nextMemberId;

    if (isNewMember) {
      setPendingImageFile(null);
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
        setAvatarPreviewUrl(null);
      }
    }

    setServerAvatarUrl(profileImageUrl);
    if (!pendingImageFile || isNewMember) {
      setAvatarUrl(profileImageUrl);
    }
  }, [member, open, emptyState]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const hasChanges = useMemo(() => {
    return (
      formState.name.trim() !== initialState.name.trim() ||
      formState.surname.trim() !== initialState.surname.trim() ||
      formState.email.trim() !== initialState.email.trim() ||
      formState.phone.trim() !== initialState.phone.trim()
    );
  }, [formState, initialState]);
  const hasPendingImage = Boolean(pendingImageFile);
  const canSave = hasChanges || hasPendingImage;

  const handleChange = (field: keyof MemberFormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!member) return;
    if (!canSave) {
      onOpenChange(false);
      return;
    }

    setIsSaving(true);
    let fieldsSaved = false;
    let imageSaved = false;
    try {
      if (hasChanges) {
        const payload = {
          name: formState.name.trim(),
          surname: formState.surname.trim(),
          email: formState.email.trim(),
          phone: formState.phone.trim(),
        };

        const response = await fetch(`/api/employee/${member.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          throw new Error(errorText || "Erro ao atualizar profissional.");
        }

        setInitialState(formState);
        fieldsSaved = true;
      }

      if (pendingImageFile) {
        const result = await uploadImage(member.id, pendingImageFile);
        if (!result) {
          throw new Error("Erro ao enviar a foto do profissional.");
        }

        if (result.imageUrl) {
          if (avatarPreviewUrl) {
            URL.revokeObjectURL(avatarPreviewUrl);
            setAvatarPreviewUrl(null);
          }
          setServerAvatarUrl(result.imageUrl);
          setAvatarUrl(result.imageUrl);
        }
        setPendingImageFile(null);
        imageSaved = true;
      }

      if (fieldsSaved && imageSaved) {
        toast({
          title: "Profissional atualizado!",
          description: "Dados e foto foram salvos com sucesso.",
        });
      } else if (fieldsSaved) {
        toast({
          title: "Profissional atualizado!",
          description: "As informações foram salvas com sucesso.",
        });
      } else if (imageSaved) {
        toast({
          title: "Foto atualizada",
          description: "A imagem do profissional foi atualizada.",
        });
      }

      if (fieldsSaved || imageSaved) {
        onReloadMember?.();
      }

      onOpenChange(false);
    } catch (error) {
      if (fieldsSaved && pendingImageFile && !imageSaved) {
        toast({
          title: "Foto não enviada",
          description:
            "Os dados foram salvos, mas a foto não foi atualizada.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao salvar alterações",
          description:
            error instanceof Error
              ? error.message
              : "Não foi possível salvar as alterações.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (!member || isSaving || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !member) return;

    const previewUrl = URL.createObjectURL(file);
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarPreviewUrl(previewUrl);
    setAvatarUrl(previewUrl);
    setPendingImageFile(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] min-h-0 flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>
            {member ? "Editar profissional" : "Carregando profissional..."}
          </DialogTitle>
          <DialogDescription>
            {member
              ? "Atualize os dados principais do profissional."
              : "Aguarde enquanto carregamos as informacoes do profissional."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 px-6">
          {!member ? (
            <div className="py-6 text-sm text-muted-foreground">
              Buscando dados do profissional...
            </div>
          ) : (
            <div className="mt-4 pb-6 space-y-6">
              <div className="flex items-start gap-6">
                <div
                  className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={handleAvatarClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleAvatarClick();
                    }
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={member.name || "Profissional"}
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Foto do profissional</Label>
                  <p className="text-sm text-muted-foreground">
                    Clique na imagem para selecionar uma nova foto.
                    Ela sera enviada ao salvar.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAvatarClick}
                    disabled={isSaving || isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "Enviando..." : "Escolher arquivo"}
                  </Button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              {/* TODO: habilitar apelido, bio e status quando o backend suportar. */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={event =>
                      handleChange("name", event.target.value)
                    }
                    placeholder="Nome do profissional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surname">Sobrenome</Label>
                  <Input
                    id="surname"
                    value={formState.surname}
                    onChange={event =>
                      handleChange("surname", event.target.value)
                    }
                    placeholder="Sobrenome do profissional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formState.email}
                      onChange={event =>
                        handleChange("email", event.target.value)
                      }
                      placeholder="email@exemplo.com"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formState.phone}
                      onChange={event =>
                        handleChange("phone", event.target.value)
                      }
                      placeholder="+5511999999999"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="role">Perfil</Label>
                  <Input
                    id="role"
                    value={formState.role}
                    readOnly
                    placeholder="Perfil nao informado"
                  />
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving || isUploading}
          >
            Cancelar
          </Button>
          <Button
            className="btn-gradient"
            onClick={handleSave}
            disabled={!member || isSaving || isUploading || !canSave}
          >
            {isSaving ? "Salvando..." : "Salvar alteracoes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
