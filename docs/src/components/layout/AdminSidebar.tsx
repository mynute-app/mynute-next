import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  CalendarCheck,
  Users,
  Sparkles,
  UserCog,
  Settings,
  Palette,
  Wrench,
  UserCircle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Droplets,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

const NavItem = ({ to, icon, label, end = false }: NavItemProps) => {
  const location = useLocation();
  const isActive = end ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      className={cn(
        "nav-item",
        isActive && "active"
      )}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

interface SubNavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const SubNavItem = ({ to, icon, label }: SubNavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 pl-11 rounded-lg text-sm transition-all duration-200",
        "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
        isActive && "text-sidebar-primary bg-sidebar-accent"
      )}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export function AdminSidebar() {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const isConfigActive = location.pathname.startsWith("/configuracoes");

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
          <Droplets className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-sidebar-foreground">Lavable</h1>
          <p className="text-xs text-sidebar-muted">Sistema de Agendamento</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <div className="sidebar-section">
          <p className="sidebar-section-title">Principal</p>
          <div className="space-y-1">
            <NavItem 
              to="/" 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              label="Dashboard" 
              end 
            />
            <NavItem 
              to="/agenda" 
              icon={<Calendar className="w-5 h-5" />} 
              label="Agenda" 
            />
            <NavItem 
              to="/agendamentos" 
              icon={<CalendarCheck className="w-5 h-5" />} 
              label="Agendamentos" 
            />
          </div>
        </div>

        <div className="sidebar-section mt-4">
          <p className="sidebar-section-title">Cadastros</p>
          <div className="space-y-1">
            <NavItem 
              to="/clientes" 
              icon={<Users className="w-5 h-5" />} 
              label="Clientes / Famílias" 
            />
            <NavItem 
              to="/servicos" 
              icon={<Sparkles className="w-5 h-5" />} 
              label="Serviços" 
            />
            <NavItem 
              to="/equipe" 
              icon={<UserCog className="w-5 h-5" />} 
              label="Equipe" 
            />
          </div>
        </div>

        <div className="sidebar-section mt-4">
          <p className="sidebar-section-title">Sistema</p>
          <div className="space-y-1">
            {/* Config Dropdown */}
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className={cn(
                "w-full nav-item justify-between",
                isConfigActive && "bg-sidebar-accent text-sidebar-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <span>Configurações</span>
              </div>
              {isConfigOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {/* Config Subitems */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                isConfigOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="py-1 space-y-1">
                <SubNavItem
                  to="/configuracoes/branding"
                  icon={<Palette className="w-4 h-4" />}
                  label="Branding & Mídias"
                />
                <SubNavItem
                  to="/configuracoes/servicos"
                  icon={<Wrench className="w-4 h-4" />}
                  label="Serviços"
                />
                <SubNavItem
                  to="/configuracoes/equipe"
                  icon={<UserCircle className="w-4 h-4" />}
                  label="Equipe"
                />
                <SubNavItem
                  to="/configuracoes/agendamento"
                  icon={<BookOpen className="w-4 h-4" />}
                  label="Regras de Agendamento"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* User / Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-foreground">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">Admin</p>
            <p className="text-xs text-sidebar-muted truncate">admin@lavable.com</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
