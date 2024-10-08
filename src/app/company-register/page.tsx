"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const CompanyRegistrationForm = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    cnpj: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de envio dos dados da empresa
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">Cadastrar Empresa</h2>
      <div className="mb-4">
        <label htmlFor="companyName" className="block text-sm font-medium mb-1">
          Nome da Empresa
        </label>
        <Input
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Digite o nome da empresa"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="exemplo@email.com"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          Telefone
        </label>
        <Input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(XX) XXXXX-XXXX"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          Endereço
        </label>
        <Input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Rua, número, cidade, estado"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="cnpj" className="block text-sm font-medium mb-1">
          CNPJ
        </label>
        <Input
          name="cnpj"
          value={formData.cnpj}
          onChange={handleChange}
          placeholder="XX.XXX.XXX/XXXX-XX"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Descrição da Empresa
        </label>
        <textarea
          name="description"
          value={formData.description}
          placeholder="Descreva a empresa"
          className="w-full border rounded-lg p-2"
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
      >
        Cadastrar
      </Button>
    </form>
  );
};

export default CompanyRegistrationForm;
