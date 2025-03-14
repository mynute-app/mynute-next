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

const steps = [
  { id: 1, title: "Empresas" },
  { id: 2, title: "Endereço" },
  { id: 3, title: "Profissionais" },
  { id: 4, title: "Serviço" },
  { id: 5, title: "Data e Hora" },
  { id: 6, title: "Informação" },
  { id: 7, title: "Confirmação" },
];

const Wizard: React.FC = () => {
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
    const businessId = params.get("businessId");
    const addressId = params.get("addressId");
    const person = params.get("person");
    const service = params.get("service");
    const date = params.get("date");

    if (!businessId) {
      setCurrentStep(1);
    } else if (businessId && !addressId) {
      setCurrentStep(2);
    } else if (businessId && addressId && !person) {
      setCurrentStep(3);
    } else if (businessId && addressId && person && !service) {
      setCurrentStep(4);
    } else if (businessId && addressId && person && service && !date) {
      setCurrentStep(5);
    } else if (businessId && addressId && person && service && date) {
      setCurrentStep(6);
    }
  }, [setCurrentStep]);

  const renderStepContent = (): JSX.Element | null => {
    switch (currentStep) {
      case 1:
        return <BusinessStep />;
      case 2:
        return <AddressStep />;
      case 3:
        return <PersonStep />;
      case 4:
        return <ServiceStep />;
      case 5:
        return <CardCalendar />;
      case 6:
        return <CardInformation />;
      case 7:
        return <div>Componente para o Passo 7: Confirmação</div>;
      default:
        return null;
    }
  };

  const validateAndProceed = async () => {
    try {
      if (currentStep === 1 && !selectedBusiness) {
        throw new Error("Por favor, selecione uma empresa.");
      } else if (currentStep === 2 && !selectedAddress) {
        throw new Error("Por favor, selecione um endereço.");
      } else if (currentStep === 3 && !selectedPerson) {
        throw new Error("Por favor, selecione uma pessoa.");
      } else if (currentStep === 4 && !selectedService) {
        throw new Error("Por favor, selecione um serviço.");
      } else if (
        currentStep === 5 &&
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

          console.log("✅ Evento criado com sucesso!");

          // 🚀 **Correção no envio do e-mail**
          if (!clientInfo.email || !clientInfo.fullName || !clientInfo.phone) {
            throw new Error("Os dados do cliente estão incompletos.");
          }

          const emailData = {
            fullName: clientInfo.fullName, // Nome do cliente
            email: clientInfo.email, // E-mail do cliente
            phone: clientInfo.phone, // Telefone do cliente
          };

          console.log("📩 Enviando e-mail com os dados:", emailData);

          const emailResponse = await fetch("/api/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(emailData),
          });

          if (!emailResponse.ok) {
            const errorResponse = await emailResponse.json();
            console.error("❌ Erro ao enviar e-mail:", errorResponse);
            throw new Error("Erro ao enviar o e-mail de confirmação.");
          }

          console.log("✅ E-mail de confirmação enviado!");
          alert("E-mail de confirmação enviado com sucesso!");
        } catch (error) {
          console.error("❌ Erro:", error);
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
      <div className="relative bg-cover bg-center shadow-xl p-4  bg-no-repeat">
        <div className="absolute inset-0 bg-white opacity-15"></div>
        <div className="flex justify-center items-center my-4 relative z-10">
          <Image src="/placeholder.svg" width={130} height={100} alt="Logo" />
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
                const isRight = step.id > currentStep;

                return (
                  <div
                    className="flex justify-center items-center flex-col gap-3"
                    key={step.id}
                  >
                    <li
                      className={`flex items-center justify-center h-8 w-8 md:w-10 md:h-10 rounded-md border-2 border-white shadow-lg ${
                        step.id === currentStep
                          ? "bg-primary text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                      style={{
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
          <Button onClick={validateAndProceed}>
            {currentStep === steps.length ? "Finalizar" : "Próximo"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Wizard;
