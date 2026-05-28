import { auth } from "../../../../auth";
import { decodeJWTToken } from "@/utils/decode-jwt";
import { DashboardStatsSection } from "./components/dashboard-stats-section";

export default async function SystemAdminDashboardPage() {
  const session = await auth();
  const accessToken = (session as any)?.accessToken as string | undefined;
  const decoded = accessToken ? decodeJWTToken(accessToken) : null;
  const adminName = decoded?.name ?? "Admin";

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 overflow-auto">
      <div>
        <h1 className="text-2xl font-bold">Bem-vindo, {adminName}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Painel de controle global da plataforma Mynute.
        </p>
      </div>

      <DashboardStatsSection />

    </div>
  );
}
