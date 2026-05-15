import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./components/admin-sidebar";
import { MobileSidebarToggle } from "@/app/dashboard/components/mobile-sidebar-toggle";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { isBackendTokenExpired, decodeJWTToken } from "@/utils/decode-jwt";

export default async function SystemAdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const accessToken = (session as any)?.accessToken as string | undefined;

  if (!session || !session.user || !accessToken || isBackendTokenExpired(accessToken)) {
    redirect("/auth/system-admin");
  }

  const decoded = decodeJWTToken(accessToken);
  if (decoded?.type !== "system_admin") {
    redirect("/auth/system-admin");
  }

  return (
    <div className="h-screen [--header-height:calc(theme(spacing.0))]">
      <SidebarProvider className="flex h-full flex-col">
        <div className="flex h-full flex-1">
          <AdminSidebar />
          <SidebarInset className="flex h-full flex-col overflow-hidden">
            <MobileSidebarToggle />
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
