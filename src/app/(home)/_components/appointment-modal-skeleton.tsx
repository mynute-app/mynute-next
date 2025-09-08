"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AppointmentModalSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lista de horários disponíveis - Skeleton */}
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-6 w-48" />

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-64" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {Array.from({ length: 12 }).map((_, j) => (
                    <Skeleton key={j} className="h-8 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Resumo do agendamento - Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="text-center py-8">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
