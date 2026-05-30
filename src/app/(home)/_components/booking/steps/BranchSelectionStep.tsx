"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BranchInfo } from "../types";

interface BranchSelectionStepProps {
  branches: BranchInfo[];
  selectedDate: string;
  selectedTime: string;
  selectedEmployeeId?: string | null;
  onBranchSelect: (branchId: string) => void;
  onBack: () => void;
  brandColor?: string;
}

export function BranchSelectionStep({
  branches,
  selectedDate,
  selectedTime,
  selectedEmployeeId,
  onBranchSelect,
  onBack,
  brandColor,
}: BranchSelectionStepProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0 h-8 w-8 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <header>
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Escolha o local
          </h1>
          <p className="text-sm text-muted-foreground">
            {selectedEmployeeId
              ? "Locais onde o profissional atende"
              : "Selecione onde você gostaria de ser atendido"}
          </p>
        </header>
      </div>

      {/* Lista de locais */}
      <div className="space-y-2">
        {branches.map(branch => (
          <button
            key={branch.id}
            type="button"
            onClick={() => onBranchSelect(branch.id)}
            className={cn(
              "group w-full flex items-center gap-4 p-4 rounded-xl text-left",
              "bg-card border border-border",
              "transition-all duration-200 ease-out hover:-translate-y-0.5",
              "shadow-[0_1px_3px_0_hsl(215_25%_15%/0.07)] hover:shadow-[0_6px_16px_-4px_hsl(215_25%_15%/0.12)]",
              "active:scale-[0.98]",
            )}
          >
            {/* Ãcone / Imagem */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
              style={
                brandColor
                  ? { backgroundColor: `${brandColor}18` }
                  : { backgroundColor: "hsl(var(--muted))" }
              }
            >
              {branch.design?.images?.profile?.url ? (
                <img
                  src={branch.design.images.profile.url}
                  alt={branch.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <MapPin
                  className="w-5 h-5"
                  style={
                    brandColor
                      ? { color: brandColor }
                      : { color: "hsl(var(--muted-foreground))" }
                  }
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate">
                {branch.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {branch.street}, {branch.number} â€” {branch.neighborhood}
              </p>
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </button>
        ))}

        {branches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center rounded-xl border border-border bg-card">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <MapPin className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">
              Nenhum local disponível
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Não há locais disponíveis
              {selectedEmployeeId
                ? " para este profissional no horário selecionado"
                : ""}
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

