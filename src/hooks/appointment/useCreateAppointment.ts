"use client";

import { useState } from "react";

export interface CreateAppointmentParams {
  branch_id: string;
  client_id: string;
  company_id: string;
  employee_id: string;
  service_id: string;
  start_time: string; // ISO 8601 format: "2028-01-01T09:00:00Z"
  // time_zone is hardcoded to "America/Sao_Paulo" - não precisa passar
}

export interface CreateAppointmentResponse {
  id: string;
  branch_id: string;
  client_id: string;
  company_id: string;
  employee_id: string;
  service_id: string;
  start_time: string;
  time_zone: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export const useCreateAppointment = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] =
    useState<CreateAppointmentResponse | null>(null);

  const createAppointment = async (params: CreateAppointmentParams) => {
    try {
      setLoading(true);
      setError(null);

      const { company_id } = params;

      // Sempre usar timezone de São Paulo
      const body = {
        branch_id: params.branch_id,
        client_id: params.client_id,
        company_id: params.company_id, // Manter no body também
        employee_id: params.employee_id,
        service_id: params.service_id,
        start_time: params.start_time,
        time_zone: "America/Sao_Paulo",
      };

      console.log("🔵 HOOK - Enviando para /api/appointment:");
      console.log("Headers:", { "X-Company-ID": company_id });
      console.log("Body:", JSON.stringify(body, null, 2));

      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Company-ID": company_id,
        },
        body: JSON.stringify(body),
      });

      console.log("🔵 HOOK - Resposta recebida:");
      console.log("Status:", res.status);
      console.log("OK:", res.ok);

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage =
          errorData?.error || errorData?.message || `Erro HTTP: ${res.status}`;
        throw new Error(errorMessage);
      }

      const data: CreateAppointmentResponse = await res.json();
      setAppointment(data);
      return data;
    } catch (e) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : "Erro desconhecido ao criar agendamento";
      setError(errorMessage);
      setAppointment(null);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAppointment(null);
    setError(null);
    setLoading(false);
  };

  return {
    appointment,
    loading,
    error,
    createAppointment,
    reset,
  };
};
