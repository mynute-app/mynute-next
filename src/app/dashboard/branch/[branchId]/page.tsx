import BranchDetailPage from "./branch-detail-page";
import type { BranchDetailTab } from "./branch-detail-page";

type Props = {
  params: Promise<{ branchId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { branchId } = await params;
  const { tab } = await searchParams;

  const validTabs: BranchDetailTab[] = ["info", "schedule", "services", "team"];
  const initialTab = validTabs.includes(tab as BranchDetailTab)
    ? (tab as BranchDetailTab)
    : "info";

  return <BranchDetailPage branchId={branchId} initialTab={initialTab} />;
}
