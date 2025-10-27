"use client";

/**
 * BookingBreadcrumbs - Componente de navegação visual do progresso
 * Mostra ao usuário onde ele está no fluxo de agendamento
 */

import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingStep, FirstChoice } from "../types";

interface Step {
  id: BookingStep;
  label: string;
  completed: boolean;
  current: boolean;
}

interface BookingBreadcrumbsProps {
  currentStep: BookingStep;
  firstChoice: FirstChoice;
  brandColor?: string;
}

export function BookingBreadcrumbs({
  currentStep,
  firstChoice,
  brandColor,
}: BookingBreadcrumbsProps) {
  // Determinar steps baseado na escolha do usuário
  const getSteps = (): Step[] => {
    const baseSteps = [
      {
        id: BookingStep.SERVICE_SELECTION,
        label: "Serviço",
        completed: currentStep !== BookingStep.SERVICE_SELECTION,
        current: currentStep === BookingStep.SERVICE_SELECTION,
      },
      {
        id: BookingStep.DATETIME_SELECTION,
        label: "Data e Hora",
        completed:
          currentStep !== BookingStep.SERVICE_SELECTION &&
          currentStep !== BookingStep.DATETIME_SELECTION,
        current: currentStep === BookingStep.DATETIME_SELECTION,
      },
    ];

    // Adicionar step de escolha apenas se ainda não escolheu
    if (firstChoice === FirstChoice.NONE) {
      baseSteps.push({
        id: BookingStep.CHOICE_SELECTION,
        label: "Preferência",
        completed: false,
        current: currentStep === BookingStep.CHOICE_SELECTION,
      });
      return baseSteps;
    }

    // Adicionar steps dinâmicos baseado na escolha
    if (firstChoice === FirstChoice.EMPLOYEE) {
      baseSteps.push(
        {
          id: BookingStep.EMPLOYEE_SELECTION,
          label: "Profissional",
          completed:
            currentStep === BookingStep.BRANCH_SELECTION ||
            currentStep === BookingStep.CLIENT_FORM ||
            currentStep === BookingStep.CONFIRMATION,
          current: currentStep === BookingStep.EMPLOYEE_SELECTION,
        },
        {
          id: BookingStep.BRANCH_SELECTION,
          label: "Local",
          completed:
            currentStep === BookingStep.CLIENT_FORM ||
            currentStep === BookingStep.CONFIRMATION,
          current: currentStep === BookingStep.BRANCH_SELECTION,
        }
      );
    } else if (firstChoice === FirstChoice.BRANCH) {
      baseSteps.push(
        {
          id: BookingStep.BRANCH_SELECTION,
          label: "Local",
          completed:
            currentStep === BookingStep.EMPLOYEE_SELECTION ||
            currentStep === BookingStep.CLIENT_FORM ||
            currentStep === BookingStep.CONFIRMATION,
          current: currentStep === BookingStep.BRANCH_SELECTION,
        },
        {
          id: BookingStep.EMPLOYEE_SELECTION,
          label: "Profissional",
          completed:
            currentStep === BookingStep.CLIENT_FORM ||
            currentStep === BookingStep.CONFIRMATION,
          current: currentStep === BookingStep.EMPLOYEE_SELECTION,
        }
      );
    }

    baseSteps.push(
      {
        id: BookingStep.CLIENT_FORM,
        label: "Dados",
        completed: currentStep === BookingStep.CONFIRMATION,
        current: currentStep === BookingStep.CLIENT_FORM,
      },
      {
        id: BookingStep.CONFIRMATION,
        label: "Confirmação",
        completed: false,
        current: currentStep === BookingStep.CONFIRMATION,
      }
    );

    return baseSteps;
  };

  const steps = getSteps();

  return (
    <nav aria-label="Progresso do agendamento" className="mb-6">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              "flex items-center gap-2",
              index < steps.length - 1 && "flex-1"
            )}
          >
            <div className="flex items-center gap-2">
              {/* Ícone do step */}
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                  step.completed &&
                    "bg-primary border-primary text-primary-foreground",
                  step.current &&
                    !step.completed &&
                    "border-primary text-primary font-semibold",
                  !step.completed &&
                    !step.current &&
                    "border-muted-foreground/30 text-muted-foreground"
                )}
                style={
                  step.completed && brandColor
                    ? { backgroundColor: brandColor, borderColor: brandColor }
                    : undefined
                }
              >
                {step.completed ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>

              {/* Label - Ocultar em mobile se não for atual */}
              <span
                className={cn(
                  "text-sm font-medium transition-colors hidden sm:inline",
                  step.current && "text-foreground",
                  step.completed && "text-muted-foreground",
                  !step.completed && !step.current && "text-muted-foreground/60"
                )}
              >
                {step.label}
              </span>

              {/* Label mobile - mostrar apenas se atual */}
              {step.current && (
                <span className="text-sm font-medium sm:hidden">
                  {step.label}
                </span>
              )}
            </div>

            {/* Separador */}
            {index < steps.length - 1 && (
              <ChevronRight
                className={cn(
                  "w-4 h-4 flex-shrink-0 mx-2 hidden sm:block",
                  step.completed ? "text-primary" : "text-muted-foreground/30"
                )}
                style={
                  step.completed && brandColor
                    ? { color: brandColor }
                    : undefined
                }
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
