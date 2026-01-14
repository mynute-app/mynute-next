import { Plus, Calendar, Users, Sparkles, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: "Novo Agendamento",
      description: "Agendar um serviço",
      primary: true,
    },
    {
      icon: Calendar,
      label: "Ver Agenda",
      description: "Calendário completo",
    },
    {
      icon: Users,
      label: "Novo Cliente",
      description: "Cadastrar cliente",
    },
    {
      icon: Sparkles,
      label: "Novo Serviço",
      description: "Adicionar serviço",
    },
    {
      icon: Share2,
      label: "Compartilhar",
      description: "Link de agendamento",
    },
  ];

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((action, index) => (
          <Button
            key={action.label}
            variant={action.primary ? "default" : "outline"}
            className={`h-auto py-4 flex flex-col items-center gap-2 animate-in ${
              action.primary ? "btn-gradient border-0" : ""
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <action.icon className="w-5 h-5" />
            <div className="text-center">
              <p className="text-sm font-medium">{action.label}</p>
              <p className={`text-xs ${action.primary ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {action.description}
              </p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
