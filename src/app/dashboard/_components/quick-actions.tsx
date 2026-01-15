import Link from "next/link";
import { Building2, Calendar, Plus, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  {
    icon: Plus,
    label: "Novo agendamento",
    description: "Criar agendamento",
    href: "/dashboard/scheduling/view",
    primary: true,
  },
  {
    icon: Calendar,
    label: "Ver agenda",
    description: "Agenda completa",
    href: "/dashboard/scheduling/view",
  },
  {
    icon: Sparkles,
    label: "Servicos",
    description: "Gerenciar servicos",
    href: "/dashboard/services",
  },
  {
    icon: Users,
    label: "Equipe",
    description: "Profissionais",
    href: "/dashboard/your-team",
  },
  {
    icon: Building2,
    label: "Filiais",
    description: "Gerenciar filiais",
    href: "/dashboard/branch",
  },
  /*
  TODO: enable when routes exist.
  {
    icon: Users,
    label: "Novo cliente",
    description: "Cadastrar cliente",
    href: "/dashboard/clientes",
  },
  {
    icon: Share2,
    label: "Compartilhar",
    description: "Link de agendamento",
    href: "/",
  },
  */
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        Acoes rapidas
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {actions.map((action, index) => (
          <Button
            key={action.label}
            variant={action.primary ? "default" : "outline"}
            className={`h-auto flex-col gap-2 py-4 animate-in ${
              action.primary ? "btn-gradient border-0" : ""
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
            asChild
          >
            <Link href={action.href}>
              <action.icon className="h-5 w-5" />
              <div className="text-center">
                <p className="text-sm font-medium">{action.label}</p>
                <p
                  className={`text-xs ${
                    action.primary
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {action.description}
                </p>
              </div>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
