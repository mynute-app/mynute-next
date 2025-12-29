"use client";

/**
 * ChoiceSelection - Componente para escolher entre Local ou Profissional primeiro
 * Inspirado em plataformas como Doctoralia e BarberApp
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, User, ArrowLeft } from "lucide-react";
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
  return (
    <div className="flex flex-col h-full md:block md:space-y-6">
      {/* Header */}
      <div className="mb-4 md:mb-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-full shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <header className="min-w-0">
            <h1 className="text-base md:text-2xl font-bold tracking-tight">
              Como deseja começar?
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Escolha local ou profissional
            </p>
          </header>
        </div>
      </div>

      {/* Opções */}
      <div className="flex-1 flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-6 pb-6 md:pb-0">
        {/* Opção: Escolher Local primeiro */}
        <Card
          className="group flex-1 md:flex-none overflow-hidden border-2 md:border hover:border-primary/50 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.97] md:hover:scale-[1.02]"
          onClick={() => onChoice(FirstChoice.BRANCH)}
        >
          <CardContent className="p-0 h-full">
            {/* Mobile - Layout horizontal compacto */}
            <div className="flex md:hidden items-center gap-4 p-5 h-full">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 shrink-0"
                style={
                  brandColor
                    ? {
                        backgroundImage: `linear-gradient(to bottom right, ${brandColor}30, ${brandColor}10)`,
                      }
                    : undefined
                }
              >
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="text-base font-bold mb-1 group-hover:text-primary transition-colors">
                  Escolher Local
                </h3>
                <p className="text-xs text-muted-foreground">
                  Selecione onde quer ser atendido
                </p>
              </div>
            </div>

            {/* Desktop - Layout vertical original */}
            <div className="hidden md:flex flex-col items-center text-center p-8 space-y-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors"
                style={
                  brandColor
                    ? {
                        backgroundImage: `linear-gradient(to bottom right, ${brandColor}20, ${brandColor}10)`,
                      }
                    : undefined
                }
              >
                <MapPin className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  Escolher Local
                </h3>
                <p className="text-muted-foreground text-sm">
                  Selecione primeiro onde você quer ser atendido
                </p>
              </div>
              <Button
                size="default"
                className="w-full mt-4"
                style={brandColor ? { backgroundColor: brandColor } : undefined}
              >
                Escolher Local
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Opção: Escolher Profissional primeiro */}
        <Card
          className="group flex-1 md:flex-none overflow-hidden border-2 md:border hover:border-primary/50 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.97] md:hover:scale-[1.02]"
          onClick={() => onChoice(FirstChoice.EMPLOYEE)}
        >
          <CardContent className="p-0 h-full">
            {/* Mobile - Layout horizontal compacto */}
            <div className="flex md:hidden items-center gap-4 p-5 h-full">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 shrink-0"
                style={
                  brandColor
                    ? {
                        backgroundImage: `linear-gradient(to bottom right, ${brandColor}30, ${brandColor}10)`,
                      }
                    : undefined
                }
              >
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="text-base font-bold mb-1 group-hover:text-primary transition-colors">
                  Escolher Profissional
                </h3>
                <p className="text-xs text-muted-foreground">
                  Selecione o profissional que deseja
                </p>
              </div>
            </div>

            {/* Desktop - Layout vertical original */}
            <div className="hidden md:flex flex-col items-center text-center p-8 space-y-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors"
                style={
                  brandColor
                    ? {
                        backgroundImage: `linear-gradient(to bottom right, ${brandColor}20, ${brandColor}10)`,
                      }
                    : undefined
                }
              >
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  Escolher Profissional
                </h3>
                <p className="text-muted-foreground text-sm">
                  Selecione primeiro o profissional que deseja
                </p>
              </div>
              <Button
                size="default"
                className="w-full mt-4"
                style={brandColor ? { backgroundColor: brandColor } : undefined}
              >
                Escolher Profissional
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informação adicional - Oculta no mobile */}
      <div className="hidden md:block p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          <strong>Dica:</strong> Após escolher, você poderá ajustar sua seleção
        </p>
      </div>
    </div>
  );
}
