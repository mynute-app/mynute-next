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
  const currentStepIndex = steps.findIndex(step => step.current);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <nav aria-label="Progresso do agendamento" className="mb-6">
      {/* Layout Desktop - Breadcrumbs completo */}
      <ol className="hidden sm:flex items-center justify-between">
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

              {/* Label */}
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  step.current && "text-foreground",
                  step.completed && "text-muted-foreground",
                  !step.completed && !step.current && "text-muted-foreground/60"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Separador */}
            {index < steps.length - 1 && (
              <ChevronRight
                className={cn(
                  "w-4 h-4 flex-shrink-0 mx-2",
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

      {/* Layout Mobile - Indicador compacto */}
      <div className="sm:hidden space-y-2">
        {/* Título do step atual */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {steps[currentStepIndex]?.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {currentStepIndex + 1} de {steps.length}
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out rounded-full"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: brandColor || undefined,
            }}
          />
        </div>
      </div>
    </nav>
  );
}
