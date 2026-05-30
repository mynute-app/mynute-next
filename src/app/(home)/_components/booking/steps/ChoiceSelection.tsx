"use client";

import { Button } from "@/components/ui/button";
import { MapPin, User, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { FirstChoice } from "../types";

interface ChoiceSelectionProps {
  onChoice: (choice: FirstChoice) => void;
  onBack: () => void;
  brandColor?: string;
}

export function ChoiceSelection({
  onChoice,
  onBack,
  brandColor,
}: ChoiceSelectionProps) {
  const options = [
    {
      choice: FirstChoice.BRANCH,
      icon: MapPin,
      title: "Escolher Local",
      description: "Selecione onde quer ser atendido",
    },
    {
      choice: FirstChoice.EMPLOYEE,
      icon: User,
      title: "Escolher Profissional",
      description: "Selecione o profissional que deseja",
    },
  ];

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
            Como deseja começar?
          </h1>
          <p className="text-sm text-muted-foreground">
            Escolha local ou profissional primeiro
          </p>
        </header>
      </div>

      {/* Cards de opção */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(({ choice, icon: Icon, title, description }) => (
          <button
            key={choice}
            type="button"
            onClick={() => onChoice(choice)}
            className={cn(
              "group flex items-center gap-4 p-5 rounded-xl",
              "bg-card border border-border text-left",
              "transition-all duration-200 ease-out hover:-translate-y-0.5",
              "shadow-[0_1px_3px_0_hsl(215_25%_15%/0.07)] hover:shadow-[0_6px_16px_-4px_hsl(215_25%_15%/0.12)]",
              "active:scale-[0.98]",
            )}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors"
              style={
                brandColor
                  ? { backgroundColor: `${brandColor}18`, color: brandColor }
                  : {
                      backgroundColor: "hsl(var(--muted))",
                      color: "hsl(var(--muted-foreground))",
                    }
              }
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

