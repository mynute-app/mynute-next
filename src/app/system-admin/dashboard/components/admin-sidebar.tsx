"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Headphones,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Sidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { NavAdminUser } from "./nav-admin-user";

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
  <Link
    href={href}
    className={cn(subNavItemBase, isActive && subNavItemActive)}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [isConfigOpen, setIsConfigOpen] = React.useState(true);

  const isActive = (href: string, end = false) =>
    end ? pathname === href : pathname.startsWith(href);

  const isConfigActive = pathname.startsWith("/system-admin/dashboard/config");

  return (
    <Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 shadow-[0_0_20px_hsl(var(--sidebar-primary)_/_0.3)]">
            <ShieldCheck className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">
              Mynute
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              Painel Administrativo
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <div className="px-3 py-2">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              Visao Geral
            </p>
            <div className="space-y-1">
              <NavItem
                href="/system-admin/dashboard"
                icon={<LayoutDashboard className="h-5 w-5" />}
                label="Dashboard"
                isActive={isActive("/system-admin/dashboard", true)}
              />
            </div>
          </div>

          <div className="mt-4 px-3 py-2">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              Plataforma
            </p>
            <div className="space-y-1">
              <NavItem
                href="/system-admin/dashboard/companies"
                icon={<Building2 className="h-5 w-5" />}
                label="Empresas"
                isActive={isActive("/system-admin/dashboard/companies")}
              />
              <NavItem
                href="/system-admin/dashboard/users"
                icon={<Users className="h-5 w-5" />}
                label="Usuarios"
                isActive={isActive("/system-admin/dashboard/users")}
              />
              <NavItem
                href="/system-admin/dashboard/support"
                icon={<Headphones className="h-5 w-5" />}
                label="Suporte"
                isActive={isActive("/system-admin/dashboard/support")}
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
                  isConfigActive && "bg-sidebar-accent text-sidebar-foreground",
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
                  isConfigOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0",
                )}
              >
                <div className="space-y-1 py-1">
                  <SubNavItem
                    href="/system-admin/dashboard/config/account"
                    icon={<ShieldCheck className="h-4 w-4" />}
                    label="Minha Conta"
                    isActive={isActive(
                      "/system-admin/dashboard/config/account",
                      true,
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <NavAdminUser />
        </div>
      </div>
    </Sidebar>
  );
}
