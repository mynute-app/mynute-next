import { useState } from "react";
import { Search, Plus, MoreHorizontal, Users, User, Car, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Family {
  id: string;
  name: string;
  members: number;
  vehicles: number;
  appointments: number;
  lastVisit: string;
  phone: string;
  email: string;
  address?: string;
  tags: string[];
}

const mockFamilies: Family[] = [
  { id: "1", name: "Família Silva", members: 3, vehicles: 2, appointments: 15, lastVisit: "10/01/2026", phone: "(11) 99999-1234", email: "silva@email.com", address: "Av. Paulista, 1000", tags: ["VIP", "Recorrente"] },
  { id: "2", name: "Família Santos", members: 2, vehicles: 3, appointments: 8, lastVisit: "08/01/2026", phone: "(11) 98888-5678", email: "santos@email.com", tags: ["Novo"] },
  { id: "3", name: "Família Oliveira", members: 4, vehicles: 4, appointments: 32, lastVisit: "12/01/2026", phone: "(11) 97777-9012", email: "oliveira@email.com", address: "Rua Oscar Freire, 500", tags: ["VIP", "Empresa"] },
  { id: "4", name: "Família Costa", members: 2, vehicles: 1, appointments: 5, lastVisit: "05/01/2026", phone: "(11) 96666-3456", email: "costa@email.com", tags: ["Recorrente"] },
  { id: "5", name: "Família Lima", members: 1, vehicles: 2, appointments: 12, lastVisit: "11/01/2026", phone: "(11) 95555-7890", email: "lima@email.com", tags: ["Premium"] },
];

const tagColors: Record<string, string> = {
  VIP: "bg-accent/10 text-accent border-accent/20",
  Recorrente: "bg-primary/10 text-primary border-primary/20",
  Novo: "bg-success/10 text-success border-success/20",
  Empresa: "bg-warning/10 text-warning border-warning/20",
  Premium: "bg-accent/10 text-accent border-accent/20",
};

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFamilies = mockFamilies.filter(
    (family) =>
      family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Clientes / Famílias</h1>
          <p className="page-description">Gerencie seus clientes e grupos familiares</p>
        </div>
        <Button className="btn-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {filteredFamilies.map((family) => (
          <div
            key={family.id}
            className="bg-card rounded-xl border border-border shadow-sm p-5 card-hover cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{family.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {family.members} membro{family.members !== 1 && "s"} • {family.vehicles} veículo{family.vehicles !== 1 && "s"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{family.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{family.email}</span>
              </div>
              {family.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{family.address}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {family.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={cn("text-xs", tagColors[tag] || "bg-muted text-muted-foreground")}
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {family.appointments} agendamentos
              </span>
              <span className="text-muted-foreground">
                Última visita: {family.lastVisit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
