import { Sidebar } from "@/components/admin/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid h-screen w-screen grid-cols-[500px,1fr] bg-background">
      {/* Sidebar fixa sem scroll */}
      <Sidebar />

      {/* Conteúdo principal com scroll interno */}
      <main className="h-screen overflow-y-auto">{children}</main>
    </div>
  );
}
