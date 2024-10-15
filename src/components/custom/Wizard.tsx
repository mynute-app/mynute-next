"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { useWizardStore } from "@/context/useWizardStore";
import {
  addressSchema,
  personSchema,
  serviceSchema,
} from "../../../validations/validation";
import { AddressStep } from "../form/Address";
import { PersonStep } from "../form/Person";
import { ServiceStep } from "../form/Service";
import { CardCalendar } from "./Card-Calendar";
import { CardInformation } from "./Customer-Information";
import { CustomAlertDialog } from "../dashboard/Custom-Alert-Dialog";
import BrandDetailsForm from "../form/Enterprise";

const steps = [
  { id: 0, title: "Apresentação" },
  { id: 1, title: "Endereço" },
  { id: 2, title: "Profissionais" },
  { id: 3, title: "Serviço" },
  { id: 4, title: "Data e Hora" },
  { id: 5, title: "Informação" },
  { id: 6, title: "Confirmação" },
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
    selectedDate,
  } = useWizardStore();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const addressId = params.get("addressId");
    const person = params.get("person");
    const service = params.get("service");
    const date = params.get("date");

    if (addressId && !person) {
      setCurrentStep(2);
    } else if (addressId && person && !service) {
      setCurrentStep(3);
    } else if (addressId && person && service && !date) {
      setCurrentStep(4);
    } else if (addressId && person && service && date) {
      setCurrentStep(5);
    } else {
      setCurrentStep(0);
    }
  }, [setCurrentStep]);

  const renderStepContent = (): JSX.Element | null => {
    switch (currentStep) {
      case 0:
        return <BrandDetailsForm />;
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

  const validateAndProceed = () => {
    try {
      if (currentStep === 1) {
        addressSchema.parse({ selectedAddress });
      } else if (currentStep === 2) {
        personSchema.parse({ selectedPerson });
      } else if (currentStep === 3) {
        serviceSchema.parse({ selectedService });
      }
      setError("");
      nextStep();
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
      }
    }
  };

  return (
    <div className="flex flex-col w-full max-w-6xl h-screen rounded-lg shadow-lg overflow-hidden">
      {/* <div className="relative bg-cover bg-center shadow-xl p-4">
        <div className="absolute inset-0 bg-black opacity-10"></div>

        <div className="flex justify-center items-center my-4 relative z-10">
          <Image src="/placeholder.svg" width={130} height={100} alt="Logo" />
        </div>
      </div> */}

      <div className="flex-1 flex flex-col p-4 bg-gray-100 overflow-hidden">
        {/* <div className="flex justify-center items-center my-6 ">
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
                      className={`flex items-center justify-center w-10 h-10 rounded-md border-2 border-white shadow-lg ${
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
                      <span className="text-lg font-semibold">{step.id}</span>
                    </li>
                    {step.id === currentStep && (
                      <h1 className="text-sm font-bold">
                        {steps[currentStep].title}
                      </h1>
                    )}
                  </div>
                );
              })}
          </ul>
        </div> */}

        <div className="flex justify-between items-center">
          <CustomAlertDialog />
        </div>
        <Separator className="my-4" />

        <div className="flex-1 bg-white p-6 rounded-lg shadow-md mb-4 overflow-y-auto">
          {renderStepContent()}
        </div>
        <div className="mt-auto flex justify-between ">
          <Button onClick={prevStep} disabled={currentStep === 0}>
            Anterior
          </Button>
          {error && <p className="text-red-500 text-center text-xs">{error}</p>}
          <Button
            onClick={validateAndProceed}
            disabled={currentStep === steps.length - 1}
          >
            {currentStep === steps.length - 1 ? "Finalizar" : "Próximo"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Wizard;
