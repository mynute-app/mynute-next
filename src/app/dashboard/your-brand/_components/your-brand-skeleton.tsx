import { Skeleton } from "@/components/ui/skeleton";

export default function YourBrandSkeleton() {
  return (
    <div className="flex h-[90vh] gap-4 p-4">
      {/* Sidebar Skeleton */}
      <div className="w-80 flex flex-col gap-4">
        {/* Header Card */}
        <div className="bg-white rounded-lg border-2 p-4 space-y-2">
          <Skeleton className="h-8 w-32" /> {/* Título */}
          <Skeleton className="h-4 w-48" /> {/* Nome da empresa */}
          <Skeleton className="h-3 w-24" /> {/* ID */}
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20 p-4 space-y-2">
          <Skeleton className="h-5 w-40" /> {/* Título */}
          <Skeleton className="h-3 w-full" /> {/* Linha 1 */}
          <Skeleton className="h-3 w-full" /> {/* Linha 2 */}
          <Skeleton className="h-3 w-3/4" /> {/* Linha 3 */}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 bg-white rounded-lg border-2 overflow-hidden">
        {/* Tabs Header */}
        <div className="border-b px-6 pt-4 pb-0">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24" /> {/* Tab 1 */}
            <Skeleton className="h-10 w-28" /> {/* Tab 2 */}
            <Skeleton className="h-10 w-32" /> {/* Tab 3 */}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6">
          {/* Section Header */}
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" /> {/* Título da seção */}
            <Skeleton className="h-4 w-96" /> {/* Descrição */}
          </div>

          {/* Content Cards */}
          <div className="space-y-6">
            {/* Card 1 */}
            <div className="border-2 rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" /> {/* Card title */}
                <Skeleton className="h-4 w-64" /> {/* Card description */}
              </div>
              <div className="space-y-3">
                <Skeleton className="h-32 w-full rounded-md" />{" "}
                {/* Content 1 */}
                <Skeleton className="h-32 w-full rounded-md" />{" "}
                {/* Content 2 */}
              </div>
            </div>

            {/* Card 2 */}
            <div className="border-2 rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" /> {/* Card title */}
                <Skeleton className="h-4 w-64" /> {/* Card description */}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-24 rounded-lg" /> {/* Item 1 */}
                <Skeleton className="h-24 rounded-lg" /> {/* Item 2 */}
                <Skeleton className="h-24 rounded-lg" /> {/* Item 3 */}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Skeleton className="h-10 w-40 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
