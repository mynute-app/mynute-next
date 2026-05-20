import { SuporteDetalhe } from "@/app/dashboard/suporte/[id]/suporte-detalhe";

export default async function TenantSuporteDetalhePage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const { id } = await params;
  return <SuporteDetalhe ticketId={id} />;
}
