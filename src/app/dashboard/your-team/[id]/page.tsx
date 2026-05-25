import TeamMemberPage from "./team-member-page";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab } = await searchParams;
  return (
    <TeamMemberPage
      id={id}
      initialTab={
        (tab as "info" | "services" | "schedule" | "services-schedule") ??
        "info"
      }
    />
  );
}
