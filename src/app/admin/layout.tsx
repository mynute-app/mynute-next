import { Sidebar } from "@/components/admin/sidebar";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { SessionProvider } from "next-auth/react";
import InitializeBusinessData from "./settings/your-brand/InitializeBusinessData";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }
  return (
    <div className="grid h-screen w-screen grid-cols-[500px,1fr] bg-background">
      <SessionProvider>
        <InitializeBusinessData>
          <Sidebar />{" "}
          <main className="h-screen overflow-y-auto">{children}</main>
        </InitializeBusinessData>
      </SessionProvider>
    </div>
  );
}
