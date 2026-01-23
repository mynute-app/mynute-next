import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "./components/site-header";
import { AppSidebar } from "./components/app-sidebar";
import { DashboardTheme } from "./components/dashboard-theme";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/auth/login");
  }
  return (
    <DashboardTheme>
      <div className="dashboard-theme h-screen [--header-height:calc(theme(spacing.0))]">
        <SidebarProvider className="flex h-full flex-col">
          <div className="flex h-full flex-1">
            <AppSidebar />
            <SidebarInset className="flex h-full flex-col overflow-hidden">
              {children}
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </DashboardTheme>
  );
}
