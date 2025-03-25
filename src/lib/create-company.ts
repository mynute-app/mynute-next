import { CompanyRegisterSchema } from "../../schema/company-register";

export const createCompany = async (data: CompanyRegisterSchema) => {
  const response = await fetch("/api/company", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const text = await response.text();
  let errorMessage = text;

  try {
    const json = JSON.parse(text);
    errorMessage = json?.backendResponse || json?.message || text;
  } catch {
    // se não for JSON, usa o texto mesmo
  }

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return JSON.parse(text);
};
