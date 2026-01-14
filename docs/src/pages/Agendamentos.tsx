import { useState } from "react";
import { Search, Filter, Plus, MoreHorizontal, Calendar, Clock, User, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  client: string;
  service: string;
  vehicle: string;
  date: string;
  time: string;
  professional: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  price: number;
}

const mockAppointments: Appointment[] = [
  { id: "1", client: "João Silva", service: "Lavagem Completa", vehicle: "Honda Civic - ABC-1234", date: "13/01/2026", time: "09:00", professional: "Carlos", status: "confirmed", price: 80 },
  { id: "2", client: "Maria Santos", service: "Polimento", vehicle: "Toyota Corolla - DEF-5678", date: "13/01/2026", time: "10:30", professional: "Pedro", status: "pending", price: 250 },
  { id: "3", client: "Pedro Oliveira", service: "Higienização Interna", vehicle: "VW Golf - GHI-9012", date: "13/01/2026", time: "14:00", professional: "Lucas", status: "completed", price: 150 },
  { id: "4", client: "Ana Costa", service: "Lavagem Simples", vehicle: "Fiat Argo - JKL-3456", date: "13/01/2026", time: "15:30", professional: "Carlos", status: "confirmed", price: 45 },
  { id: "5", client: "Bruno Lima", service: "Cristalização", vehicle: "BMW 320i - MNO-7890", date: "14/01/2026", time: "08:00", professional: "Pedro", status: "pending", price: 400 },
  { id: "6", client: "Carla Mendes", service: "Lavagem + Cera", vehicle: "Mercedes C200 - PQR-1234", date: "14/01/2026", time: "11:00", professional: "Lucas", status: "confirmed", price: 120 },
];

const statusConfig = {
  confirmed: { label: "Confirmado", className: "bg-success/10 text-success border-success/20" },
  pending: { label: "Pendente", className: "bg-warning/10 text-warning border-warning/20" },
  completed: { label: "Concluído", className: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Cancelado", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function Agendamentos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "today" | "week">("all");

  const filteredAppointments = mockAppointments.filter(
    (apt) =>
      apt.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Agendamentos</h1>
          <p className="page-description">Gerencie todos os agendamentos</p>
        </div>
        <Button className="btn-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, serviço ou veículo..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              {(["all", "today", "week"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "ghost"}
                  size="sm"
                  className={cn(filter === f && "bg-background shadow-sm")}
                  onClick={() => setFilter(f)}
                >
                  {f === "all" ? "Todos" : f === "today" ? "Hoje" : "Semana"}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Cliente</TableHead>
              <TableHead className="font-semibold">Serviço</TableHead>
              <TableHead className="font-semibold">Veículo</TableHead>
              <TableHead className="font-semibold">Data/Hora</TableHead>
              <TableHead className="font-semibold">Profissional</TableHead>
              <TableHead className="font-semibold">Valor</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.map((appointment, index) => (
              <TableRow
                key={appointment.id}
                className="table-row-hover animate-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{appointment.client}</span>
                  </div>
                </TableCell>
                <TableCell>{appointment.service}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Car className="w-4 h-4" />
                    <span>{appointment.vehicle}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {appointment.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {appointment.time}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{appointment.professional}</TableCell>
                <TableCell className="font-medium">
                  R$ {appointment.price.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", statusConfig[appointment.status].className)}
                  >
                    {statusConfig[appointment.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
