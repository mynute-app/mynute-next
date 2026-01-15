import { useState, useEffect } from "react";
import { Upload, Mail, Phone, Building2 } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface StaffBranchSchedule {
  branchId: string;
  branchName: string;
  enabled: boolean;
  schedule: {
    [key: string]: { enabled: boolean; open: string; close: string };
  };
}

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
  branchSchedules?: StaffBranchSchedule[];
}

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: Staff | null;
  onSave: (staff: Omit<Staff, "id" | "rating" | "appointmentsCount"> & { id?: string }) => void;
  availableServices: string[];
  availableBranches?: { id: string; name: string }[];
}

const weekDays = [
  { key: "monday", label: "Segunda", abbrev: "Seg" },
  { key: "tuesday", label: "Terça", abbrev: "Ter" },
  { key: "wednesday", label: "Quarta", abbrev: "Qua" },
  { key: "thursday", label: "Quinta", abbrev: "Qui" },
  { key: "friday", label: "Sexta", abbrev: "Sex" },
  { key: "saturday", label: "Sábado", abbrev: "Sáb" },
  { key: "sunday", label: "Domingo", abbrev: "Dom" },
];

const defaultSchedule = weekDays.reduce((acc, day) => {
  acc[day.key] = { 
    enabled: day.key !== "sunday", 
    open: "09:00", 
    close: "18:00" 
  };
  return acc;
}, {} as { [key: string]: { enabled: boolean; open: string; close: string } });

const mockBranches = [
  { id: "1", name: "Unidade Centro" },
  { id: "2", name: "Unidade Shopping" },
  { id: "3", name: "Unidade Zona Sul" },
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
  branchSchedules: [],
};

export function StaffDialog({
  open,
  onOpenChange,
  staff,
  onSave,
  availableServices,
  availableBranches = mockBranches,
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
        branchSchedules: staff.branchSchedules || availableBranches.map(b => ({
          branchId: b.id,
          branchName: b.name,
          enabled: false,
          schedule: { ...defaultSchedule },
        })),
      });
    } else {
      setFormData({
        ...defaultStaff,
        branchSchedules: availableBranches.map(b => ({
          branchId: b.id,
          branchName: b.name,
          enabled: false,
          schedule: { ...defaultSchedule },
        })),
      });
    }
  }, [staff, open, availableBranches]);

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

  const toggleBranch = (branchId: string) => {
    setFormData((prev) => ({
      ...prev,
      branchSchedules: prev.branchSchedules?.map(bs =>
        bs.branchId === branchId ? { ...bs, enabled: !bs.enabled } : bs
      ),
    }));
  };

  const updateBranchSchedule = (
    branchId: string,
    dayKey: string,
    field: "enabled" | "open" | "close",
    value: boolean | string
  ) => {
    setFormData((prev) => ({
      ...prev,
      branchSchedules: prev.branchSchedules?.map(bs =>
        bs.branchId === branchId
          ? {
              ...bs,
              schedule: {
                ...bs.schedule,
                [dayKey]: { ...bs.schedule[dayKey], [field]: value },
              },
            }
          : bs
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update workingDays based on branchSchedules for backwards compatibility
    const allEnabledDays = new Set<string>();
    formData.branchSchedules?.forEach(bs => {
      if (bs.enabled) {
        Object.entries(bs.schedule).forEach(([dayKey, daySchedule]) => {
          if (daySchedule.enabled) {
            const day = weekDays.find(d => d.key === dayKey);
            if (day) allEnabledDays.add(day.abbrev);
          }
        });
      }
    });
    
    onSave({
      ...formData,
      workingDays: Array.from(allEnabledDays),
    });
    onOpenChange(false);
  };

  const enabledBranches = formData.branchSchedules?.filter(bs => bs.enabled) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>
            {isEditing ? "Editar Profissional" : "Novo Profissional"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <Tabs defaultValue="info" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3 mx-6 max-w-[calc(100%-3rem)]">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
              <TabsTrigger value="schedule">Filiais & Horários</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 px-6">
              <TabsContent value="info" className="mt-4 space-y-6 pb-4">
                {/* Avatar Upload */}
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
                    {formData.name ? (
                      formData.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Foto do Profissional</Label>
                    <p className="text-sm text-muted-foreground">
                      Clique no avatar para fazer upload
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

                {/* Status */}
                <div className="flex items-center justify-between pt-4 border-t">
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
              </TabsContent>

              <TabsContent value="services" className="mt-4 space-y-4 pb-4">
                <div className="space-y-3">
                  <Label>Serviços que Atende</Label>
                  <p className="text-sm text-muted-foreground">
                    Selecione os serviços que este profissional pode realizar
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableServices.map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => toggleService(service)}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${
                          formData.services.includes(service)
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {formData.services.includes(service) && (
                          <span className="mr-1.5">✓</span>
                        )}
                        {service}
                      </button>
                    ))}
                  </div>
                  {formData.services.length === 0 && (
                    <p className="text-sm text-destructive">
                      Selecione pelo menos um serviço
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="mt-4 space-y-4 pb-4">
                <div className="space-y-3">
                  <Label>Filiais Vinculadas</Label>
                  <p className="text-sm text-muted-foreground">
                    Selecione as filiais onde este profissional trabalha e configure os horários
                  </p>
                  
                  {/* Branch Selection */}
                  <div className="flex flex-wrap gap-2">
                    {formData.branchSchedules?.map((bs) => (
                      <button
                        key={bs.branchId}
                        type="button"
                        onClick={() => toggleBranch(bs.branchId)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                          bs.enabled
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        {bs.branchName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schedule per Branch */}
                {enabledBranches.length > 0 ? (
                  <div className="space-y-6 pt-4">
                    {enabledBranches.map((bs) => (
                      <div key={bs.branchId} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <Label className="text-base font-semibold">{bs.branchName}</Label>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                          {weekDays.map((day) => (
                            <div
                              key={day.key}
                              className="flex items-center gap-3 py-2"
                            >
                              <Switch
                                checked={bs.schedule[day.key]?.enabled ?? false}
                                onCheckedChange={(checked) =>
                                  updateBranchSchedule(bs.branchId, day.key, "enabled", checked)
                                }
                              />
                              <span className="w-20 text-sm font-medium">{day.label}</span>
                              
                              {bs.schedule[day.key]?.enabled ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="time"
                                    value={bs.schedule[day.key]?.open || "09:00"}
                                    onChange={(e) =>
                                      updateBranchSchedule(bs.branchId, day.key, "open", e.target.value)
                                    }
                                    className="w-28 h-9"
                                  />
                                  <span className="text-muted-foreground text-sm">às</span>
                                  <Input
                                    type="time"
                                    value={bs.schedule[day.key]?.close || "18:00"}
                                    onChange={(e) =>
                                      updateBranchSchedule(bs.branchId, day.key, "close", e.target.value)
                                    }
                                    className="w-28 h-9"
                                  />
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">Folga</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Selecione pelo menos uma filial para configurar os horários</p>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/30">
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
