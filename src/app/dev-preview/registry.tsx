/**
 * Dev Preview Page Registry
 *
 * Maps page names (used in /dev-preview/[pageName] URLs) to their React components.
 * Each entry includes a human-readable title and optional route params for components
 * that require them (e.g., [branchId]).
 *
 * Add new pages here when they are created.
 */

import { lazy } from "react";

export interface RegistryEntry {
  /** Human-readable label shown in the index page */
  title: string;
  /** Category for grouping in the index */
  category: "auth" | "dashboard" | "config" | "branch" | "public";
  /** The React component to render */
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  /** Mock route params to inject (e.g., branchId for branch detail pages) */
  defaultParams?: Record<string, string>;
  /** Mock search params to pre-populate */
  defaultSearchParams?: Record<string, string>;
}

// Lazy load all page components to avoid import-time side effects
export const registry: Record<string, RegistryEntry> = {
  // ─── Dashboard ──────────────────────────────────────────────────────────────
  dashboard: {
    title: "Dashboard Principal",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/dashboard").then((m) => ({ default: m.default }))),
  },

  agendamentos: {
    title: "Agendamentos",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/agendamentos/page").then((m) => ({ default: m.default }))),
    defaultParams: { branchId: "branch-preview-001" },
  },

  services: {
    title: "Serviços",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/services/services").then((m) => ({ default: m.ServicesPage }))),
  },

  "your-team": {
    title: "Sua Equipe",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/your-team/your-team").then((m) => ({ default: m.default }))),
  },

  clientes: {
    title: "Clientes",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/clientes/clientes").then((m) => ({ default: m.ClientesPage }))),
  },

  "clientes-detail": {
    title: "Detalhe do Cliente",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/clientes/[id]/page").then((m) => ({ default: m.default }))),
    defaultParams: { id: "client-preview-001" },
  },

  fornecedores: {
    title: "Fornecedores",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/fornecedores/fornecedores").then((m) => ({ default: m.FornecedoresPage }))),
  },

  "fornecedores-detail": {
    title: "Detalhe do Fornecedor",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/fornecedores/[id]/page").then((m) => ({ default: m.default }))),
    defaultParams: { id: "supplier-preview-001" },
  },

  "scheduling-view": {
    title: "Agenda Visual",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/scheduling/view/_components/agenda-page").then((m) => ({ default: m.AgendaPage }))),
    defaultParams: { branchId: "branch-preview-001" },
  },

  // ─── Branch ─────────────────────────────────────────────────────────────────
  branch: {
    title: "Filiais",
    category: "branch",
    component: lazy(() => import("@/app/dashboard/branch/_components/branch").then((m) => ({ default: m.default }))),
  },

  "branch-equipe": {
    title: "Equipe da Filial",
    category: "branch",
    component: lazy(() => import("@/app/dashboard/branch/[branchId]/equipe/page").then((m) => ({ default: m.default }))),
    defaultParams: { branchId: "branch-preview-001" },
  },

  "branch-servicos": {
    title: "Serviços da Filial",
    category: "branch",
    component: lazy(() => import("@/app/dashboard/branch/[branchId]/servicos/page").then((m) => ({ default: m.default }))),
    defaultParams: { branchId: "branch-preview-001" },
  },

  // ─── Config ─────────────────────────────────────────────────────────────────
  "config-account": {
    title: "Configurações da Conta",
    category: "config",
    component: lazy(() => import("@/app/dashboard/config/account/_components/account-settings").then((m) => ({ default: m.default }))),
  },

  "config-your-brand": {
    title: "Sua Marca",
    category: "config",
    component: lazy(() => import("@/app/dashboard/config/your-brand/_components/your-brand").then((m) => ({ default: m.default }))),
  },

  "config-blocked-dates": {
    title: "Datas Bloqueadas",
    category: "config",
    component: lazy(() => import("@/app/dashboard/config/blocked-dates/_components/blocked-dates").then((m) => ({ default: m.default }))),
  },

  // ─── Financeiro ─────────────────────────────────────────────────────────────
  "financeiro-dashboard": {
    title: "Financeiro — Dashboard",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/financeiro/financeiro").then((m) => ({ default: m.FinanceiroDashboard }))),
  },

  "financeiro-contas-a-receber": {
    title: "Financeiro — Contas a Receber",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/financeiro/contas-a-receber/page").then((m) => ({ default: m.default }))),
  },

  "financeiro-contas-a-pagar": {
    title: "Financeiro — Contas a Pagar",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/financeiro/contas-a-pagar/page").then((m) => ({ default: m.default }))),
  },

  "financeiro-fluxo-de-caixa": {
    title: "Financeiro — Fluxo de Caixa",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/financeiro/fluxo-de-caixa/page").then((m) => ({ default: m.default }))),
  },

  "financeiro-orcamentos": {
    title: "Financeiro — Orçamentos",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/financeiro/orcamentos/page").then((m) => ({ default: m.default }))),
  },

  "financeiro-relatorios": {
    title: "Financeiro — Relatórios",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/financeiro/relatorios/page").then((m) => ({ default: m.default }))),
  },

  "financeiro-analytics": {
    title: "Financeiro — Analytics de Serviços",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/financeiro/analytics/page").then((m) => ({ default: m.default }))),
  },

  "financeiro-configuracoes": {
    title: "Financeiro — Configurações",
    category: "dashboard",
    component: lazy(() => import("@/app/dashboard/financeiro/configuracoes/page").then((m) => ({ default: m.default }))),
  },

  // ─── Cliente ────────────────────────────────────────────────────────────────
  "client-agendamentos": {
    title: "Cliente — Meus Agendamentos",
    category: "public",
    component: lazy(() => import("./previews/ClientAgendamentosPreview").then((m) => ({ default: m.default }))),
  },

  // ─── System Admin ────────────────────────────────────────────────────────────
  "system-admin-whatsapp": {
    title: "Admin — WhatsApp",
    category: "config",
    component: lazy(() => import("@/app/system-admin/dashboard/whatsapp/page").then((m) => ({ default: m.default }))),
  },
};

/** All categories for grouping display in the index page */
export const CATEGORIES: Record<RegistryEntry["category"], string> = {
  dashboard: "Dashboard",
  branch: "Filiais",
  config: "Configurações",
  auth: "Autenticação",
  public: "Público",
};

/** All available preview states */
export const PREVIEW_STATES = ["populated", "empty", "error"] as const;
export type PreviewState = (typeof PREVIEW_STATES)[number];

export const PREVIEW_STATE_LABELS: Record<PreviewState, string> = {
  populated: "Com dados",
  empty: "Sem dados (vazio)",
  error: "Estado de erro",
};
