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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            O que você prefere escolher primeiro?
          </h1>
          <p className="text-sm text-muted-foreground">
            Você pode escolher o local ou o profissional primeiro
          </p>
        </header>
      </div>

      {/* Opções */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Opção: Escolher Local primeiro */}
        <Card
          className="group hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
          onClick={() => onChoice(FirstChoice.BRANCH)}
        >
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
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
                Selecione primeiro onde você quer ser atendido, depois escolha o
                profissional disponível nesse local
              </p>
            </div>

            <Button
              size="lg"
              className="w-full mt-4"
              style={brandColor ? { backgroundColor: brandColor } : undefined}
            >
              Escolher Local Primeiro
            </Button>
          </CardContent>
        </Card>

        {/* Opção: Escolher Profissional primeiro */}
        <Card
          className="group hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
          onClick={() => onChoice(FirstChoice.EMPLOYEE)}
        >
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
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
                Selecione primeiro o profissional que deseja, depois escolha o
                local onde ele atende
              </p>
            </div>

            <Button
              size="lg"
              className="w-full mt-4"
              style={brandColor ? { backgroundColor: brandColor } : undefined}
            >
              Escolher Profissional Primeiro
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informação adicional */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          <strong>Dica:</strong> Não se preocupe! Após escolher, você ainda
          poderá ver todas as opções disponíveis e fazer ajustes.
        </p>
      </div>
    </div>
  );
}
