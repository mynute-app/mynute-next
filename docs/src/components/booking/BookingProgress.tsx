import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingProgressProps {
  currentStep: number;
  steps: string[];
}

export const BookingProgress = ({ currentStep, steps }: BookingProgressProps) => {
  return (
    <div className="w-full py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Progress line background */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
          
          {/* Progress line filled */}
          <div 
            className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div key={step} className="flex flex-col items-center relative z-10">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isCompleted && !isCurrent && "bg-card border-2 border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                <span className={cn(
                  "mt-2 text-xs font-medium text-center max-w-[60px] hidden sm:block",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Mobile: Show current step name */}
        <p className="text-center text-sm font-medium text-foreground mt-4 sm:hidden">
          {steps[currentStep - 1]}
        </p>
      </div>
    </div>
  );
};
