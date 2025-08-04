"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Calendar,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { useGetUser } from "@/hooks/get-useUser";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useGetUser();
  const data = {
    user: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      avatar: user?.avatar || "",
    },
    navMain: [
      {
        title: "Gestão",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Empresa",
            url: "/dashboard/your-brand",
          },
          {
            title: "Serviços",
            url: "/dashboard/services",
          },
          {
            title: "Funcionários",
            url: "/dashboard/your-team",
          },
          {
            title: "Filiais",
            url: "/dashboard/branch",
          },
        ],
      },
      {
        title: "Agendamentos",
        url: "#",
        icon: Calendar,
        isActive: false,
        items: [
          {
            title: "Novo Agendamento",
            url: "/dashboard/scheduling/new",
          },
          {
            title: "Visualizar Agendamentos",
            url: "/dashboard/scheduling/view",
          },
        ],
      },
      {
        title: "Configurações",
        url: "#",
        icon: Settings2,
        isActive: false,
        items: [
          {
            title: "Trocar Senha",
            url: "/dashboard/settings/change-password",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ],
    projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: Frame,
      },
      {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Travel",
        url: "#",
        icon: Map,
      },
    ],
  };
  return (
    <Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Agenda-kaki</span>
                  <span className="truncate text-xs">Empresa</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
