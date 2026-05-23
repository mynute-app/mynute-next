import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { DashboardTheme } from "./components/dashboard-theme";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import { MobileSidebarToggle } from "./components/mobile-sidebar-toggle";
import { isBackendTokenExpired } from "@/utils/decode-jwt";
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const accessToken = (session as any)?.accessToken as string | undefined;
  if (
    !session ||
    !session.user ||
    !accessToken ||
    isBackendTokenExpired(accessToken)
  ) {
    redirect("/auth/employee");
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
