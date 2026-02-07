"use client";

const SkeletonCard = () => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
    <div className="mb-4 flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-muted/70" />
        <div className="space-y-2">
          <div className="h-3 w-28 rounded-full bg-muted" />
          <div className="h-3 w-20 rounded-full bg-muted" />
        </div>
      </div>
      <div className="h-8 w-8 rounded-md bg-muted/60" />
    </div>

    <div className="mb-4 space-y-2">
      <div className="h-3 w-32 rounded-full bg-muted" />
      <div className="h-3 w-40 rounded-full bg-muted" />
      <div className="h-3 w-36 rounded-full bg-muted" />
    </div>

    <div className="border-t border-border pt-4">
      <div className="h-8 w-full rounded-md bg-muted/60" />
    </div>
  </div>
);

export function ClientsLoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
