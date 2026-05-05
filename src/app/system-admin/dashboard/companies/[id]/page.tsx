import { CompanyDetailPage } from "./company-detail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CompanyDetailPage id={id} />;
}
