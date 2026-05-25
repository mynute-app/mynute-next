import { SuporteDetalhe } from "./suporte-detalhe";

export default async function DashboardSuporteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SuporteDetalhe ticketId={id} />;
}
