import { useState, useEffect } from "react";
import { Upload, Mail, Phone, Building2, Clock, Calendar, CheckCircle2, Briefcase } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Serviços por horário/dia
export interface TimeSlotServices {
  dayKey: string;
  open: string;
  close: string;
  services: string[];
}

export interface StaffBranchSchedule {
  branchId: string;
  branchName: string;
  enabled: boolean;
  schedule: {
    [key: string]: { enabled: boolean; open: string; close: string };
  };
  timeSlotServices?: TimeSlotServices[];
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

interface ServiceInfo {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: Staff | null;
  onSave: (staff: Omit<Staff, "id" | "rating" | "appointmentsCount"> & { id?: string }) => void;
  availableServices: string[];
  availableServicesInfo?: ServiceInfo[];
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

const mockServicesInfo: ServiceInfo[] = [
  { id: "1", name: "Lavagem Tradicional (Hatch)", duration: 120, price: 70 },
  { id: "2", name: "Lavagem Tradicional (SUV)", duration: 120, price: 90 },
  { id: "3", name: "Lavagem Tradicional (Caminhonete)", duration: 120, price: 110 },
  { id: "4", name: "Lavagem Tradicional (Moto)", duration: 120, price: 50 },
  { id: "5", name: "Lavagem Completa", duration: 180, price: 150 },
  { id: "6", name: "Polimento", duration: 240, price: 300 },
  { id: "7", name: "Higienização Interna", duration: 90, price: 120 },
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
  availableServicesInfo = mockServicesInfo,
  availableBranches = mockBranches,
}: StaffDialogProps) {
  const [formData, setFormData] = useState<Omit<Staff, "id" | "rating" | "appointmentsCount"> & { id?: string }>(defaultStaff);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
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
          timeSlotServices: [],
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
          timeSlotServices: [],
        })),
      });
    }
    setSelectedTimeSlot(null);
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

  // Get all enabled time slots across all branches
  const getAvailableTimeSlots = () => {
    const slots: { id: string; branchId: string; branchName: string; dayKey: string; dayLabel: string; open: string; close: string }[] = [];
    
    formData.branchSchedules?.forEach(bs => {
      if (bs.enabled) {
        weekDays.forEach(day => {
          if (bs.schedule[day.key]?.enabled) {
            slots.push({
              id: `${bs.branchId}-${day.key}`,
              branchId: bs.branchId,
              branchName: bs.branchName,
              dayKey: day.key,
              dayLabel: day.label,
              open: bs.schedule[day.key].open,
              close: bs.schedule[day.key].close,
            });
          }
        });
      }
    });
    
    return slots;
  };

  const getTimeSlotServices = (branchId: string, dayKey: string): string[] => {
    const bs = formData.branchSchedules?.find(b => b.branchId === branchId);
    const slot = bs?.timeSlotServices?.find(ts => ts.dayKey === dayKey);
    return slot?.services || formData.services; // fallback to all services
  };

  const toggleTimeSlotService = (branchId: string, dayKey: string, serviceName: string) => {
    setFormData(prev => ({
      ...prev,
      branchSchedules: prev.branchSchedules?.map(bs => {
        if (bs.branchId !== branchId) return bs;
        
        const existingSlot = bs.timeSlotServices?.find(ts => ts.dayKey === dayKey);
        const currentServices = existingSlot?.services || [...prev.services];
        
        const newServices = currentServices.includes(serviceName)
          ? currentServices.filter(s => s !== serviceName)
          : [...currentServices, serviceName];
        
        if (existingSlot) {
          return {
            ...bs,
            timeSlotServices: bs.timeSlotServices?.map(ts =>
              ts.dayKey === dayKey ? { ...ts, services: newServices } : ts
            ),
          };
        } else {
          return {
            ...bs,
            timeSlotServices: [
              ...(bs.timeSlotServices || []),
              { dayKey, open: bs.schedule[dayKey].open, close: bs.schedule[dayKey].close, services: newServices },
            ],
          };
        }
      }),
    }));
  };

  const setAllServicesForSlot = (branchId: string, dayKey: string) => {
    setFormData(prev => ({
      ...prev,
      branchSchedules: prev.branchSchedules?.map(bs => {
        if (bs.branchId !== branchId) return bs;
        
        const existingSlot = bs.timeSlotServices?.find(ts => ts.dayKey === dayKey);
        
        if (existingSlot) {
          return {
            ...bs,
            timeSlotServices: bs.timeSlotServices?.map(ts =>
              ts.dayKey === dayKey ? { ...ts, services: [...prev.services] } : ts
            ),
          };
        } else {
          return {
            ...bs,
            timeSlotServices: [
              ...(bs.timeSlotServices || []),
              { dayKey, open: bs.schedule[dayKey].open, close: bs.schedule[dayKey].close, services: [...prev.services] },
            ],
          };
        }
      }),
    }));
  };

  const clearServicesForSlot = (branchId: string, dayKey: string) => {
    setFormData(prev => ({
      ...prev,
      branchSchedules: prev.branchSchedules?.map(bs => {
        if (bs.branchId !== branchId) return bs;
        
        const existingSlot = bs.timeSlotServices?.find(ts => ts.dayKey === dayKey);
        
        if (existingSlot) {
          return {
            ...bs,
            timeSlotServices: bs.timeSlotServices?.map(ts =>
              ts.dayKey === dayKey ? { ...ts, services: [] } : ts
            ),
          };
        } else {
          return {
            ...bs,
            timeSlotServices: [
              ...(bs.timeSlotServices || []),
              { dayKey, open: bs.schedule[dayKey].open, close: bs.schedule[dayKey].close, services: [] },
            ],
          };
        }
      }),
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
  const availableTimeSlots = getAvailableTimeSlots();
  const selectedSlotInfo = selectedTimeSlot 
    ? availableTimeSlots.find(s => s.id === selectedTimeSlot) 
    : null;

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
            <TabsList className="grid w-full grid-cols-4 mx-6 max-w-[calc(100%-3rem)]">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
              <TabsTrigger value="schedule">Horários</TabsTrigger>
              <TabsTrigger value="services-schedule">Por Horário</TabsTrigger>
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
                    Selecione os serviços que este profissional pode realizar (disponíveis em todos os horários por padrão)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableServicesInfo.map((service) => {
                      const isSelected = formData.services.includes(service.name);
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => toggleService(service.name)}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Checkbox checked={isSelected} className="pointer-events-none" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                              <span className={`text-sm font-medium truncate ${isSelected ? "text-primary" : ""}`}>
                                {service.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>{service.duration} min</span>
                              <span>R$ {service.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
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

              {/* Nova aba: Serviços por Horário */}
              <TabsContent value="services-schedule" className="mt-4 space-y-6 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <Label className="text-lg font-semibold">Serviços por Horário</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configure quais serviços o funcionário pode realizar em cada horário específico.
                    Por padrão, todos os serviços selecionados na aba "Serviços" estão disponíveis em todos os horários.
                  </p>
                </div>

                {availableTimeSlots.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground rounded-lg border-2 border-dashed">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Nenhum horário configurado</p>
                    <p className="text-sm mt-1">Configure os horários na aba "Horários" primeiro</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Seletor de Horário */}
                    <div className="rounded-lg border bg-card p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <Label>Selecionar Horário</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Escolha o horário específico para configurar os serviços
                      </p>
                      
                      <Select
                        value={selectedTimeSlot || ""}
                        onValueChange={setSelectedTimeSlot}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um horário..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimeSlots.map(slot => (
                            <SelectItem key={slot.id} value={slot.id}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{slot.dayLabel}</span>
                                <span className="text-muted-foreground">
                                  {slot.open} - {slot.close}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ({slot.branchName})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Lista rápida de horários */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {availableTimeSlots.map(slot => {
                          const slotServices = getTimeSlotServices(slot.branchId, slot.dayKey);
                          const isSelected = selectedTimeSlot === slot.id;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedTimeSlot(slot.id)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="font-medium">{slot.dayLabel}</span>
                              <Clock className="w-3 h-3 ml-1" />
                              <span className="text-xs text-muted-foreground">
                                {slot.open} - {slot.close}
                              </span>
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                {slotServices.length} serviços
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Configurar Serviços para o horário selecionado */}
                    {selectedSlotInfo && (
                      <div className="rounded-lg border bg-card p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-muted-foreground" />
                              <Label>Configurar Serviços</Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Selecione os serviços disponíveis para{" "}
                              <span className="font-medium text-foreground">{selectedSlotInfo.dayLabel}</span>{" "}
                              ({selectedSlotInfo.open} - {selectedSlotInfo.close}) - {selectedSlotInfo.branchName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setAllServicesForSlot(selectedSlotInfo.branchId, selectedSlotInfo.dayKey)}
                            >
                              Marcar Todos
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => clearServicesForSlot(selectedSlotInfo.branchId, selectedSlotInfo.dayKey)}
                            >
                              Limpar
                            </Button>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {getTimeSlotServices(selectedSlotInfo.branchId, selectedSlotInfo.dayKey).length} serviço(s) selecionado(s)
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {formData.services.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                              <p>Selecione serviços na aba "Serviços" primeiro</p>
                            </div>
                          ) : (
                            formData.services.map((serviceName) => {
                              const serviceInfo = availableServicesInfo.find(s => s.name === serviceName);
                              const slotServices = getTimeSlotServices(selectedSlotInfo.branchId, selectedSlotInfo.dayKey);
                              const isSelected = slotServices.includes(serviceName);
                              
                              return (
                                <button
                                  key={serviceName}
                                  type="button"
                                  onClick={() => toggleTimeSlotService(selectedSlotInfo.branchId, selectedSlotInfo.dayKey, serviceName)}
                                  className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                                    isSelected
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50 opacity-60"
                                  }`}
                                >
                                  <Checkbox checked={isSelected} className="mt-0.5 pointer-events-none" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                                      <span className={`text-sm font-medium truncate ${isSelected ? "text-primary" : ""}`}>
                                        {serviceName}
                                      </span>
                                    </div>
                                    {serviceInfo && (
                                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <span>{serviceInfo.duration} min</span>
                                        <span>R$ {serviceInfo.price.toFixed(2)}</span>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
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
