import { redirect } from "next/navigation";

// Funcionalidade em desenvolvimento — desabilitada temporariamente para
// evitar chamadas excessivas à API. Remover este redirect quando estiver pronta.
export default function BlockedDatesPage() {
  redirect("/dashboard");
}
