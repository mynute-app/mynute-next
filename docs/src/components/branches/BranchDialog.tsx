import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface WorkingHours {
  open: string;
  close: string;
  enabled: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  active: boolean;
  workingHours: {
    monday: WorkingHours;
    tuesday: WorkingHours;
    wednesday: WorkingHours;
    thursday: WorkingHours;
    friday: WorkingHours;
    saturday: WorkingHours;
    sunday: WorkingHours;
  };
  servicesCount: number;
  staffCount: number;
}

interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: Branch;
  onSave: (branch: Partial<Branch>) => void;
}

const DAYS = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
] as const;

const defaultWorkingHours: Branch["workingHours"] = {
  monday: { open: "09:00", close: "18:00", enabled: true },
  tuesday: { open: "09:00", close: "18:00", enabled: true },
  wednesday: { open: "09:00", close: "18:00", enabled: true },
  thursday: { open: "09:00", close: "18:00", enabled: true },
  friday: { open: "09:00", close: "18:00", enabled: true },
  saturday: { open: "09:00", close: "14:00", enabled: true },
  sunday: { open: "", close: "", enabled: false },
};

export function BranchDialog({ open, onOpenChange, branch, onSave }: BranchDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    active: true,
    workingHours: defaultWorkingHours,
  });

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name,
        address: branch.address,
        city: branch.city,
        state: branch.state,
        phone: branch.phone,
        email: branch.email,
        active: branch.active,
        workingHours: branch.workingHours,
      });
    } else {
      setFormData({
        name: "",
        address: "",
        city: "",
        state: "",
        phone: "",
        email: "",
        active: true,
        workingHours: defaultWorkingHours,
      });
    }
  }, [branch, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateWorkingHours = (
    day: keyof Branch["workingHours"],
    field: keyof WorkingHours,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {branch ? "Editar Filial" : "Nova Filial"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="hours">Horários</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh] mt-4">
              <TabsContent value="info" className="space-y-4 px-1">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Filial *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Unidade Centro"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número, complemento"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="São Paulo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="SP"
                      maxLength={2}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="filial@empresa.com"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>Filial Ativa</Label>
                    <p className="text-sm text-muted-foreground">
                      Filiais inativas não aparecem na página de agendamento
                    </p>
                  </div>
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="hours" className="space-y-4 px-1">
                <p className="text-sm text-muted-foreground mb-4">
                  Configure os horários de funcionamento desta filial.
                </p>

                {DAYS.map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-card"
                  >
                    <Switch
                      checked={formData.workingHours[key].enabled}
                      onCheckedChange={(checked) => updateWorkingHours(key, "enabled", checked)}
                    />
                    <span className="w-32 font-medium">{label}</span>
                    
                    {formData.workingHours[key].enabled ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={formData.workingHours[key].open}
                          onChange={(e) => updateWorkingHours(key, "open", e.target.value)}
                          className="w-28"
                        />
                        <span className="text-muted-foreground">às</span>
                        <Input
                          type="time"
                          value={formData.workingHours[key].close}
                          onChange={(e) => updateWorkingHours(key, "close", e.target.value)}
                          className="w-28"
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Fechado</span>
                    )}
                  </div>
                ))}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-gradient">
              {branch ? "Salvar Alterações" : "Criar Filial"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
