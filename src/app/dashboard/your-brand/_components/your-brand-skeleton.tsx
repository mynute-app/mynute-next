"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function YourBrandSkeleton() {
  return (
    <div className="branding-page flex min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
          <div className="space-y-8 pt-12 lg:pt-0">
            <div className="page-header space-y-2">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-80" />
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                </div>
              </div>

              <div className="flex justify-end">
                <Skeleton className="h-10 w-40 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
