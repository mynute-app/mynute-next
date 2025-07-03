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
import { ServiceStep } from "../form/Service";
import { AddressStep } from "../form/Address";
import { CardCalendar } from "./Card-Calendar";
import { PersonStep } from "../form/Person";
import { CardInformation } from "./Customer-Information";
import { useGetCompany } from "@/hooks/get-company";

const steps = [
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

const BookingWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState("servico");
  const { toast } = useToast();
  const { company, loading: brandLoading } = useGetCompany();
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  // Steps definidos dentro do componente
  const steps = [
    {
      id: "servico",
      title: "Serviço",
      description: "Selecione o serviço",
      icon: Wrench,
    },
    {
      id: "data",
      title: "Data e Hora",
      description: "Agende seu horário",
      icon: Calendar,
    },
    {
      id: "endereco",
      title: "Endereço",
      description: "Selecione o local",
      icon: MapPin,
    },
    {
      id: "profissionais",
      title: "Profissionais",
      description: "Escolha o profissional",
      icon: Users,
    },
    {
      id: "informacao",
      title: "Informação",
      description: "Seus dados pessoais",
      icon: Info,
    },
    {
      id: "confirmacao",
      title: "Confirmação",
      description: "Finalize seu agendamento",
      icon: CheckCircle,
    },
  ];
  // Função para renderizar o componente ativo com as props corretas
  const renderActiveComponent = () => {
    switch (activeStep) {
      case "servico":
        return <ServiceStep />;
      case "data":
        return <CardCalendar />;
      case "endereco":
        return <AddressStep />;
      case "profissionais":
        return <PersonStep />;
      case "informacao":
        return <CardInformation />;
      case "confirmacao":
        return (
          <div className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Confirme seu agendamento
            </h3>
            <p className="text-gray-600">
              Revise todas as informações antes de finalizar
            </p>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Resumo:</h4>
              <p>
                <strong>Endereço:</strong>{" "}
                {selectedAddress
                  ? JSON.stringify(selectedAddress)
                  : "Não selecionado"}
              </p>
              <p>
                <strong>Profissional:</strong>{" "}
                {selectedPerson
                  ? JSON.stringify(selectedPerson)
                  : "Não selecionado"}
              </p>
              <p>
                <strong>Serviço:</strong>{" "}
                {selectedService
                  ? JSON.stringify(selectedService)
                  : "Não selecionado"}
              </p>
              <p>
                <strong>Data/Hora:</strong>{" "}
                {selectedCalendarDate
                  ? JSON.stringify(selectedCalendarDate)
                  : "Não selecionado"}
              </p>
              <p>
                <strong>Cliente:</strong> {clientInfo.fullName} -{" "}
                {clientInfo.email}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  // Verifica se os passos obrigatórios foram preenchidos
  const areRequiredStepsCompleted = () => {
    const result =
      selectedAddress &&
      selectedPerson &&
      selectedService &&
      selectedCalendarDate;

    console.log("🔎 Verificando campos obrigatórios:", {
      selectedAddress: !!selectedAddress,
      selectedPerson: !!selectedPerson,
      selectedService: !!selectedService,
      selectedCalendarDate: !!selectedCalendarDate,
      resultado: result,
    });

    return result;
  };

  // Verifica se um passo foi preenchido
  const isStepCompleted = (stepId: string) => {
    switch (stepId) {
      case "endereco":
        return !!selectedAddress;
      case "profissionais":
        return !!selectedPerson;
      case "servico":
        return !!selectedService;
      case "data":
        return !!selectedCalendarDate;
      case "informacao":
        return clientInfo.fullName && clientInfo.email && clientInfo.phone;
      default:
        return false;
    }
  };

  // Console.log para monitorar dados selecionados
  useEffect(() => {
    if (selectedAddress) {
      console.log("🏠 Endereço selecionado:", selectedAddress);
    }
  }, [selectedAddress]);

  useEffect(() => {
    if (selectedPerson) {
      console.log("👤 Profissional selecionado:", selectedPerson);
    }
  }, [selectedPerson]);

  useEffect(() => {
    if (selectedService) {
      console.log("🔧 Serviço selecionado:", selectedService);
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedCalendarDate) {
      console.log("📅 Data/Hora selecionada:", selectedCalendarDate);
    }
  }, [selectedCalendarDate]);

  useEffect(() => {
    if (clientInfo.fullName || clientInfo.email || clientInfo.phone) {
      console.log("ℹ️ Informações do cliente:", clientInfo);
    }
  }, [clientInfo]);

  // Log consolidado quando todos os dados estão preenchidos
  useEffect(() => {
    if (
      areRequiredStepsCompleted() &&
      (clientInfo.fullName || clientInfo.email || clientInfo.phone)
    ) {
      console.log("✅ DADOS COMPLETOS:", {
        endereco: selectedAddress,
        profissional: selectedPerson,
        servico: selectedService,
        dataHora: selectedCalendarDate,
        cliente: clientInfo,
      });
    }
  }, [
    selectedAddress,
    selectedPerson,
    selectedService,
    selectedCalendarDate,
    clientInfo,
    areRequiredStepsCompleted,
  ]);

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === activeStep);
  };

  const validateAndProceed = async () => {
    try {
      if (activeStep === "confirmacao") {
        // Só validar na confirmação final
        if (!areRequiredStepsCompleted() || !isStepCompleted("informacao")) {
          toast({
            title: "Atenção",
            description: "Complete todas as etapas antes de finalizar.",
            variant: "destructive",
          });
          return;
        }

        // Final submission logic
        toast({
          title: "Sucesso!",
          description: "Agendamento realizado com sucesso!",
        });
        return;
      }

      // Navegação livre - vai para o próximo passo
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

  const getStepStatus = (stepId: string) => {
    if (isStepCompleted(stepId)) return "completed";
    if (stepId === activeStep) return "active";
    return "pending";
  };

  // Console.log para monitorar dados selecionados
  useEffect(() => {
    if (selectedAddress) {
      console.log("🏠 Endereço selecionado:", selectedAddress);
    }
  }, [selectedAddress]);

  useEffect(() => {
    if (selectedPerson) {
      console.log("👤 Profissional selecionado:", selectedPerson);
    }
  }, [selectedPerson]);

  useEffect(() => {
    if (selectedService) {
      console.log("🔧 Serviço selecionado:", selectedService);
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedCalendarDate) {
      console.log("📅 Data/Hora selecionada:", selectedCalendarDate);
    }
  }, [selectedCalendarDate]);

  useEffect(() => {
    if (clientInfo.fullName || clientInfo.email || clientInfo.phone) {
      console.log("ℹ️ Informações do cliente:", clientInfo);
    }
  }, [clientInfo]);

  // Log consolidado quando todos os dados estão preenchidos
  useEffect(() => {
    if (
      areRequiredStepsCompleted() &&
      (clientInfo.fullName || clientInfo.email || clientInfo.phone)
    ) {
      console.log("✅ DADOS COMPLETOS:", {
        endereco: selectedAddress,
        profissional: selectedPerson,
        servico: selectedService,
        dataHora: selectedCalendarDate,
        cliente: clientInfo,
      });
    }
  }, [
    selectedAddress,
    selectedPerson,
    selectedService,
    selectedCalendarDate,
    clientInfo,
  ]);

  return (
    <div className="flex flex-col w-full max-w-6xl min-h-screen bg-white md:rounded-lg md:shadow-lg md:overflow-hidden">
      {/* Estilos para scrollbar */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Header Compacto para Mobile */}
      <div className="relative h-[80px] md:h-[180px] overflow-hidden md:rounded-t-lg">
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
              backgroundColor: company?.design?.colors?.primary || "#3B82F6",
            }}
          />
        )}

        <div className="absolute inset-0 bg-black/20" />

        {/* Logo menor e mais discreto em mobile */}
        <div className="flex justify-center items-center h-full relative z-10">
          {brandLoading ? (
            <Skeleton className="w-[60px] h-[40px] md:w-[150px] md:h-[120px] rounded-md" />
          ) : company?.design?.images?.logo?.url ? (
            <div className="w-[60px] h-[40px] md:w-[150px] md:h-[120px] relative">
              <Image
                src={company.design.images.logo.url || "/placeholder.svg"}
                alt="Logo da empresa"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <Skeleton className="w-[60px] h-[40px] md:w-[150px] md:h-[120px] rounded-md" />
          )}
        </div>
      </div>

      {/* Progress Steps - Design Mobile First */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        {/* Mobile: Navigation com scroll horizontal */}
        <div className="block md:hidden px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {steps.find(s => s.id === activeStep)?.title}
            </span>
            <span className="text-xs text-gray-500">
              {getCurrentStepIndex() + 1}/{steps.length}
            </span>
          </div>

          {/* Navegação horizontal para mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const Icon = step.icon;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    status === "active"
                      ? "bg-blue-500 text-white"
                      : status === "completed"
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {status === "completed" ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                  {step.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop: Steps tradicionais com navegação livre */}
        <div className="hidden md:block px-6 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className="flex flex-col items-center transition-all duration-200 cursor-pointer hover:scale-105"
                    onClick={() => setActiveStep(step.id)}
                  >
                    <div
                      className={`
                        relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:shadow-lg
                        ${
                          status === "completed"
                            ? "bg-green-500 border-green-500 text-white hover:bg-green-600"
                            : status === "active"
                            ? "border-2 border-blue-500 text-blue-500 bg-blue-50 hover:bg-blue-100"
                            : "border-2 border-gray-300 text-gray-400 bg-white hover:border-blue-300 hover:text-blue-400"
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
                            : "text-gray-500 hover:text-blue-600"
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 hidden lg:block">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 transition-colors duration-200 ${
                        isStepCompleted(step.id)
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
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-4 md:p-6 h-full">{renderActiveComponent()}</div>
        </div>
      </div>

      {/* Fixed Footer Navigation */}
      <div className="border-t bg-white sticky bottom-0 z-10">
        <div className="p-4">
          {/* Indicador de progresso geral */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Progresso</span>
              <span className="text-xs text-gray-500">
                {Math.round(
                  (steps.filter(step => isStepCompleted(step.id)).length /
                    (steps.length - 1)) *
                    100
                )}
                % completo
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (steps.filter(step => isStepCompleted(step.id)).length /
                      (steps.length - 1)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center max-w-4xl mx-auto gap-4">
            <Button
              onClick={goToPreviousStep}
              disabled={getCurrentStepIndex() === 0}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 min-w-[80px]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
              <span className="sm:hidden">Voltar</span>
            </Button>

            {/* Status badges - adaptativo */}
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
              <Badge variant="secondary" className="text-xs order-1 sm:order-2">
                {getCurrentStepIndex() + 1} de {steps.length}
              </Badge>
              {areRequiredStepsCompleted() && (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600 text-xs order-2 sm:order-1"
                >
                  ✅ Pronto para finalizar!
                </Badge>
              )}
            </div>

            <Button
              onClick={validateAndProceed}
              size="sm"
              className="flex items-center gap-2 min-w-[80px]"
              style={{
                backgroundColor: company?.design?.colors?.primary || "#3B82F6",
                color: "white",
              }}
              disabled={
                activeStep === "confirmacao" &&
                (!areRequiredStepsCompleted() || !isStepCompleted("informacao"))
              }
            >
              <span className="hidden sm:inline">
                {activeStep === "confirmacao"
                  ? "Finalizar Agendamento"
                  : "Próximo"}
              </span>
              <span className="sm:hidden">
                {activeStep === "confirmacao" ? "Finalizar" : "Avançar"}
              </span>
              {activeStep !== "confirmacao" && (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;
