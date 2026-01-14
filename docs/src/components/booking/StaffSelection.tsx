import { Check, Star, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Staff {
  id: string;
  name: string;
  role: string;
  image?: string;
  rating?: number;
}

interface StaffSelectionProps {
  staff: Staff[];
  selectedStaffId: string | null;
  onSelect: (staffId: string | null) => void;
  allowSkip?: boolean;
}

export const StaffSelection = ({ 
  staff, 
  selectedStaffId, 
  onSelect, 
  allowSkip = true 
}: StaffSelectionProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Escolha o profissional</h2>
        <p className="text-sm text-muted-foreground mt-1">Selecione quem irá atendê-lo</p>
      </div>

      <div className="grid gap-3">
        {/* Skip option */}
        {allowSkip && (
          <button
            onClick={() => onSelect("any")}
            className={cn(
              "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
              "hover:border-primary/50 hover:bg-primary/5",
              selectedStaffId === "any"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-card"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Shuffle className="w-6 h-6 text-muted-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-medium text-foreground">Sem preferência</h4>
                  {selectedStaffId === "any" && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Primeiro profissional disponível
                </p>
              </div>
            </div>
          </button>
        )}

        {/* Staff list */}
        {staff.map((member) => {
          const isSelected = selectedStaffId === member.id;
          
          return (
            <button
              key={member.id}
              onClick={() => onSelect(member.id)}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                "hover:border-primary/50 hover:bg-primary/5",
                isSelected 
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                  : "border-border bg-card"
              )}
            >
              <div className="flex items-center gap-4">
                {member.image ? (
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-lg">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium text-foreground">{member.name}</h4>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{member.role}</p>
                  
                  {member.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                      <span className="text-xs font-medium text-foreground">{member.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
