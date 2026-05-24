import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppointmentsList from "./_components/AppointmentsList";
import { decodeJWTToken, isBackendTokenExpired } from "@/utils/decode-jwt";

interface Appointment {
  id: string;
  company_id: string;
  company_name: string;
  company_slug: string;
  branch_id: string;
  branch_name: string;
  service_id: string;
  service_name: string;
  service_price: number;
  employee_id: string;
  employee_name: string;
  employee_surname: string;
  start_time: string;
  end_time: string;
  time_zone: string;
  is_cancelled: boolean;
  is_fulfilled: boolean;
  is_cancelled_by_client: boolean;
  is_approved_by_employee: boolean;
}

interface AppointmentsResponse {
  appointments: Appointment[];
  total_count: number;
  page: number;
  page_size: number;
}

export default async function AgendamentosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("client-auth-token");

  if (!token) {
    redirect("/");
  }

  const userData = decodeJWTToken(token.value);
  if (!userData?.id) {
    redirect("/");
  }

  // Verificar se o token expirou
  if (isBackendTokenExpired(token.value)) {
    redirect("/");
  }

  const clientId = userData.id;

  let data: AppointmentsResponse = {
    appointments: [],
    total_count: 0,
    page: 1,
    page_size: 20,
  };

  try {
    // M7: fallback para evitar URL inválida quando BACKEND_URL não está definido
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const res = await fetch(
      `${backendUrl}/client/${clientId}/all-appointments`,
      {
        headers: {
          "X-Auth-Token": token.value,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (res.ok) {
      const json = await res.json();
      data = json.data ?? json;
    }
  } catch {
    // Render with empty state on error
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Meus Agendamentos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Todos os seus agendamentos em uma só tela
        </p>
      </div>
      <AppointmentsList
        initialAppointments={data.appointments}
        totalCount={data.total_count}
      />
    </div>
  );
}
