"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAddEmployeeForm } from "@/hooks/post-employee";
import { FormError } from "@/app/auth/register-company/_components/form-error";

interface AddTeamMemberDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onSuccess?: () => void;
  availableServices?: string[];
}

type ExtraFields = {
  nickname: string;
  bio: string;
  active: boolean;
  services: string[];
  workingDays: string[];
};

const defaultExtraFields: ExtraFields = {
  nickname: "",
  bio: "",
  active: true,
  services: [],
  workingDays: ["Seg", "Ter", "Qua", "Qui", "Sex"],
};

const weekDays = [
  { key: "Seg", label: "Segunda" },
  { key: "Ter", label: "Ter\u00e7a" },
  { key: "Qua", label: "Quarta" },
  { key: "Qui", label: "Quinta" },
  { key: "Sex", label: "Sexta" },
  { key: "S\u00e1b", label: "S\u00e1bado" },
  { key: "Dom", label: "Domingo" },
];

export default function AddTeamMemberDialog({
  isOpen,
  setIsOpen,
  onSuccess,
  availableServices = [],
}: AddTeamMemberDialogProps) {
  const { form, handleSubmit } = useAddEmployeeForm(onSuccess);

  const {
    register,
    handleSubmit: submitHandler,
    setValue,
    formState,
    setError,
    watch,
  } = form;

  const { errors, isSubmitting } = formState;
  const [extraFields, setExtraFields] =
    useState<ExtraFields>(defaultExtraFields);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nameValue = watch("name");
  const surnameValue = watch("surname");

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");

    let formattedDigits: string;
    if (digits.startsWith("55") && digits.length <= 13) {
      formattedDigits = digits;
    } else if (digits.length <= 11) {
      formattedDigits = `55${digits}`;
    } else {
      return `+${digits}`;
    }

    return `+${formattedDigits}`;
  };

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setExtraFields(defaultExtraFields);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [avatarPreview, form, isOpen]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(URL.createObjectURL(file));
  };

  const toggleWorkingDay = (dayKey: string) => {
    setExtraFields(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(dayKey)
        ? prev.workingDays.filter(day => day !== dayKey)
        : [...prev.workingDays, dayKey],
    }));
  };

  const toggleService = (service: string) => {
    setExtraFields(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(item => item !== service)
        : [...prev.services, service],
    }));
  };

  const onSubmit = async (data: any) => {
    data.timezone = "America/Sao_Paulo";
    data.role = "user";
    data.password = "Senha123!";

    const ok = await handleSubmit(data, setError);
    if (ok) {
      setIsOpen(false);
      onSuccess?.();
    }
  };

  const avatarLabel = [nameValue, surnameValue]
    .map(value => (value || "").trim())
    .filter(Boolean)
    .map(value => value[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="team-dialog max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Profissional</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para adicionar um novo profissional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitHandler(onSubmit)} className="space-y-6">
          <div className="flex items-start gap-6">
            <div
              className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-2xl font-bold flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleImageClick}
              role="button"
              tabIndex={0}
              onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                  handleImageClick();
                }
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : avatarLabel ? (
                avatarLabel
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Label>Foto do Profissional</Label>
              <p className="text-sm text-muted-foreground">
                Clique no avatar para fazer upload de uma foto
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImageClick}
              >
                <Upload className="w-4 h-4 mr-2" />
                Escolher arquivo
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Nome do profissional"
                className={
                  errors.name
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : ""
                }
                {...register("name")}
                required
              />
              <FormError message={errors.name?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Sobrenome *</Label>
              <Input
                id="surname"
                placeholder="Sobrenome do profissional"
                className={
                  errors.surname
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : ""
                }
                {...register("surname")}
                required
              />
              <FormError message={errors.surname?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">Apelido</Label>
              <Input
                id="nickname"
                placeholder="Como \u00e9 conhecido"
                value={extraFields.nickname}
                onChange={event =>
                  setExtraFields(prev => ({
                    ...prev,
                    nickname: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  className={`pl-9 ${
                    errors.email
                      ? "border-destructive focus-visible:ring-destructive/20"
                      : ""
                  }`}
                  {...register("email")}
                  required
                />
              </div>
              <FormError message={errors.email?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+5511999999999"
                  className={`pl-9 ${
                    errors.phone
                      ? "border-destructive focus-visible:ring-destructive/20"
                      : ""
                  }`}
                  {...register("phone", {
                    onChange: e => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setValue("phone", formatted, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    },
                  })}
                  required
                />
              </div>
              <FormError message={errors.phone?.message} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio / Descri\u00e7\u00e3o</Label>
              <Textarea
                id="bio"
                placeholder="Descreva o profissional, especialidades, experi\u00eancia..."
                rows={3}
                value={extraFields.bio}
                onChange={event =>
                  setExtraFields(prev => ({
                    ...prev,
                    bio: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Dias de Trabalho</Label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map(day => (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => toggleWorkingDay(day.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    extraFields.workingDays.includes(day.key)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                  title={day.label}
                >
                  {day.key}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Servi\u00e7os que Atende</Label>
            <div className="flex flex-wrap gap-2">
              {availableServices.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum servi\u00e7o cadastrado ainda
                </p>
              ) : (
                availableServices.map(service => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      extraFields.services.includes(service)
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {extraFields.services.includes(service) && (
                      <span className="mr-1">{"\u2713"}</span>
                    )}
                    {service}
                  </button>
                ))
              )}
            </div>
            {availableServices.length > 0 && extraFields.services.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Selecione pelo menos um servi\u00e7o
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="space-y-0.5">
              <Label>Profissional Ativo</Label>
              <p className="text-sm text-muted-foreground">
                Profissionais inativos n\u00e3o recebem agendamentos
              </p>
            </div>
            <Switch
              checked={extraFields.active}
              onCheckedChange={checked =>
                setExtraFields(prev => ({ ...prev, active: checked }))
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="btn-gradient" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
