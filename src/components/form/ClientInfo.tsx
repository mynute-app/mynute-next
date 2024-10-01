import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ClientInfoForm() {
  return (
    <form className="w-full max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg space-y-4">
      {/* E-mail and Phone Fields */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* E-mail Field */}
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
          />
        </div>

        {/* Phone Field */}
        <div className="flex flex-col w-full">
          <Label htmlFor="phone" className="font-semibold">
            Telefone <span className="text-red-500">*</span>
          </Label>
          <div className="flex mt-2">
            {/* Dropdown for Country Code */}
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
            />
          </div>
        </div>
      </div>

      {/* Full Name Field */}
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
        />
      </div>

      {/* Warning Message */}
      <div className="mt-4">
        <Label className="font-semibold">Aviso:</Label>
        <p className="text-sm text-gray-600">
          Ao informar seu e-mail e número de telefone corretamente, você
          receberá lembrete desse agendamento.
        </p>
      </div>
    </form>
  );
}
