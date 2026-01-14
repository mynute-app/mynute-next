import { useState } from "react";
import { Plus, Search, MapPin, Clock, Phone, Users, Sparkles, MoreHorizontal, Building2, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { BranchDialog, Branch } from "@/components/branches/BranchDialog";

// Mock data
const initialBranches: Branch[] = [
  {
    id: "1",
    name: "Unidade Centro",
    address: "Rua das Flores, 123 - Centro",
    city: "São Paulo",
    state: "SP",
    phone: "(11) 99999-1234",
    email: "centro@empresa.com",
    active: true,
    workingHours: {
      monday: { open: "08:00", close: "18:00", enabled: true },
      tuesday: { open: "08:00", close: "18:00", enabled: true },
      wednesday: { open: "08:00", close: "18:00", enabled: true },
      thursday: { open: "08:00", close: "18:00", enabled: true },
      friday: { open: "08:00", close: "18:00", enabled: true },
      saturday: { open: "09:00", close: "14:00", enabled: true },
      sunday: { open: "", close: "", enabled: false },
    },
    servicesCount: 8,
    staffCount: 5,
  },
  {
    id: "2",
    name: "Unidade Shopping",
    address: "Shopping Center, Loja 45 - Piso L2",
    city: "São Paulo",
    state: "SP",
    phone: "(11) 99999-5678",
    email: "shopping@empresa.com",
    active: true,
    workingHours: {
      monday: { open: "10:00", close: "22:00", enabled: true },
      tuesday: { open: "10:00", close: "22:00", enabled: true },
      wednesday: { open: "10:00", close: "22:00", enabled: true },
      thursday: { open: "10:00", close: "22:00", enabled: true },
      friday: { open: "10:00", close: "22:00", enabled: true },
      saturday: { open: "10:00", close: "22:00", enabled: true },
      sunday: { open: "14:00", close: "20:00", enabled: true },
    },
    servicesCount: 6,
    staffCount: 4,
  },
  {
    id: "3",
    name: "Unidade Zona Sul",
    address: "Av. Santo Amaro, 789",
    city: "São Paulo",
    state: "SP",
    phone: "(11) 99999-9012",
    email: "zonasul@empresa.com",
    active: false,
    workingHours: {
      monday: { open: "09:00", close: "19:00", enabled: true },
      tuesday: { open: "09:00", close: "19:00", enabled: true },
      wednesday: { open: "09:00", close: "19:00", enabled: true },
      thursday: { open: "09:00", close: "19:00", enabled: true },
      friday: { open: "09:00", close: "19:00", enabled: true },
      saturday: { open: "09:00", close: "15:00", enabled: true },
      sunday: { open: "", close: "", enabled: false },
    },
    servicesCount: 5,
    staffCount: 3,
  },
];

const Filiais = () => {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateBranch = () => {
    setSelectedBranch(undefined);
    setDialogOpen(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setDialogOpen(true);
  };

  const handleDeleteClick = (branch: Branch) => {
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (branchToDelete) {
      setBranches(branches.filter(b => b.id !== branchToDelete.id));
      setDeleteDialogOpen(false);
      setBranchToDelete(null);
    }
  };

  const handleSaveBranch = (branchData: Partial<Branch>) => {
    if (selectedBranch) {
      // Edit existing
      setBranches(branches.map(b =>
        b.id === selectedBranch.id ? { ...b, ...branchData } : b
      ));
    } else {
      // Create new
      const newBranch: Branch = {
        id: Date.now().toString(),
        name: branchData.name || "",
        address: branchData.address || "",
        city: branchData.city || "",
        state: branchData.state || "",
        phone: branchData.phone || "",
        email: branchData.email || "",
        active: branchData.active ?? true,
        workingHours: branchData.workingHours || {
          monday: { open: "09:00", close: "18:00", enabled: true },
          tuesday: { open: "09:00", close: "18:00", enabled: true },
          wednesday: { open: "09:00", close: "18:00", enabled: true },
          thursday: { open: "09:00", close: "18:00", enabled: true },
          friday: { open: "09:00", close: "18:00", enabled: true },
          saturday: { open: "09:00", close: "14:00", enabled: true },
          sunday: { open: "", close: "", enabled: false },
        },
        servicesCount: 0,
        staffCount: 0,
      };
      setBranches([...branches, newBranch]);
    }
    setDialogOpen(false);
  };

  const handleToggleActive = (branchId: string) => {
    setBranches(branches.map(b =>
      b.id === branchId ? { ...b, active: !b.active } : b
    ));
  };

  const getDayAbbrev = (day: string): string => {
    const abbrevs: Record<string, string> = {
      monday: "Seg",
      tuesday: "Ter",
      wednesday: "Qua",
      thursday: "Qui",
      friday: "Sex",
      saturday: "Sáb",
      sunday: "Dom",
    };
    return abbrevs[day] || day;
  };

  const getWorkingDaysSummary = (hours: Branch["workingHours"]): string => {
    const enabledDays = Object.entries(hours)
      .filter(([_, value]) => value.enabled)
      .map(([day]) => getDayAbbrev(day));
    
    if (enabledDays.length === 7) return "Todos os dias";
    if (enabledDays.length === 0) return "Fechado";
    return enabledDays.join(", ");
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Filiais</h1>
          <p className="text-muted-foreground">
            Gerencie suas unidades e locais de atendimento
          </p>
        </div>
        <Button onClick={handleCreateBranch} className="btn-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Nova Filial
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar filiais..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{branches.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{branches.filter(b => b.active).length}</p>
              <p className="text-sm text-muted-foreground">Ativas</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{branches.reduce((sum, b) => sum + b.staffCount, 0)}</p>
              <p className="text-sm text-muted-foreground">Profissionais</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{branches.reduce((sum, b) => sum + b.servicesCount, 0)}</p>
              <p className="text-sm text-muted-foreground">Serviços</p>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBranches.map((branch) => (
          <div
            key={branch.id}
            className="bg-card rounded-xl border p-5 card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{branch.name}</h3>
                  <Badge variant={branch.active ? "default" : "secondary"}>
                    {branch.active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditBranch(branch)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(branch)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{branch.address}, {branch.city} - {branch.state}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{branch.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{getWorkingDaysSummary(branch.workingHours)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{branch.staffCount} profissionais</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{branch.servicesCount} serviços</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Status</span>
              <Switch
                checked={branch.active}
                onCheckedChange={() => handleToggleActive(branch.id)}
              />
            </div>
          </div>
        ))}
      </div>

      {filteredBranches.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma filial encontrada</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Tente buscar com outros termos" : "Comece criando sua primeira filial"}
          </p>
          {!searchTerm && (
            <Button onClick={handleCreateBranch} className="btn-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Nova Filial
            </Button>
          )}
        </div>
      )}

      {/* Branch Dialog */}
      <BranchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        branch={selectedBranch}
        onSave={handleSaveBranch}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir filial?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a filial "{branchToDelete?.name}"?
              Esta ação não pode ser desfeita e todos os vínculos com profissionais
              e serviços serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Filiais;
