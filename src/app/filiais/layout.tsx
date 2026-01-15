import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/dashboard/components/app-sidebar";
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
    <div className="h-screen [--header-height:calc(theme(spacing.0))]">
      <SidebarProvider className="flex h-full flex-col">
        <div className="flex h-full flex-1">
          <AppSidebar />
          <SidebarInset className="flex h-full flex-col overflow-hidden">
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
