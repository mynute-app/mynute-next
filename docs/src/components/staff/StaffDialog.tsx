import { useState, useEffect } from "react";
import { Upload, Mail, Phone, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export interface Staff {
  id: string;
  name: string;
  nickname?: string;
  bio: string;
  email: string;
  phone: string;
  services: string[];
  active: boolean;
  avatar?: string;
  rating: number;
  appointmentsCount: number;
  workingDays: string[];
}

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: Staff | null;
  onSave: (staff: Omit<Staff, "id" | "rating" | "appointmentsCount"> & { id?: string }) => void;
  availableServices: string[];
}

const weekDays = [
  { key: "Seg", label: "Segunda" },
  { key: "Ter", label: "Terça" },
  { key: "Qua", label: "Quarta" },
  { key: "Qui", label: "Quinta" },
  { key: "Sex", label: "Sexta" },
  { key: "Sáb", label: "Sábado" },
  { key: "Dom", label: "Domingo" },
];

const defaultStaff: Omit<Staff, "id" | "rating" | "appointmentsCount"> = {
  name: "",
  nickname: "",
  bio: "",
  email: "",
  phone: "",
  services: [],
  active: true,
  workingDays: ["Seg", "Ter", "Qua", "Qui", "Sex"],
};

export function StaffDialog({
  open,
  onOpenChange,
  staff,
  onSave,
  availableServices,
}: StaffDialogProps) {
  const [formData, setFormData] = useState<Omit<Staff, "id" | "rating" | "appointmentsCount"> & { id?: string }>(defaultStaff);
  const isEditing = !!staff;

  useEffect(() => {
    if (staff) {
      setFormData({
        id: staff.id,
        name: staff.name,
        nickname: staff.nickname,
        bio: staff.bio,
        email: staff.email,
        phone: staff.phone,
        services: staff.services,
        active: staff.active,
        avatar: staff.avatar,
        workingDays: staff.workingDays,
      });
    } else {
      setFormData(defaultStaff);
    }
  }, [staff, open]);

  const handleChange = (field: keyof Staff, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const toggleWorkingDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Profissional" : "Novo Profissional"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-2xl font-bold flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
              {formData.name ? (
                formData.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Label>Foto do Profissional</Label>
              <p className="text-sm text-muted-foreground">
                Clique no avatar para fazer upload de uma foto
              </p>
              <Button type="button" variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Escolher Arquivo
              </Button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nome do profissional"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">Apelido</Label>
              <Input
                id="nickname"
                value={formData.nickname || ""}
                onChange={(e) => handleChange("nickname", e.target.value)}
                placeholder="Como é conhecido"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@exemplo.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio / Descrição</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Descreva o profissional, especialidades, experiência..."
                rows={3}
              />
            </div>
          </div>

          {/* Working Days */}
          <div className="space-y-3">
            <Label>Dias de Trabalho</Label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => toggleWorkingDay(day.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.workingDays.includes(day.key)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {day.key}
                </button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <Label>Serviços que Atende</Label>
            <div className="flex flex-wrap gap-2">
              {availableServices.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    formData.services.includes(service)
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {formData.services.includes(service) && (
                    <span className="mr-1">✓</span>
                  )}
                  {service}
                </button>
              ))}
            </div>
            {formData.services.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Selecione pelo menos um serviço
              </p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="space-y-0.5">
              <Label>Profissional Ativo</Label>
              <p className="text-sm text-muted-foreground">
                Profissionais inativos não recebem agendamentos
              </p>
            </div>
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) => handleChange("active", checked)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="btn-gradient">
              {isEditing ? "Salvar Alterações" : "Criar Profissional"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
