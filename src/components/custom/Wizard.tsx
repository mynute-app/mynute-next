"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useWizardStore } from "@/context/useWizardStore";
import { PersonStep } from "../form/Person";
import { ServiceStep } from "../form/Service";
import { CardCalendar } from "./Card-Calendar";
import { CardInformation } from "./Customer-Information";
import { AddressStep } from "../form/Address";
import { BusinessStep } from "../form/Business";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { useCompanyDesign } from "@/hooks/use-company-design";

const steps = [
  { id: 1, title: "Endereço" },
  { id: 2, title: "Profissionais" },
  { id: 3, title: "Serviço" },
  { id: 4, title: "Data e Hora" },
  { id: 5, title: "Informação" },
  { id: 6, title: "Confirmação" },
];

const Wizard: React.FC = () => {
  const { config: brand, loading: brandLoading } = useCompanyDesign("1");

  const {
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    selectedAddress,
    selectedPerson,
    selectedService,
    selectedCalendarDate,
    selectedBusiness,
    clientInfo,
  } = useWizardStore();
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const addressId = params.get("addressId");
    const person = params.get("person");
    const service = params.get("service");
    const date = params.get("date");

    if (!addressId) {
      setCurrentStep(1);
    } else if (addressId && !person) {
      setCurrentStep(2);
    } else if (addressId && person && !service) {
      setCurrentStep(3);
    } else if (addressId && person && service && !date) {
      setCurrentStep(4);
    } else if (addressId && person && service && date) {
      setCurrentStep(5);
    }
  }, [setCurrentStep]);

  const renderStepContent = (): JSX.Element | null => {
    switch (currentStep) {
      case 1:
        return <AddressStep />;
      case 2:
        return <PersonStep />;
      case 3:
        return <ServiceStep />;
      case 4:
        return <CardCalendar />;
      case 5:
        return <CardInformation />;
      case 6:
        return <div>Componente para o Passo 6: Confirmação</div>;
      default:
        return null;
    }
  };

  const validateAndProceed = async () => {
    try {
      if (currentStep === 1 && !selectedAddress) {
        throw new Error("Por favor, selecione um endereço.");
      } else if (currentStep === 2 && !selectedPerson) {
        throw new Error("Por favor, selecione uma pessoa.");
      } else if (currentStep === 3 && !selectedService) {
        throw new Error("Por favor, selecione um serviço.");
      } else if (
        currentStep === 4 &&
        (!selectedCalendarDate?.start.dateTime ||
          !selectedCalendarDate?.end.dateTime)
      ) {
        throw new Error("Por favor, selecione um dia e uma hora.");
      }

      if (currentStep === steps.length) {
        const postData = {
          summary: "Agendamento",
          description: `Cliente: ${clientInfo.fullName}`,
          start: selectedCalendarDate?.start.dateTime,
          end: selectedCalendarDate?.end.dateTime,
        };

        try {
          const response = await fetch("/api/calendar/busySlots", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
          });

          if (!response.ok) {
            throw new Error("Erro ao criar evento no calendário.");
          }

          if (!clientInfo.email || !clientInfo.fullName || !clientInfo.phone) {
            throw new Error("Os dados do cliente estão incompletos.");
          }

          const emailData = {
            fullName: clientInfo.fullName,
            email: clientInfo.email,
            phone: clientInfo.phone,
          };

          const emailResponse = await fetch("/api/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(emailData),
          });

          if (!emailResponse.ok) {
            const errorResponse = await emailResponse.json();
            throw new Error("Erro ao enviar o e-mail de confirmação.");
          }

          alert("E-mail de confirmação enviado com sucesso!");
        } catch (error) {
          alert("Não foi possível processar sua solicitação. Tente novamente.");
        }

        return;
      }

      setError("");
      nextStep();
    } catch (e) {
      if (e instanceof Error) {
        toast({
          title: "Erro",
          description: e.message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex flex-col w-full max-w-6xl h-screen rounded-lg shadow-lg overflow-hidden">
      <div className="relative shadow-xl h-[180px] overflow-hidden rounded-t-lg">
        {brand?.bannerImage ? (
          <Image
            src={brand.bannerImage}
            alt="Banner da empresa"
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: brand?.bannerColor || "#f5f5f5" }}
          />
        )}

        <div className="absolute inset-0 bg-white opacity-15" />

        <div className="flex justify-center items-center h-full relative z-10">
          {brandLoading ? (
            <Skeleton className="w-[150px] h-[120px] rounded-md" />
          ) : brand?.logo ? (
            <div className="w-[150px] h-[120px] relative">
              <Image
                src={brand.logo}
                alt="Logo da empresa"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <Skeleton className="w-[150px] h-[120px] rounded-md" />
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-2 bg-gray-100 overflow-hidden">
        <div className="flex justify-center items-center mb-2 mt-2">
          <ul className="flex justify-center space-x-4 items-center relative z-10">
            {steps
              .filter(
                step =>
                  step.id === currentStep ||
                  step.id === currentStep - 1 ||
                  step.id === currentStep + 1
              )
              .map(step => {
                const isLeft = step.id < currentStep;

                return (
                  <div
                    className="flex justify-center items-center flex-col gap-3"
                    key={step.id}
                  >
                    <li
                      className={`flex items-center justify-center h-8 w-8 md:w-10 md:h-10 rounded-md border-2 border-white shadow-lg ${
                        step.id !== currentStep && "bg-gray-300 text-gray-700"
                      }`}
                      style={{
                        backgroundColor:
                          step.id === currentStep
                            ? brand?.primaryColor
                            : undefined,
                        color: step.id === currentStep ? "white" : undefined,
                        maskImage:
                          step.id !== currentStep
                            ? isLeft
                              ? "linear-gradient(to left, black, transparent)"
                              : "linear-gradient(to right, black, transparent)"
                            : "none",
                        WebkitMaskImage:
                          step.id !== currentStep
                            ? isLeft
                              ? "linear-gradient(to left, black, transparent)"
                              : "linear-gradient(to right, black, transparent)"
                            : "none",
                        transform:
                          step.id === currentStep ? "scale(1.3)" : "scale(1)",
                        transition: "transform 0.3s ease, mask-image 0.3s ease",
                      }}
                    >
                      <span className="text-sm md:text-lg font-semibold">
                        {step.id}
                      </span>
                    </li>

                    {step.id === currentStep && (
                      <h1 className="text-sm md:text-lg font-bold">
                        {steps.find(step => step.id === currentStep)?.title}
                      </h1>
                    )}
                  </div>
                );
              })}
          </ul>
        </div>

        <Separator className="my-2" />

        <div className="flex-1 bg-white p-2 rounded-lg shadow-md mb-4 overflow-y-auto">
          {renderStepContent()}
        </div>

        <div className="mt-auto flex justify-between ">
          <Button onClick={prevStep} disabled={currentStep === 1}>
            Anterior
          </Button>
          <Button
            onClick={validateAndProceed}
            style={{ backgroundColor: brand?.primaryColor, color: "white" }}
          >
            {currentStep === steps.length ? "Finalizar" : "Próximo"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Wizard;
