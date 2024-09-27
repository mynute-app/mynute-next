"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Address } from "../form/Address";

function Step2() {
  return <div>Componente para o Passo 2: Profissionais</div>;
}

function Step3() {
  return <div>Componente para o Passo 3: Serviço</div>;
}

function Step4() {
  return <div>Componente para o Passo 4: Data e Hora</div>;
}

function Step5() {
  return <div>Componente para o Passo 5: Informação</div>;
}

function Step6() {
  return <div>Componente para o Passo 6: Confirmação</div>;
}

const steps = [
  { id: 1, title: "Endereço" },
  { id: 2, title: "Profissionais" },
  { id: 3, title: "Serviço" },
  { id: 4, title: "Data e Hora" },
  { id: 5, title: "Informação" },
  { id: 6, title: "Confirmação" },
];

export default function Wizard() {
  const [currentStep, setCurrentStep] = useState(1);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Address />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 />;
      case 5:
        return <Step5 />;
      case 6:
        return <Step6 />;
      default:
        return null;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-6xl h-screen rounded-lg shadow-lg overflow-hidden">
      {/* Seção com imagem de fundo */}
      <div
        className="relative bg-cover bg-center shadow-xl p-4"
        // style={{ backgroundImage: `url('/banner.webp')` }}
      >
        <div className="absolute inset-0 bg-black opacity-30"></div>

        <div className="flex justify-center items-center my-4 relative z-10">
          <Image src="/placeholder.svg" width={130} height={100} alt="Logo" />
        </div>
        <ul className="flex justify-center space-x-4 md:justify-between items-center relative z-10">
          <div
            className="hidden md:block absolute top-5 left-16 right-6 h-1 bg-gray-200"
            style={{ transform: "translateY(-10%)" }}
          />
          <div
            className="hidden md:block absolute top-5 left-12 right-6 h-1 bg-primary transition-all duration-500"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 90}%`,
              transform: "translateY(-10%)",
            }}
          />
          {steps.map(step => (
            <li
              key={step.id}
              className={`flex flex-col items-center z-40 ${
                step.id === currentStep
                  ? "text-primary font-semibold"
                  : step.id < currentStep
                  ? "text-primary"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                  step.id <= currentStep
                    ? "bg-primary text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                {step.id < currentStep ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <span className="text-sm">{step.id}</span>
                )}
              </div>
              <span className="hidden md:block text-xs md:text-sm">
                {step.title}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex flex-col p-4 bg-gray-100 overflow-hidden">
        <h1 className="text-2xl font-bold">{steps[currentStep - 1].title}</h1>
        <Separator className="my-4" />
        <div className="flex-1 bg-white p-6 rounded-lg shadow-md mb-4 overflow-y-auto">
          {renderStepContent()}
        </div>
        <div className="mt-auto flex justify-between">
          <Button onClick={prevStep} disabled={currentStep === 1}>
            Anterior
          </Button>
          <Button onClick={nextStep} disabled={currentStep === steps.length}>
            {currentStep === steps.length ? "Finalizar" : "Próximo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
