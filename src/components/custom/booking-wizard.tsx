"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Users,
  Wrench,
  Calendar,
  Info,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// Mock components - replace with your actual components
const AddressStep = () => (
  <div className="p-8 text-center">Componente de Endereço</div>
);
const PersonStep = () => (
  <div className="p-8 text-center">Componente de Profissionais</div>
);
const ServiceStep = () => (
  <div className="p-8 text-center">Componente de Serviço</div>
);
const CardCalendar = () => (
  <div className="p-8 text-center">Componente de Data e Hora</div>
);
const CardInformation = () => (
  <div className="p-8 text-center">Componente de Informação</div>
);

const steps = [
  {
    id: "endereco",
    title: "Endereço",
    description: "Selecione o local",
    icon: MapPin,
    component: <AddressStep />,
  },
  {
    id: "profissionais",
    title: "Profissionais",
    description: "Escolha o profissional",
    icon: Users,
    component: <PersonStep />,
  },
  {
    id: "servico",
    title: "Serviço",
    description: "Selecione o serviço",
    icon: Wrench,
    component: <ServiceStep />,
  },
  {
    id: "data",
    title: "Data e Hora",
    description: "Agende seu horário",
    icon: Calendar,
    component: <CardCalendar />,
  },
  {
    id: "informacao",
    title: "Informação",
    description: "Seus dados pessoais",
    icon: Info,
    component: <CardInformation />,
  },
  {
    id: "confirmacao",
    title: "Confirmação",
    description: "Finalize seu agendamento",
    icon: CheckCircle,
    component: (
      <div className="p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Confirme seu agendamento</h3>
        <p className="text-gray-600">
          Revise todas as informações antes de finalizar
        </p>
      </div>
    ),
  },
];

const mockCompany = {
  design: {
    colors: {
      primary: "#3b82f6",
    },
    images: {
      banner: {
        url: "/placeholder.svg?height=180&width=800",
      },
      logo: {
        url: "/placeholder.svg?height=120&width=150",
      },
    },
  },
};

const BookingWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState("endereco");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const { toast } = useToast();
  const company = mockCompany; // Replace with your actual company hook
  const brandLoading = false; // Replace with your actual loading state

  // Mock validation states - replace with your actual validation logic
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [clientInfo, setClientInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const addressId = params.get("addressId");
    const person = params.get("person");
    const service = params.get("service");
    const date = params.get("date");

    if (!addressId) {
      setActiveStep("endereco");
    } else if (addressId && !person) {
      setActiveStep("profissionais");
      setCompletedSteps(["endereco"]);
    } else if (addressId && person && !service) {
      setActiveStep("servico");
      setCompletedSteps(["endereco", "profissionais"]);
    } else if (addressId && person && service && !date) {
      setActiveStep("data");
      setCompletedSteps(["endereco", "profissionais", "servico"]);
    } else if (addressId && person && service && date) {
      setActiveStep("informacao");
      setCompletedSteps(["endereco", "profissionais", "servico", "data"]);
    }
  }, []);

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === activeStep);
  };

  const validateAndProceed = async () => {
    try {
      // Your validation logic here
      if (activeStep === "endereco" && !selectedAddress) {
        throw new Error("Por favor, selecione um endereço.");
      } else if (activeStep === "profissionais" && !selectedPerson) {
        throw new Error("Por favor, selecione uma pessoa.");
      } else if (activeStep === "servico" && !selectedService) {
        throw new Error("Por favor, selecione um serviço.");
      } else if (activeStep === "data" && !selectedCalendarDate) {
        throw new Error("Por favor, selecione um dia e uma hora.");
      }

      if (activeStep === "confirmacao") {
        // Final submission logic
        toast({
          title: "Sucesso!",
          description: "Agendamento realizado com sucesso!",
        });
        return;
      }

      // Mark current step as completed and move to next
      setCompletedSteps(prev => [...prev, activeStep]);
      const currentIndex = getCurrentStepIndex();
      if (currentIndex < steps.length - 1) {
        setActiveStep(steps[currentIndex + 1].id);
      }
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

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].id);
    }
  };

  const goToStep = (stepId: string) => {
    setActiveStep(stepId);
  };

  const getStepStatus = (stepId: string) => {
    if (completedSteps.includes(stepId)) return "completed";
    if (stepId === activeStep) return "active";
    return "pending";
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const currentIndex = getCurrentStepIndex();

      if (event.key === "ArrowRight" && currentIndex < steps.length - 1) {
        setActiveStep(steps[currentIndex + 1].id);
      } else if (event.key === "ArrowLeft" && currentIndex > 0) {
        setActiveStep(steps[currentIndex - 1].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeStep]);

  return (
    <div className="flex flex-col w-full max-w-6xl h-screen rounded-lg shadow-lg overflow-hidden bg-white">
      {/* Header with Banner and Logo */}
      <div className="relative shadow-xl h-[180px] overflow-hidden rounded-t-lg">
        {company?.design?.images?.banner?.url ? (
          <Image
            src={company.design.images.banner.url || "/placeholder.svg"}
            alt="Banner da empresa"
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: company?.design?.colors?.primary || "#f5f5f5",
            }}
          />
        )}

        <div className="absolute inset-0 bg-black/20" />

        <div className="flex justify-center items-center h-full relative z-10">
          {brandLoading ? (
            <Skeleton className="w-[150px] h-[120px] rounded-md" />
          ) : company?.design?.images?.logo?.url ? (
            <div className="w-[150px] h-[120px] relative">
              <Image
                src={company.design.images.logo.url || "/placeholder.svg"}
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

      {/* Progress Steps */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105 ${
                    status === "pending" ? "opacity-70 hover:opacity-90" : ""
                  }`}
                  onClick={() => goToStep(step.id)}
                >
                  <div
                    className={`
          relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 hover:shadow-lg
          ${
            status === "completed"
              ? "bg-green-500 border-green-500 text-white hover:bg-green-600"
              : status === "active"
              ? "border-blue-500 text-blue-500 bg-blue-50 hover:bg-blue-100"
              : "border-gray-300 text-gray-400 bg-white hover:border-gray-400 hover:text-gray-500"
          }
        `}
                  >
                    {status === "completed" ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>

                  <div className="mt-2 text-center">
                    <div
                      className={`text-sm font-medium transition-colors duration-200 ${
                        status === "active"
                          ? "text-blue-600"
                          : status === "completed"
                          ? "text-green-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 transition-colors duration-200 ${
                      completedSteps.includes(step.id)
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <Card className="m-6 h-[calc(100%-3rem)]">
            <CardContent className="p-0 h-full">
              {steps.find(step => step.id === activeStep)?.component}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="border-t bg-white px-6 py-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <Button
            onClick={goToPreviousStep}
            disabled={getCurrentStepIndex() === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {getCurrentStepIndex() + 1} de {steps.length}
            </Badge>
          </div>

          <Button
            onClick={validateAndProceed}
            className="flex items-center gap-2"
            style={{
              backgroundColor: company?.design?.colors?.primary,
              color: "white",
            }}
          >
            {activeStep === "confirmacao" ? "Finalizar" : "Próximo"}
            {activeStep !== "confirmacao" && (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;
