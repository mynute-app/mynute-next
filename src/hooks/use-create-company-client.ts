"use client";

import { useCallback, useState } from "react";
import type {
  CompanyClient,
  CreateCompanyClientInput,
} from "@/types/company-client";

interface UseCreateCompanyClientReturn {
  createdClient: CompanyClient | null;
  loading: boolean;
  error: string | null;
  createCompanyClient: (
    data: CreateCompanyClientInput
  ) => Promise<CompanyClient | null>;
  reset: () => void;
}

const formatPhoneToE164 = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (!cleaned) return "";
  if (cleaned.length >= 11) return `+${cleaned}`;
  return `+55${cleaned}`;
};

const normalizeClientPayload = (data: CreateCompanyClientInput) => ({
  name: data.name.trim(),
  surname: data.surname.trim(),
  email: data.email.trim(),
  phone: formatPhoneToE164(data.phone),
  street: data.street?.trim() || "",
  number: data.number?.trim() || "",
  neighborhood: data.neighborhood?.trim() || "",
  city: data.city?.trim() || "",
  state: data.state?.trim() || "",
  country: data.country?.trim() || "",
  zip_code: data.zip_code?.trim() || "",
});

export function useCreateCompanyClient(): UseCreateCompanyClientReturn {
  const [createdClient, setCreatedClient] = useState<CompanyClient | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCompanyClient = useCallback(
    async (data: CreateCompanyClientInput): Promise<CompanyClient | null> => {
      setLoading(true);
      setError(null);
      setCreatedClient(null);

      try {
        const payload = normalizeClientPayload(data);

        const response = await fetch("/api/company-client", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const responseText = await response.text();
        let responseData: any = null;

        try {
          responseData = responseText ? JSON.parse(responseText) : null;
        } catch {
          responseData = responseText;
        }

        if (!response.ok) {
          const errorMessage =
            responseData?.message ||
            responseData?.error ||
            responseText ||
            "Erro ao criar cliente";
          setError(errorMessage);
          return null;
        }

        setCreatedClient(responseData);
        return responseData as CompanyClient;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao conectar com o servidor";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setCreatedClient(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    createdClient,
    loading,
    error,
    createCompanyClient,
    reset,
  };
}
