import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Search, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface StaffSchedule {
  staffId: string;
  enabled: boolean;
  hours: {
    monday: { open: string; close: string; enabled: boolean };
    tuesday: { open: string; close: string; enabled: boolean };
    wednesday: { open: string; close: string; enabled: boolean };
    thursday: { open: string; close: string; enabled: boolean };
    friday: { open: string; close: string; enabled: boolean };
    saturday: { open: string; close: string; enabled: boolean };
    sunday: { open: string; close: string; enabled: boolean };
  };
}

// Mock data - equipe global
const allStaff = [
  { id: "1", name: "Carlos Silva", role: "Barbeiro Senior", initials: "CS" },
  { id: "2", name: "Ana Costa", role: "Cabeleireira", initials: "AC" },
  { id: "3", name: "Pedro Santos", role: "Barbeiro", initials: "PS" },
  { id: "4", name: "Maria Oliveira", role: "Manicure", initials: "MO" },
  { id: "5", name: "João Lima", role: "Esteticista", initials: "JL" },
];

// Mock - equipe por filial com horários específicos
const branchStaffMap: Record<string, StaffSchedule[]> = {
  "1": [
    {
      staffId: "1",
      enabled: true,
      hours: {
        monday: { open: "08:00", close: "18:00", enabled: true },
        tuesday: { open: "08:00", close: "18:00", enabled: true },
        wednesday: { open: "08:00", close: "18:00", enabled: true },
        thursday: { open: "08:00", close: "18:00", enabled: true },
        friday: { open: "08:00", close: "18:00", enabled: true },
        saturday: { open: "09:00", close: "14:00", enabled: true },
        sunday: { open: "", close: "", enabled: false },
      },
    },
    {
      staffId: "2",
      enabled: true,
      hours: {
        monday: { open: "08:00", close: "18:00", enabled: true },
        tuesday: { open: "08:00", close: "18:00", enabled: true },
        wednesday: { open: "", close: "", enabled: false },
        thursday: { open: "08:00", close: "18:00", enabled: true },
        friday: { open: "08:00", close: "18:00", enabled: true },
        saturday: { open: "", close: "", enabled: false },
        sunday: { open: "", close: "", enabled: false },
      },
    },
  ],
  "2": [
    {
      staffId: "1",
      enabled: true,
      hours: {
        monday: { open: "", close: "", enabled: false },
        tuesday: { open: "", close: "", enabled: false },
        wednesday: { open: "10:00", close: "22:00", enabled: true },
        thursday: { open: "", close: "", enabled: false },
        friday: { open: "", close: "", enabled: false },
        saturday: { open: "10:00", close: "22:00", enabled: true },
        sunday: { open: "14:00", close: "20:00", enabled: true },
      },
    },
    {
      staffId: "3",
      enabled: true,
      hours: {
        monday: { open: "10:00", close: "22:00", enabled: true },
        tuesday: { open: "10:00", close: "22:00", enabled: true },
        wednesday: { open: "10:00", close: "22:00", enabled: true },
        thursday: { open: "10:00", close: "22:00", enabled: true },
        friday: { open: "10:00", close: "22:00", enabled: true },
        saturday: { open: "10:00", close: "22:00", enabled: true },
        sunday: { open: "", close: "", enabled: false },
      },
    },
  ],
};

// Mock - nome das filiais
const branchNames: Record<string, string> = {
  "1": "Unidade Centro",
  "2": "Unidade Shopping",
  "3": "Unidade Zona Sul",
};

const DAYS = [
  { key: "monday", label: "Segunda", abbrev: "Seg" },
  { key: "tuesday", label: "Terça", abbrev: "Ter" },
  { key: "wednesday", label: "Quarta", abbrev: "Qua" },
  { key: "thursday", label: "Quinta", abbrev: "Qui" },
  { key: "friday", label: "Sexta", abbrev: "Sex" },
  { key: "saturday", label: "Sábado", abbrev: "Sáb" },
  { key: "sunday", label: "Domingo", abbrev: "Dom" },
] as const;

const defaultHours = {
  monday: { open: "09:00", close: "18:00", enabled: true },
  tuesday: { open: "09:00", close: "18:00", enabled: true },
  wednesday: { open: "09:00", close: "18:00", enabled: true },
  thursday: { open: "09:00", close: "18:00", enabled: true },
  friday: { open: "09:00", close: "18:00", enabled: true },
  saturday: { open: "09:00", close: "14:00", enabled: true },
  sunday: { open: "", close: "", enabled: false },
};

const FilialEquipe = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [staffSchedules, setStaffSchedules] = useState<StaffSchedule[]>(
    branchStaffMap[branchId || "1"] || []
  );
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [editingHours, setEditingHours] = useState(defaultHours);

  const branchName = branchNames[branchId || "1"] || "Filial";

  const enabledStaffIds = staffSchedules.filter(s => s.enabled).map(s => s.staffId);

  const filteredStaff = allStaff.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStaffSchedule = (staffId: string): StaffSchedule | undefined => {
    return staffSchedules.find(s => s.staffId === staffId);
  };

  const toggleStaff = (staffId: string) => {
    const existing = getStaffSchedule(staffId);
    if (existing) {
      setStaffSchedules(prev =>
        prev.map(s =>
          s.staffId === staffId ? { ...s, enabled: !s.enabled } : s
        )
      );
    } else {
      // Add new staff with default hours
      setStaffSchedules(prev => [
        ...prev,
        { staffId, enabled: true, hours: defaultHours },
      ]);
    }
  };

  const openScheduleDialog = (staffId: string) => {
    const schedule = getStaffSchedule(staffId);
    setSelectedStaffId(staffId);
    setEditingHours(schedule?.hours || defaultHours);
    setScheduleDialogOpen(true);
  };

  const saveSchedule = () => {
    if (!selectedStaffId) return;

    const existing = getStaffSchedule(selectedStaffId);
    if (existing) {
      setStaffSchedules(prev =>
        prev.map(s =>
          s.staffId === selectedStaffId ? { ...s, hours: editingHours } : s
        )
      );
    } else {
      setStaffSchedules(prev => [
        ...prev,
        { staffId: selectedStaffId, enabled: true, hours: editingHours },
      ]);
    }
    setScheduleDialogOpen(false);
  };

  const updateEditingHours = (
    day: keyof typeof defaultHours,
    field: "open" | "close" | "enabled",
    value: string | boolean
  ) => {
    setEditingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const getWorkingDaysSummary = (staffId: string): string => {
    const schedule = getStaffSchedule(staffId);
    if (!schedule) return "Sem horários definidos";

    const enabledDays = DAYS
      .filter(d => schedule.hours[d.key].enabled)
      .map(d => d.abbrev);

    if (enabledDays.length === 0) return "Sem horários";
    if (enabledDays.length === 7) return "Todos os dias";
    return enabledDays.join(", ");
  };

  const selectedStaff = allStaff.find(s => s.id === selectedStaffId);

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/filiais">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="page-title">Equipe da Filial</h1>
          <p className="text-muted-foreground">{branchName}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar profissionais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="bg-card rounded-lg border px-4 py-3">
          <span className="text-2xl font-bold text-primary">{enabledStaffIds.length}</span>
          <span className="text-muted-foreground ml-2">nesta filial</span>
        </div>
        <div className="bg-card rounded-lg border px-4 py-3">
          <span className="text-2xl font-bold">{allStaff.length}</span>
          <span className="text-muted-foreground ml-2">total</span>
        </div>
      </div>

      {/* Staff List */}
      <div className="grid gap-4">
        {filteredStaff.map(staff => {
          const schedule = getStaffSchedule(staff.id);
          const isEnabled = schedule?.enabled ?? false;

          return (
            <div
              key={staff.id}
              className="flex items-center justify-between p-4 bg-card rounded-xl border"
            >
              <div className="flex items-center gap-4">
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => toggleStaff(staff.id)}
                />
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {staff.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{staff.name}</h3>
                  <p className="text-sm text-muted-foreground">{staff.role}</p>
                  {isEnabled && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{getWorkingDaysSummary(staff.id)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={isEnabled ? "default" : "secondary"}>
                  {isEnabled ? "Ativo" : "Inativo"}
                </Badge>
                {isEnabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openScheduleDialog(staff.id)}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Horários
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button className="btn-gradient">
          Salvar Alterações
        </Button>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Horários de {selectedStaff?.name} nesta filial
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <p className="text-sm text-muted-foreground">
              Configure os horários específicos deste profissional para esta filial.
            </p>

            {DAYS.map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
              >
                <Switch
                  checked={editingHours[key].enabled}
                  onCheckedChange={(checked) => updateEditingHours(key, "enabled", checked)}
                />
                <span className="w-24 font-medium text-sm">{label}</span>

                {editingHours[key].enabled ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={editingHours[key].open}
                      onChange={(e) => updateEditingHours(key, "open", e.target.value)}
                      className="w-24 h-8"
                    />
                    <span className="text-muted-foreground text-sm">às</span>
                    <Input
                      type="time"
                      value={editingHours[key].close}
                      onChange={(e) => updateEditingHours(key, "close", e.target.value)}
                      className="w-24 h-8"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Folga</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveSchedule} className="btn-gradient">
              Salvar Horários
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilialEquipe;
