import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/context/useWizardStore";

export default function ClientInfoForm() {
  const { clientInfo, setClientInfo } = useWizardStore(); // Pegando Zustand normalmente

  const handleChange = (field: keyof typeof clientInfo, value: string) => {
    setClientInfo({ [field]: value });
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col w-full">
          <Label htmlFor="email" className="font-semibold">
            E-mail <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Digite seu e-mail"
            className="mt-2"
            required
            value={clientInfo.email} // Pegando do Zustand
            onChange={e => handleChange("email", e.target.value)}
          />
        </div>

        <div className="flex flex-col w-full">
          <Label htmlFor="phone" className="font-semibold">
            Telefone <span className="text-red-500">*</span>
          </Label>
          <div className="flex mt-2">
            <Button variant="outline" className="mr-2">
              <span role="img" aria-label="Brazil Flag">
                🇧🇷
              </span>
            </Button>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 96123-4567"
              required
              value={clientInfo.phone} // Pegando do Zustand
              onChange={e => handleChange("phone", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <Label htmlFor="fullName" className="font-semibold">
          Nome completo <span className="text-red-500">*</span>
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Digite seu nome completo"
          className="mt-2"
          required
          value={clientInfo.fullName} // Pegando do Zustand
          onChange={e => handleChange("fullName", e.target.value)}
        />
      </div>
    </div>
  );
}
