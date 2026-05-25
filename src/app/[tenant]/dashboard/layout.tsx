import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/dashboard/components/app-sidebar";
import { DashboardTheme } from "@/app/dashboard/components/dashboard-theme";
import { MobileSidebarToggle } from "@/app/dashboard/components/mobile-sidebar-toggle";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { isBackendTokenExpired } from "@/utils/decode-jwt";

export default async function TenantDashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}>) {
  const { tenant } = await params;
  const session = await auth();
  const accessToken = (session as any)?.accessToken as string | undefined;

  if (
    !session ||
    !session.user ||
    !accessToken ||
    isBackendTokenExpired(accessToken)
  ) {
    redirect(`/${tenant}/login`);
  }

  return (
    <DashboardTheme>
      <div className="dashboard-theme h-screen [--header-height:calc(theme(spacing.0))]">
        <SidebarProvider className="flex h-full flex-col">
          <div className="flex h-full flex-1">
            <AppSidebar />
            <SidebarInset className="flex h-full flex-col overflow-hidden">
              <MobileSidebarToggle />
              {children}
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </DashboardTheme>
  );
}
