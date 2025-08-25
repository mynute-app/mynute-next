"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useWizardStore } from "@/context/useWizardStore";
import { PersonStep } from "../form/Person";
import { ServiceStep } from "../form/Service";
import { CardCalendar } from "./Card-Calendar";
import { CardInformation } from "./Customer-Information";
import { AddressStep } from "../form/Address";
import { BusinessStep } from "../form/Business";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";

const tabs = [
  { id: "endereco", title: "Endereço", component: <AddressStep /> },
  { id: "profissionais", title: "Profissionais", component: <PersonStep /> },
  { id: "servico", title: "Serviço", component: <ServiceStep /> },
  { id: "data", title: "Data e Hora", component: <CardCalendar /> },
  { id: "informacao", title: "Informação", component: <CardInformation /> },
  {
    id: "confirmacao",
    title: "Confirmação",
    component: <div>Componente para o Passo 6: Confirmação</div>,
  },
];

const Wizard: React.FC = () => {
  const { company, loading: brandLoading } = useCompany();
  const [activeTab, setActiveTab] = useState("endereco");

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
      setActiveTab("endereco");
    } else if (addressId && !person) {
      setActiveTab("profissionais");
    } else if (addressId && person && !service) {
      setActiveTab("servico");
    } else if (addressId && person && service && !date) {
      setActiveTab("data");
    } else if (addressId && person && service && date) {
      setActiveTab("informacao");
    }
  }, []);
  const validateAndProceed = async () => {
    try {
      if (activeTab === "endereco" && !selectedAddress) {
        throw new Error("Por favor, selecione um endereço.");
      } else if (activeTab === "profissionais" && !selectedPerson) {
        throw new Error("Por favor, selecione uma pessoa.");
      } else if (activeTab === "servico" && !selectedService) {
        throw new Error("Por favor, selecione um serviço.");
      } else if (
        activeTab === "data" &&
        (!selectedCalendarDate?.start.dateTime ||
          !selectedCalendarDate?.end.dateTime)
      ) {
        throw new Error("Por favor, selecione um dia e uma hora.");
      }

      if (activeTab === "confirmacao") {
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
      // Move to next tab
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].id);
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

  const goToPreviousTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };
  return (
    <div className="flex flex-col w-full max-w-6xl h-screen rounded-lg shadow-lg overflow-hidden">
      <div className="relative shadow-xl h-[180px] overflow-hidden rounded-t-lg">
        {company?.design?.images?.banner?.url ? (
          <Image
            src={company.design.images.banner.url}
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

        <div className="absolute inset-0 bg-white opacity-15" />

        <div className="flex justify-center items-center h-full relative z-10">
          {brandLoading ? (
            <Skeleton className="w-[150px] h-[120px] rounded-md" />
          ) : company?.design?.images?.logo?.url ? (
            <div className="w-[150px] h-[120px] relative">
              <Image
                src={company.design.images.logo.url}
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
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <div className="flex justify-center mb-4 mt-2">
            <TabsList className="grid w-full max-w-4xl grid-cols-6 bg-white shadow-md">
              {tabs.map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="text-xs md:text-sm font-medium"
                  style={{
                    backgroundColor:
                      activeTab === tab.id
                        ? company?.design?.colors?.primary
                        : undefined,
                    color: activeTab === tab.id ? "white" : undefined,
                  }}
                >
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <Separator className="my-2" />

          <div className="flex-1 overflow-hidden">
            {tabs.map(tab => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="flex-1 bg-white p-4 rounded-lg shadow-md overflow-y-auto h-full"
              >
                {tab.component}
              </TabsContent>
            ))}
          </div>

          <div className="mt-auto flex justify-between p-2">
            <Button
              onClick={goToPreviousTab}
              disabled={activeTab === tabs[0].id}
              variant="outline"
            >
              Anterior
            </Button>
            <Button
              onClick={validateAndProceed}
              style={{
                backgroundColor: company?.design?.colors?.primary,
                color: "white",
              }}
            >
              {activeTab === "confirmacao" ? "Finalizar" : "Próximo"}
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Wizard;
