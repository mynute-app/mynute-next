import { Sidebar } from "@/components/admin/sidebar";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { SessionProvider } from "next-auth/react";

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
    <div className="">
      {/* Sidebar fixa sem scroll */}
      {/* Conteúdo principal com scroll interno */}
      <SessionProvider>
        {" "}
        <main className="h-screen overflow-y-auto">{children}</main>
      </SessionProvider>
    </div>
  );
}
