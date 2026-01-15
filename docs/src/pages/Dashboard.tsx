import { useState } from "react";
import { CalendarCheck, Users, DollarSign, TrendingUp, Clock, Building2, ChevronDown } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentAppointments } from "@/components/dashboard/RecentAppointments";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Mock branches data
const branches = [
  { id: "all", name: "Todas as Filiais", active: true },
  { id: "1", name: "Unidade Centro", active: true },
  { id: "2", name: "Unidade Shopping", active: true },
  { id: "3", name: "Unidade Zona Sul", active: false },
];

// Mock stats per branch
const statsByBranch: Record<string, {
  appointments: { value: number; confirmed: number; pending: number; trend: number };
  clients: { value: number; newThisMonth: number; trend: number };
  revenue: { value: string; goal: string; trend: number };
  occupancy: { value: string; trend: number };
}> = {
  all: {
    appointments: { value: 12, confirmed: 4, pending: 8, trend: 15 },
    clients: { value: 248, newThisMonth: 32, trend: 8 },
    revenue: { value: "R$ 15.840", goal: "R$ 20.000", trend: 12 },
    occupancy: { value: "78%", trend: 5 },
  },
  "1": {
    appointments: { value: 5, confirmed: 2, pending: 3, trend: 10 },
    clients: { value: 120, newThisMonth: 15, trend: 12 },
    revenue: { value: "R$ 7.200", goal: "R$ 8.000", trend: 8 },
    occupancy: { value: "82%", trend: 3 },
  },
  "2": {
    appointments: { value: 4, confirmed: 1, pending: 3, trend: 20 },
    clients: { value: 85, newThisMonth: 12, trend: 15 },
    revenue: { value: "R$ 5.640", goal: "R$ 7.000", trend: 18 },
    occupancy: { value: "75%", trend: 8 },
  },
  "3": {
    appointments: { value: 3, confirmed: 1, pending: 2, trend: 5 },
    clients: { value: 43, newThisMonth: 5, trend: -2 },
    revenue: { value: "R$ 3.000", goal: "R$ 5.000", trend: -5 },
    occupancy: { value: "65%", trend: -3 },
  },
};

const slotsByBranch: Record<string, Array<{ time: string; slots: number; available: boolean }>> = {
  all: [
    { time: "16:00", slots: 5, available: true },
    { time: "16:30", slots: 3, available: true },
    { time: "17:00", slots: 0, available: false },
    { time: "17:30", slots: 6, available: true },
    { time: "18:00", slots: 4, available: true },
  ],
  "1": [
    { time: "16:00", slots: 2, available: true },
    { time: "16:30", slots: 1, available: true },
    { time: "17:00", slots: 0, available: false },
    { time: "17:30", slots: 2, available: true },
    { time: "18:00", slots: 1, available: true },
  ],
  "2": [
    { time: "16:00", slots: 2, available: true },
    { time: "16:30", slots: 1, available: true },
    { time: "17:00", slots: 0, available: false },
    { time: "17:30", slots: 3, available: true },
    { time: "18:00", slots: 2, available: true },
  ],
  "3": [
    { time: "16:00", slots: 1, available: true },
    { time: "16:30", slots: 1, available: true },
    { time: "17:00", slots: 0, available: false },
    { time: "17:30", slots: 1, available: true },
    { time: "18:00", slots: 1, available: true },
  ],
};

export default function Dashboard() {
  const [selectedBranch, setSelectedBranch] = useState("all");
  
  const activeBranches = branches.filter(b => b.id !== "all");
  const hasMultipleBranches = activeBranches.length > 1;
  const currentBranch = branches.find(b => b.id === selectedBranch);
  const stats = statsByBranch[selectedBranch] || statsByBranch.all;
  const slots = slotsByBranch[selectedBranch] || slotsByBranch.all;
  const totalAvailableSlots = slots.filter(s => s.available).reduce((acc, s) => acc + s.slots, 0);

  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            Bem-vindo de volta! Aqui está um resumo do seu negócio.
          </p>
        </div>

        {/* Branch Selector - Only show if multiple branches */}
        {hasMultipleBranches && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[200px] justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="truncate">{currentBranch?.name}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px]">
              <DropdownMenuItem 
                onClick={() => setSelectedBranch("all")}
                className={selectedBranch === "all" ? "bg-accent" : ""}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Todas as Filiais
                {selectedBranch === "all" && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {activeBranches.map(branch => (
                <DropdownMenuItem 
                  key={branch.id}
                  onClick={() => setSelectedBranch(branch.id)}
                  className={selectedBranch === branch.id ? "bg-accent" : ""}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  <span className="flex-1">{branch.name}</span>
                  {!branch.active && (
                    <Badge variant="secondary" className="text-xs ml-2">Inativa</Badge>
                  )}
                  {selectedBranch === branch.id && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Active Branch Badge */}
      {hasMultipleBranches && selectedBranch !== "all" && (
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="gap-1.5 py-1">
            <Building2 className="w-3.5 h-3.5" />
            Exibindo dados de: <span className="font-semibold">{currentBranch?.name}</span>
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground h-7"
            onClick={() => setSelectedBranch("all")}
          >
            Ver todas
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          title="Agendamentos Hoje"
          value={stats.appointments.value}
          subtitle={`${stats.appointments.confirmed} confirmados, ${stats.appointments.pending} pendentes`}
          icon={CalendarCheck}
          variant="primary"
          trend={{ value: stats.appointments.trend, isPositive: stats.appointments.trend > 0 }}
        />
        <StatCard
          title="Clientes Ativos"
          value={stats.clients.value}
          subtitle={`${stats.clients.newThisMonth} novos este mês`}
          icon={Users}
          variant="success"
          trend={{ value: Math.abs(stats.clients.trend), isPositive: stats.clients.trend > 0 }}
        />
        <StatCard
          title="Faturamento Mensal"
          value={stats.revenue.value}
          subtitle={`Meta: ${stats.revenue.goal}`}
          icon={DollarSign}
          variant="accent"
          trend={{ value: Math.abs(stats.revenue.trend), isPositive: stats.revenue.trend > 0 }}
        />
        <StatCard
          title="Taxa de Ocupação"
          value={stats.occupancy.value}
          subtitle="Média semanal"
          icon={TrendingUp}
          variant="warning"
          trend={{ value: Math.abs(stats.occupancy.trend), isPositive: stats.occupancy.trend > 0 }}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentAppointments selectedBranch={selectedBranch} />
        </div>

        {/* Upcoming Summary */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Próximos Horários</h3>
          <div className="space-y-4">
            {slots.map((slot, index) => (
              <div
                key={slot.time}
                className="flex items-center justify-between py-2 animate-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{slot.time}</span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    slot.available ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  {slot.available ? `${slot.slots} vagas` : "Lotado"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{totalAvailableSlots} vagas</span> disponíveis hoje
              {selectedBranch !== "all" && hasMultipleBranches && (
                <span className="text-xs"> nesta filial</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Branch Overview Cards - Only when viewing all */}
      {hasMultipleBranches && selectedBranch === "all" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Resumo por Filial</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBranches.map((branch, index) => {
              const branchStats = statsByBranch[branch.id];
              if (!branchStats) return null;
              
              return (
                <div
                  key={branch.id}
                  className="bg-card rounded-xl border p-5 card-hover cursor-pointer animate-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedBranch(branch.id)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{branch.name}</h4>
                      <Badge variant={branch.active ? "default" : "secondary"} className="text-xs">
                        {branch.active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{branchStats.appointments.value}</p>
                      <p className="text-xs text-muted-foreground">Agendamentos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{branchStats.occupancy.value}</p>
                      <p className="text-xs text-muted-foreground">Ocupação</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-lg font-semibold text-success">{branchStats.revenue.value}</p>
                      <p className="text-xs text-muted-foreground">Faturamento mensal</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
