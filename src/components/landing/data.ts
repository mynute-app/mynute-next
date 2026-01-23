import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Dumbbell,
  Heart,
  Home,
  Lock,
  Rocket,
  Scissors,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";

export type ProblemItem = {
  stat: string;
  label: string;
  description: string;
};

export type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type HowItWorksItem = {
  step: string;
  title: string;
  description: string;
  details: string[];
};

export type SegmentItem = {
  icon: LucideIcon;
  title: string;
  examples: string;
};

export type PlanItem = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted: boolean;
};

export type TestimonialItem = {
  name: string;
  role: string;
  content: string;
  rating: number;
};

export const problems: ProblemItem[] = [
  {
    stat: "30%",
    label: "Clientes abandonam agendamentos",
    description: "devido a processos complicados ou demorados",
  },
  {
    stat: "20-30%",
    label: "Perda de receita",
    description: "com faltas e má gestão de agenda",
  },
  {
    stat: "15h",
    label: "Desperdiçadas por semana",
    description: "com agendamento manual",
  },
];

export const features: FeatureItem[] = [
  {
    icon: Building2,
    title: "Arquitetura Multi-Filial",
    description:
      "Gerencie múltiplas filiais e unidades de negócio de forma centralizada.",
  },
  {
    icon: Users,
    title: "Gestão de Funcionários",
    description:
      "Organize a equipe, defina serviços por profissional e configure disponibilidades.",
  },
  {
    icon: Calendar,
    title: "Agendamento Inteligente",
    description:
      "Detecção automática de conflitos garante agenda otimizada e sem erros.",
  },
  {
    icon: Clock,
    title: "Disponibilidade em Tempo Real",
    description:
      "Clientes visualizam horários disponíveis atualizados a qualquer momento.",
  },
  {
    icon: Bell,
    title: "Lembretes Automáticos",
    description:
      "Reduza faltas em até 40% com notificações por WhatsApp e e-mail.",
  },
  {
    icon: Settings,
    title: "Escalas Personalizadas",
    description:
      "Horários flexíveis e específicos para cada funcionário e filial.",
  },
];

export const howItWorks: HowItWorksItem[] = [
  {
    step: "01",
    title: "Configuração",
    description: "Adicione suas filiais, funcionários e serviços em minutos.",
    details: [
      "Defina horários de funcionamento",
      "Configure disponibilidade de serviços",
      "Atribuição de equipe intuitiva",
    ],
  },
  {
    step: "02",
    title: "Agendamento",
    description: "Calendário inteligente com gerenciamento automático.",
    details: [
      "Previne conflitos automaticamente",
      "Interface amigável 24/7",
      "Confirmação instantânea",
    ],
  },
  {
    step: "03",
    title: "Crescimento",
    description: "Acesse painéis de analytics e insights detalhados.",
    details: [
      "Otimize operações",
      "Identifique tendências",
      "Decisões estratégicas",
    ],
  },
];

export const segments: SegmentItem[] = [
  {
    icon: Scissors,
    title: "Beleza & Bem-estar",
    examples: "Salões, clínicas de estética, spas, barbearias",
  },
  {
    icon: Heart,
    title: "Saúde",
    examples: "Clínicas médicas, odontológicas, terapeutas, fisioterapia",
  },
  {
    icon: Dumbbell,
    title: "Fitness",
    examples: "Academias, estúdios de yoga, pilates, personal trainers",
  },
  {
    icon: Briefcase,
    title: "Serviços Profissionais",
    examples: "Consultores, advogados, coaches, contadores",
  },
  {
    icon: Home,
    title: "Serviços Residenciais",
    examples: "Limpeza, reparos, manutenção, pet sitters",
  },
];

export const plans: PlanItem[] = [
  {
    name: "M1 - Starter",
    price: "Grátis",
    description: "Perfeito para começar",
    features: [
      "Até 2 filiais",
      "Até 10 funcionários",
      "Configurações básicas",
      "Página de agendamento",
    ],
    highlighted: false,
  },
  {
    name: "M2 - Básico",
    price: "R$ 49",
    period: "/mês",
    description: "Para pequenos negócios",
    features: [
      "Até 2 filiais",
      "Até 20 funcionários",
      "Lembretes por e-mail",
      "Suporte por chat",
    ],
    highlighted: false,
  },
  {
    name: "M3 - Profissional",
    price: "R$ 99",
    period: "/mês",
    description: "Para negócios em crescimento",
    features: [
      "Até 3 filiais",
      "Até 30 funcionários",
      "Lembretes WhatsApp",
      "Relatórios básicos",
      "Suporte prioritário",
    ],
    highlighted: true,
  },
  {
    name: "M4 - Business",
    price: "R$ 199",
    period: "/mês",
    description: "Para operações maiores",
    features: [
      "Até 3 filiais",
      "Até 60 funcionários",
      "Relatórios avançados",
      "Integrações premium",
      "Gerente de sucesso",
    ],
    highlighted: false,
  },
];

export const testimonials: TestimonialItem[] = [
  {
    name: "Marina Costa",
    role: "Dona de Salão de Beleza",
    content:
      "Reduzi 80% das faltas e aumentei meu faturamento em 40% no primeiro mês!",
    rating: 5,
  },
  {
    name: "Dr. Carlos Mendes",
    role: "Dentista",
    content:
      "Meus pacientes adoram a facilidade de agendar online. Recomendo demais!",
    rating: 5,
  },
  {
    name: "Fernanda Lima",
    role: "Personal Trainer",
    content:
      "Agora consigo gerenciar todos os meus alunos sem confusão de horários.",
    rating: 5,
  },
];

export const advancedFeatures: FeatureItem[] = [
  {
    icon: TrendingUp,
    title: "Alta Performance",
    description:
      "Velocidade e escalabilidade excepcionais, lidando com milhares de agendamentos.",
  },
  {
    icon: Lock,
    title: "Segurança",
    description: "Isolamento multi-tenant e criptografia avançada.",
  },
  {
    icon: Rocket,
    title: "API de Integração",
    description: "Conecte com suas ferramentas existentes facilmente.",
  },
  {
    icon: BarChart3,
    title: "Analytics em Tempo Real",
    description: "Insights sobre receita e performance de cada filial.",
  },
];
