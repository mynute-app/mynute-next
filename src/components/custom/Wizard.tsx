"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

function Step1() {
  return <div>Componente para o Passo 1: Selecione o endereço</div>;
}

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
  { id: 1, title: "Selecione o endereço" },
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
        return <Step1 />;
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
    <div className="flex w-full max-w-6xl h-5/6 rounded-lg shadow-lg">
      <div className="w-64 bg-white shadow-xl">
        <div className="p-4">
          <div className="flex justify-center items-center my-4">
            <Image src="/placeholder.svg" width={130} height={100} alt="Logo" />
          </div>
          <ul>
            {steps.map((step) => (
              <li
                key={step.id}
                className={`flex items-center mb-4 ${
                  step.id === currentStep
                    ? "text-primary font-semibold"
                    : step.id < currentStep
                    ? "text-primary"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center ${
                    step.id <= currentStep ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckIcon className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-sm">{step.id}</span>
                  )}
                </div>
                {step.title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">
          {steps[currentStep - 1].title}
        </h1>
        <Separator className="my-4" />
        <div className="flex-1 bg-white p-6 rounded-lg shadow-md mb-4">
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