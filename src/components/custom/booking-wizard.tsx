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
import { useCompany } from "@/hooks/get-company";

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
  const { company, loading: brandLoading } = useCompany();
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
        // Final submission logic
        toast({
          title: "Sucesso!",
          description: "Agendamento realizado com sucesso!",
        });
        return;
      }

      // Se não estiver na confirmação, apenas vai para o próximo passo disponível
      const currentIndex = getCurrentStepIndex();
      if (currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1];

        // Se o próximo passo for informação ou confirmação, verifica se pode acessar
        if (nextStep.id === "informacao" && !areRequiredStepsCompleted()) {
          toast({
            title: "Atenção",
            description: "Preencha todos os campos obrigatórios primeiro.",
            variant: "destructive",
          });
          return;
        }

        if (
          nextStep.id === "confirmacao" &&
          (!areRequiredStepsCompleted() || !isStepCompleted("informacao"))
        ) {
          toast({
            title: "Atenção",
            description: "Complete todas as etapas antes de finalizar.",
            variant: "destructive",
          });
          return;
        }

        setActiveStep(nextStep.id);
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
    // Debug: log do estado atual
    console.log("🔍 Tentando ir para:", stepId);
    console.log("📊 Estado atual:", {
      selectedAddress,
      selectedPerson,
      selectedService,
      selectedCalendarDate,
      clientInfo,
      areRequiredStepsCompleted: areRequiredStepsCompleted(),
    });

    if (stepId === "informacao" && !areRequiredStepsCompleted()) {
      console.log("❌ Bloqueado: Campos obrigatórios não preenchidos");
      toast({
        title: "Atenção",
        description: "Preencha todos os campos obrigatórios primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (
      stepId === "confirmacao" &&
      (!areRequiredStepsCompleted() || !isStepCompleted("informacao"))
    ) {
      console.log("❌ Bloqueado: Confirmação não disponível");
      toast({
        title: "Atenção",
        description: "Complete todas as etapas antes de finalizar.",
        variant: "destructive",
      });
      return;
    }

    console.log("✅ Navegando para:", stepId);
    setActiveStep(stepId);
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
      </div>{" "}
      {/* Progress Steps */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;
            const isClickable =
              (step.id !== "informacao" && step.id !== "confirmacao") ||
              (step.id === "informacao" && areRequiredStepsCompleted()) ||
              (step.id === "confirmacao" &&
                areRequiredStepsCompleted() &&
                isStepCompleted("informacao"));

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex flex-col items-center transition-all duration-200 ${
                    isClickable
                      ? "cursor-pointer hover:scale-105"
                      : "cursor-not-allowed opacity-50"
                  } ${
                    status === "pending" && isClickable
                      ? "opacity-70 hover:opacity-90"
                      : ""
                  }`}
                  onClick={() => isClickable && goToStep(step.id)}
                >
                  <div
                    className={`
          relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
            isClickable ? "hover:shadow-lg" : ""
          }
          ${
            status === "completed"
              ? "bg-green-500 border-green-500 text-white hover:bg-green-600"
              : status === "active"
              ? "border-blue-500 text-blue-500 bg-blue-50 hover:bg-blue-100"
              : isClickable
              ? "border-gray-300 text-gray-400 bg-white hover:border-gray-400 hover:text-gray-500"
              : "border-gray-200 text-gray-300 bg-gray-100"
          }
        `}
                  >
                    {status === "completed" ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}

                    {!isClickable && step.id !== activeStep && (
                      <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-center">
                    <div
                      className={`text-sm font-medium transition-colors duration-200 ${
                        status === "active"
                          ? "text-blue-600"
                          : status === "completed"
                          ? "text-green-600"
                          : isClickable
                          ? "text-gray-500 hover:text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </div>
                    <div
                      className={`text-xs ${
                        isClickable ? "text-gray-500" : "text-gray-400"
                      } hidden sm:block`}
                    >
                      {step.description}
                      {!isClickable &&
                        (step.id === "informacao" ||
                          step.id === "confirmacao") && (
                          <div className="text-orange-500 text-xs mt-1">
                            {step.id === "informacao"
                              ? "Complete os campos obrigatórios"
                              : "Complete todas as etapas"}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 transition-colors duration-200 ${
                      isStepCompleted(step.id) ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>{" "}
      {/* Step Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {" "}
          <Card className="m-6 h-[calc(100%-3rem)]">
            <CardContent className="p-0 h-full">
              {renderActiveComponent()}

              {/* Botões temporários para testar */}
              <div className="p-4 border-t bg-gray-50">
                <h4 className="font-semibold mb-2">
                  🧪 Teste - Simular Seleções:
                </h4>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() =>
                      setSelectedAddress({ id: 1, name: "Endereço Teste" })
                    }
                  >
                    Simular Endereço
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      setSelectedPerson({ id: 1, name: "João Silva" })
                    }
                  >
                    Simular Profissional
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      setSelectedService({ id: 1, name: "Corte de Cabelo" })
                    }
                  >
                    Simular Serviço
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      setSelectedCalendarDate({
                        date: "2025-06-13",
                        time: "14:00",
                      })
                    }
                  >
                    Simular Data/Hora
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      setClientInfo({
                        fullName: "Cliente Teste",
                        email: "teste@email.com",
                        phone: "123456789",
                      })
                    }
                  >
                    Simular Info Cliente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>{" "}
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
            {areRequiredStepsCompleted() && (
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                Pronto para finalizar
              </Badge>
            )}
          </div>

          <Button
            onClick={validateAndProceed}
            className="flex items-center gap-2"
            style={{
              backgroundColor: company?.design?.colors?.primary,
              color: "white",
            }}
            disabled={
              activeStep === "confirmacao" &&
              (!areRequiredStepsCompleted() || !isStepCompleted("informacao"))
            }
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
