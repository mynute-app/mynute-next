import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "./_components/LogoutButton";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("client-auth-token");

  if (!token) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-primary">Meus Agendamentos</span>
        <LogoutButton />
      </header>
      <main className="container mx-auto px-4 py-6 max-w-3xl">{children}</main>
    </div>
  );
}
