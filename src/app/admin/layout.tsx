import { Sidebar } from "@/components/admin/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid h-screen grid-cols-[500px,1fr] bg-background">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
