import { Sidebar } from "@/components/admin/sidebar";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";

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
      {/* Sidebar fixa sem scroll */}
       <Sidebar /> 

      {/* Conteúdo principal com scroll interno */}
      <main className="h-screen overflow-y-auto">{children}</main>
    </div>
  );
}
