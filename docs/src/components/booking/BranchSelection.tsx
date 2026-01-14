import { MapPin, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  workingHoursSummary: string;
}

interface BranchSelectionProps {
  branches: Branch[];
  selectedBranchId: string | null;
  onSelect: (branchId: string) => void;
}

export function BranchSelection({ branches, selectedBranchId, onSelect }: BranchSelectionProps) {
  return (
    <div className="py-6">
      <h2 className="text-xl font-semibold mb-2">Escolha a unidade</h2>
      <p className="text-muted-foreground mb-6">
        Selecione a filial mais conveniente para você
      </p>

      <div className="space-y-3">
        {branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => onSelect(branch.id)}
            className={cn(
              "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
              "hover:border-primary/50 hover:shadow-md",
              selectedBranchId === branch.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border bg-card"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{branch.name}</h3>
                
                <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{branch.address}, {branch.city} - {branch.state}</span>
                </div>
                
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{branch.workingHoursSummary}</span>
                </div>
              </div>
              
              <ChevronRight className={cn(
                "w-5 h-5 mt-1 transition-transform",
                selectedBranchId === branch.id ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
