import { CalendarCheck, Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentAppointments } from "@/components/dashboard/RecentAppointments";
import { QuickActions } from "@/components/dashboard/QuickActions";

export default function Dashboard() {
  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Bem-vindo de volta! Aqui está um resumo do seu negócio.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          title="Agendamentos Hoje"
          value={12}
          subtitle="4 confirmados, 8 pendentes"
          icon={CalendarCheck}
          variant="primary"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Clientes Ativos"
          value={248}
          subtitle="32 novos este mês"
          icon={Users}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Faturamento Mensal"
          value="R$ 15.840"
          subtitle="Meta: R$ 20.000"
          icon={DollarSign}
          variant="accent"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Taxa de Ocupação"
          value="78%"
          subtitle="Média semanal"
          icon={TrendingUp}
          variant="warning"
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentAppointments />
        </div>

        {/* Upcoming Summary */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Próximos Horários</h3>
          <div className="space-y-4">
            {[
              { time: "16:00", slots: 2, available: true },
              { time: "16:30", slots: 1, available: true },
              { time: "17:00", slots: 0, available: false },
              { time: "17:30", slots: 3, available: true },
              { time: "18:00", slots: 2, available: true },
            ].map((slot, index) => (
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
              <span className="font-medium text-foreground">8 vagas</span> disponíveis hoje
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
