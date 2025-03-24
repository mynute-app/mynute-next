import { CompanyRegisterSchema } from "../../schema/company-register";

export const createCompany = async (data: CompanyRegisterSchema) => {
  const response = await fetch("/api/company", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.message || "Erro ao criar empresa.");
  }

  return response.json();
};
