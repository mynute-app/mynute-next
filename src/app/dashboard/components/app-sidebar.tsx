"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calendar,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  Droplets,
  LayoutDashboard,
  Palette,
  Settings,
  Sparkles,
  UserCircle,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";

import { Sidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { NavUser } from "./nav-user";

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
};

type SubNavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
};

const navItemBase =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground";
const navItemActive =
  "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_0_20px_hsl(var(--sidebar-primary)_/_0.3)]";
const subNavItemBase =
  "flex items-center gap-3 rounded-lg px-3 py-2 pl-11 text-sm transition-all duration-200 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground";
const subNavItemActive = "bg-sidebar-accent text-sidebar-primary";

const NavItem = ({ href, icon, label, isActive = false }: NavItemProps) => (
  <Link href={href} className={cn(navItemBase, isActive && navItemActive)}>
    {icon}
    <span>{label}</span>
  </Link>
);

const SubNavItem = ({
  href,
  icon,
  label,
  isActive = false,
}: SubNavItemProps) => (
  <Link href={href} className={cn(subNavItemBase, isActive && subNavItemActive)}>
    {icon}
    <span>{label}</span>
  </Link>
);

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [isConfigOpen, setIsConfigOpen] = React.useState(true);

  const isConfigActive = pathname.startsWith("/dashboard/configuracoes");
  const isActive = (href: string, end = false) =>
    end ? pathname === href : pathname.startsWith(href);

  return (
    <Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 shadow-[0_0_20px_hsl(var(--sidebar-primary)_/_0.3)]">
            <Droplets className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">
              Mynute App
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              Sistema de Agendamento
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <div className="px-3 py-2">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              Principal
            </p>
            <div className="space-y-1">
              <NavItem
                href="/dashboard"
                icon={<LayoutDashboard className="h-5 w-5" />}
                label="Dashboard"
                isActive={isActive("/dashboard", true)}
              />
              <NavItem
                href="/dashboard/agenda"
                icon={<Calendar className="h-5 w-5" />}
                label="Agenda"
                isActive={isActive("/dashboard/agenda")}
              />
              <NavItem
                href="/dashboard/agendamentos"
                icon={<CalendarCheck className="h-5 w-5" />}
                label="Agendamentos"
                isActive={isActive("/dashboard/agendamentos")}
              />
            </div>
          </div>

          <div className="mt-4 px-3 py-2">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              Cadastros
            </p>
            <div className="space-y-1">
              <NavItem
                href="/dashboard/clientes"
                icon={<Users className="h-5 w-5" />}
                label="Clientes / Familias"
                isActive={isActive("/dashboard/clientes")}
              />
              <NavItem
                href="/dashboard/services"
                icon={<Sparkles className="h-5 w-5" />}
                label="Servicos"
                isActive={isActive("/dashboard/services")}
              />
              <NavItem
                href="/dashboard/your-team"
                icon={<UserCog className="h-5 w-5" />}
                label="Equipe"
                isActive={isActive("/dashboard/your-team")}
              />
            </div>
          </div>

          <div className="mt-4 px-3 py-2">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              Sistema
            </p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setIsConfigOpen(open => !open)}
                className={cn(
                  navItemBase,
                  "w-full justify-between",
                  isConfigActive && "bg-sidebar-accent text-sidebar-foreground"
                )}
              >
                <span className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <span>Configuracoes</span>
                </span>
                {isConfigOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  isConfigOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="space-y-1 py-1">
                  <SubNavItem
                    href="/dashboard/your-brand"
                    icon={<Palette className="h-4 w-4" />}
                    label="Branding e Midias"
                    isActive={isActive("/dashboard/your-brand", true)}
                  />
                  <SubNavItem
                    href="/dashboard/configuracoes/servicos"
                    icon={<Wrench className="h-4 w-4" />}
                    label="Servicos"
                    isActive={isActive(
                      "/dashboard/configuracoes/servicos",
                      true
                    )}
                  />
                  <SubNavItem
                    href="/dashboard/configuracoes/equipe"
                    icon={<UserCircle className="h-4 w-4" />}
                    label="Equipe"
                    isActive={isActive("/dashboard/configuracoes/equipe", true)}
                  />
                  <SubNavItem
                    href="/dashboard/configuracoes/agendamento"
                    icon={<BookOpen className="h-4 w-4" />}
                    label="Regras de Agendamento"
                    isActive={isActive(
                      "/dashboard/configuracoes/agendamento",
                      true
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <NavUser />
        </div>
      </div>
    </Sidebar>
  );
}
