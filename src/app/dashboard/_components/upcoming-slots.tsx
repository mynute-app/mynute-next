import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export type UpcomingSlot = {
  time: string;
  slots: number;
  available: boolean;
};

type UpcomingSlotsProps = {
  slots: UpcomingSlot[];
  showBranchHint?: boolean;
  isLoading?: boolean;
  emptyStateLabel?: string;
  emptyStateDescription?: string;
  contextLabel?: string;
};

export function UpcomingSlots({
  slots,
  showBranchHint = false,
  isLoading = false,
  emptyStateLabel,
  emptyStateDescription,
  contextLabel,
}: UpcomingSlotsProps) {
  const totalAvailableSlots = slots
    .filter(slot => slot.available)
    .reduce((total, slot) => total + slot.slots, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Proximos horarios
        </h3>
        {contextLabel && (
          <p className="mt-1 text-xs text-muted-foreground">{contextLabel}</p>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="py-6 text-center text-muted-foreground">
          <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p>{emptyStateLabel || "Nenhum horario disponivel hoje"}</p>
          {emptyStateDescription && (
            <p className="mt-1 text-sm text-muted-foreground">
              {emptyStateDescription}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {slots.map((slot, index) => (
              <div
                key={slot.time}
                className="flex items-center justify-between py-2 animate-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {slot.time}
                  </span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    slot.available ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  {slot.available ? `${slot.slots} vagas` : "Lotado"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {totalAvailableSlots} vagas
              </span>{" "}
              disponiveis hoje
              {showBranchHint && <span className="text-xs"> nesta filial</span>}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
