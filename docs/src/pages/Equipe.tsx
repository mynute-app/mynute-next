import { useState } from "react";
import { Search, Plus, MoreHorizontal, Calendar, Star, Edit, Trash2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { StaffDialog, Staff } from "@/components/staff/StaffDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initialStaff: Staff[] = [
  {
    id: "1",
    name: "Carlos Eduardo",
    nickname: "Carlos",
    bio: "Especialista em polimento e cristalização com 10 anos de experiência",
    email: "carlos@lavable.com",
    phone: "(11) 99999-0001",
    services: ["Lavagem Completa", "Polimento", "Cristalização"],
    active: true,
    rating: 4.9,
    appointmentsCount: 156,
    workingDays: ["Seg", "Ter", "Qua", "Qui", "Sex"],
  },
  {
    id: "2",
    name: "Pedro Henrique",
    nickname: "Pedro",
    bio: "Expert em higienização interna e detalhamento",
    email: "pedro@lavable.com",
    phone: "(11) 99999-0002",
    services: ["Higienização Interna", "Lavagem Completa", "Limpeza de Motor"],
    active: true,
    rating: 4.8,
    appointmentsCount: 142,
    workingDays: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  },
  {
    id: "3",
    name: "Lucas Mendes",
    bio: "Profissional certificado em técnicas de lavagem premium",
    email: "lucas@lavable.com",
    phone: "(11) 99999-0003",
    services: ["Lavagem Simples", "Lavagem Completa", "Lavagem + Cera"],
    active: true,
    rating: 4.7,
    appointmentsCount: 98,
    workingDays: ["Ter", "Qua", "Qui", "Sex", "Sáb"],
  },
  {
    id: "4",
    name: "Rafael Santos",
    bio: "Novo membro da equipe, em treinamento",
    email: "rafael@lavable.com",
    phone: "(11) 99999-0004",
    services: ["Lavagem Simples"],
    active: false,
    rating: 0,
    appointmentsCount: 12,
    workingDays: ["Seg", "Qua", "Sex"],
  },
];

const availableServices = [
  "Lavagem Simples",
  "Lavagem Completa", 
  "Polimento",
  "Higienização Interna",
  "Cristalização",
  "Lavagem + Cera",
  "Limpeza de Motor",
];

export default function Equipe() {
  const [searchTerm, setSearchTerm] = useState("");
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  const filteredStaff = staff.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.services.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateStaff = () => {
    setSelectedStaff(null);
    setDialogOpen(true);
  };

  const handleEditStaff = (member: Staff) => {
    setSelectedStaff(member);
    setDialogOpen(true);
  };

  const handleDeleteClick = (member: Staff) => {
    setStaffToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (staffToDelete) {
      setStaff((prev) => prev.filter((s) => s.id !== staffToDelete.id));
      setStaffToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleSaveStaff = (staffData: Omit<Staff, "id" | "rating" | "appointmentsCount"> & { id?: string }) => {
    if (staffData.id) {
      // Edit existing
      setStaff((prev) =>
        prev.map((s) => (s.id === staffData.id ? { ...s, ...staffData } : s))
      );
    } else {
      // Create new
      const newStaff: Staff = {
        ...staffData,
        id: Date.now().toString(),
        rating: 0,
        appointmentsCount: 0,
      };
      setStaff((prev) => [...prev, newStaff]);
    }
  };

  const handleToggleActive = (staffId: string) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, active: !s.active } : s))
    );
  };

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Equipe</h1>
          <p className="page-description">Gerencie os profissionais da equipe</p>
        </div>
        <Button className="btn-gradient" onClick={handleCreateStaff}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Profissional
        </Button>
      </div>

      {/* Search */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou serviço..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className={cn(
              "bg-card rounded-xl border border-border shadow-sm p-5 card-hover",
              !member.active && "opacity-60"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0">
                {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {member.nickname || member.name}
                    </h3>
                    {member.nickname && (
                      <p className="text-sm text-muted-foreground">{member.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch 
                      checked={member.active} 
                      onCheckedChange={() => handleToggleActive(member.id)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditStaff(member)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(member)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {member.bio}
                </p>

                {/* Contact */}
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {member.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {member.phone}
                  </span>
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {member.services.map((service) => (
                    <Badge key={service} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                  {member.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="font-medium text-foreground">{member.rating}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{member.appointmentsCount} atendimentos</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.workingDays.join(", ")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Staff Dialog */}
      <StaffDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        staff={selectedStaff}
        onSave={handleSaveStaff}
        availableServices={availableServices}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir profissional</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{staffToDelete?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
