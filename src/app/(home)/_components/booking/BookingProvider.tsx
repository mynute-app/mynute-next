"use client";

/**
 * BookingProvider - Gerenciamento de estado do fluxo de agendamento
 * Seguindo princípios SOLID:
 * - Single Responsibility: Gerencia apenas o estado do booking
 * - Open/Closed: Extensível através de actions
 * - Liskov Substitution: Context pode ser substituído em testes
 * - Interface Segregation: Actions separadas por responsabilidade
 * - Dependency Inversion: Componentes dependem da interface, não da implementação
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import type { Service } from "../../../../../types/company";
import {
  BookingStep,
  FirstChoice,
  type BookingContextType,
  type BookingState,
  type AvailabilityData,
  type ClientData,
} from "./types";
import { useCreateAppointment } from "@/hooks/appointment/useCreateAppointment";
import { decodeJWTToken } from "@/utils/decode-jwt";

// Estado inicial
const initialState: BookingState = {
  currentStep: BookingStep.SERVICE_SELECTION,
  selectedService: null,
  selectedDate: null,
  selectedTime: null,
  firstChoice: FirstChoice.NONE,
  selectedEmployeeId: null,
  selectedBranchId: null,
  clientData: null,
  availabilityData: null,
  isLoadingAvailability: false,
  isCreatingAppointment: false,
  error: null,
};

// Actions types
type BookingAction =
  | { type: "GO_TO_STEP"; payload: BookingStep }
  | { type: "GO_BACK" }
  | { type: "RESET" }
  | {
      type: "SELECT_SERVICE";
      payload: { service: Service; availabilityData: AvailabilityData };
    }
  | {
      type: "SELECT_DATETIME";
      payload: { date: string; time: string; branchId: string };
    }
  | { type: "SELECT_FIRST_CHOICE"; payload: FirstChoice }
  | { type: "SELECT_EMPLOYEE"; payload: string }
  | { type: "SELECT_BRANCH"; payload: string }
  | { type: "SUBMIT_CLIENT_DATA"; payload: ClientData }
  | { type: "UPDATE_AVAILABILITY_DATA"; payload: AvailabilityData }
  | { type: "SET_LOADING_AVAILABILITY"; payload: boolean }
  | { type: "SET_CREATING_APPOINTMENT"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

// Reducer
function bookingReducer(
  state: BookingState,
  action: BookingAction
): BookingState {
  switch (action.type) {
    case "GO_TO_STEP":
      return { ...state, currentStep: action.payload };

    case "GO_BACK":
      // Lógica de navegação reversa baseada no fluxo
      const stepOrder = getStepOrder(state);
      const currentIndex = stepOrder.indexOf(state.currentStep);
      const previousStep =
        currentIndex > 0 ? stepOrder[currentIndex - 1] : state.currentStep;
      return { ...state, currentStep: previousStep };

    case "RESET":
      return initialState;

    case "SELECT_SERVICE":
      return {
        ...state,
        selectedService: action.payload.service,
        availabilityData: action.payload.availabilityData,
        currentStep: BookingStep.DATETIME_SELECTION,
      };

    case "SELECT_DATETIME":
      return {
        ...state,
        selectedDate: action.payload.date,
        selectedTime: action.payload.time,
        selectedBranchId: action.payload.branchId,
        currentStep: BookingStep.CHOICE_SELECTION,
      };

    case "SELECT_FIRST_CHOICE":
      return {
        ...state,
        firstChoice: action.payload,
        currentStep:
          action.payload === FirstChoice.EMPLOYEE
            ? BookingStep.EMPLOYEE_SELECTION
            : BookingStep.BRANCH_SELECTION,
      };

    case "SELECT_EMPLOYEE":
      return {
        ...state,
        selectedEmployeeId: action.payload,
        // Se já escolheu o funcionário, vai para seleção de local (se necessário)
        currentStep:
          state.firstChoice === FirstChoice.EMPLOYEE
            ? BookingStep.BRANCH_SELECTION
            : BookingStep.CLIENT_FORM,
      };

    case "SELECT_BRANCH":
      return {
        ...state,
        selectedBranchId: action.payload,
        // Se já escolheu o local, vai para seleção de funcionário (se necessário)
        currentStep:
          state.firstChoice === FirstChoice.BRANCH
            ? BookingStep.EMPLOYEE_SELECTION
            : BookingStep.CLIENT_FORM,
      };

    case "SUBMIT_CLIENT_DATA":
      return {
        ...state,
        clientData: action.payload,
        currentStep: BookingStep.CONFIRMATION,
      };

    case "UPDATE_AVAILABILITY_DATA":
      return {
        ...state,
        availabilityData: action.payload,
      };

    case "SET_LOADING_AVAILABILITY":
      return { ...state, isLoadingAvailability: action.payload };

    case "SET_CREATING_APPOINTMENT":
      return { ...state, isCreatingAppointment: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

// Helper para determinar ordem dos steps baseado no fluxo escolhido
function getStepOrder(state: BookingState): BookingStep[] {
  const baseOrder = [
    BookingStep.SERVICE_SELECTION,
    BookingStep.DATETIME_SELECTION,
    BookingStep.CHOICE_SELECTION,
  ];

  if (state.firstChoice === FirstChoice.EMPLOYEE) {
    return [
      ...baseOrder,
      BookingStep.EMPLOYEE_SELECTION,
      BookingStep.BRANCH_SELECTION,
      BookingStep.CLIENT_FORM,
      BookingStep.CONFIRMATION,
    ];
  } else if (state.firstChoice === FirstChoice.BRANCH) {
    return [
      ...baseOrder,
      BookingStep.BRANCH_SELECTION,
      BookingStep.EMPLOYEE_SELECTION,
      BookingStep.CLIENT_FORM,
      BookingStep.CONFIRMATION,
    ];
  }

  return baseOrder;
}

// Context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Provider Component
interface BookingProviderProps {
  children: React.ReactNode;
  companyId?: string;
  brandColor?: string;
  service?: Service; // Adicionar service como prop
}

export function BookingProvider({
  children,
  companyId,
  brandColor,
  service,
}: BookingProviderProps) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const { createAppointment } = useCreateAppointment();

  // Atualizar selectedService quando a prop service mudar
  React.useEffect(() => {
    if (service && !state.selectedService) {
      dispatch({
        type: "SELECT_SERVICE",
        payload: { service, availabilityData: state.availabilityData! },
      });
    }
  }, [service, state.selectedService, state.availabilityData]);

  // Actions
  const goToStep = useCallback((step: BookingStep) => {
    dispatch({ type: "GO_TO_STEP", payload: step });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: "GO_BACK" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const selectService = useCallback(
    (service: Service, availabilityData: AvailabilityData) => {
      dispatch({
        type: "SELECT_SERVICE",
        payload: { service, availabilityData },
      });
    },
    []
  );

  const selectDateTime = useCallback(
    (date: string, time: string, branchId: string) => {
      dispatch({ type: "SELECT_DATETIME", payload: { date, time, branchId } });
    },
    []
  );

  const selectFirstChoice = useCallback((choice: FirstChoice) => {
    dispatch({ type: "SELECT_FIRST_CHOICE", payload: choice });
  }, []);

  const selectEmployee = useCallback((employeeId: string) => {
    dispatch({ type: "SELECT_EMPLOYEE", payload: employeeId });
  }, []);

  const selectBranch = useCallback((branchId: string) => {
    dispatch({ type: "SELECT_BRANCH", payload: branchId });
  }, []);

  const submitClientData = useCallback((data: ClientData) => {
    dispatch({ type: "SUBMIT_CLIENT_DATA", payload: data });
  }, []);

  const updateAvailabilityData = useCallback((data: AvailabilityData) => {
    dispatch({ type: "UPDATE_AVAILABILITY_DATA", payload: data });
  }, []);

  const confirmAppointment = useCallback(async () => {
    dispatch({ type: "SET_CREATING_APPOINTMENT", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      console.log("🔍 DEBUG - Estado completo do booking:", {
        currentStep: state.currentStep,
        selectedService: state.selectedService,
        selectedDate: state.selectedDate,
        selectedTime: state.selectedTime,
        selectedBranchId: state.selectedBranchId,
        selectedEmployeeId: state.selectedEmployeeId,
        clientData: state.clientData,
      });

      // Pegar token do localStorage
      const clientToken = localStorage.getItem("client_token");

      if (!clientToken) {
        throw new Error(
          "Token de autenticação não encontrado. Faça login novamente."
        );
      }

      // Decodificar token para pegar client_id e company_id
      const userData = decodeJWTToken(clientToken);

      if (!userData || !userData.id) {
        throw new Error("Token inválido. Faça login novamente.");
      }

      console.log("👤 Dados do usuário do token:", userData);
      console.log("🏢 Company ID da prop:", companyId);

      // Usar company_id da prop (vem do contexto da empresa)
      // O company_id do token do cliente pode ser vazio (00000000...)
      const finalCompanyId = companyId || userData.company_id;

      if (
        !finalCompanyId ||
        finalCompanyId === "00000000-0000-0000-0000-000000000000"
      ) {
        throw new Error(
          "Company ID não encontrado. Entre em contato com o suporte."
        );
      }

      // Validar dados necessários
      if (!state.selectedService?.id) {
        throw new Error("Serviço não selecionado");
      }

      if (!state.selectedDate || !state.selectedTime) {
        throw new Error("Data e horário não selecionados");
      }

      if (!state.selectedBranchId) {
        throw new Error("Filial não selecionada");
      }

      if (!state.selectedEmployeeId) {
        throw new Error("Profissional não selecionado");
      }

      // Montar start_time no formato ISO 8601 UTC
      // state.selectedDate = "2025-11-20"
      // state.selectedTime = "18:00" ou "18:00:00"

      // Criar data/hora em São Paulo
      // Formato: "2025-11-20T18:00:00"
      const timeWithSeconds = state.selectedTime.padEnd(8, ":00");
      const dateTimeString = `${state.selectedDate}T${timeWithSeconds}`;

      // Criar Date especificando que é horário de São Paulo (BRT/BRST = UTC-3)
      // Adicionar -03:00 para indicar o timezone
      const dateTimeWithTZ = `${dateTimeString}-03:00`;
      const localDate = new Date(dateTimeWithTZ);

      // Converter para UTC (toISOString já faz isso automaticamente)
      const startTimeUTC = localDate.toISOString().replace(/\.\d{3}Z$/, "Z");

      console.log("📅 Conversão de horário:");
      console.log("  - Horário local (SP):", dateTimeString);
      console.log("  - Horário UTC:", startTimeUTC);

      console.log("🎯 Criando appointment com dados:", {
        branch_id: state.selectedBranchId,
        client_id: userData.id,
        company_id: finalCompanyId,
        employee_id: state.selectedEmployeeId,
        service_id: state.selectedService.id,
        start_time: startTimeUTC,
        time_zone: "America/Sao_Paulo",
      });

      const appointment = await createAppointment({
        branch_id: state.selectedBranchId,
        client_id: userData.id,
        company_id: finalCompanyId,
        employee_id: state.selectedEmployeeId,
        service_id: state.selectedService.id,
        start_time: startTimeUTC,
      });

      console.log("✅ Appointment criado com sucesso:", appointment);

      // TODO: Navegar para tela de sucesso ou resetar fluxo
      alert("Agendamento criado com sucesso!");
      dispatch({ type: "RESET" });
    } catch (error) {
      console.error("❌ Erro ao criar appointment:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error ? error.message : "Erro ao criar agendamento",
      });
    } finally {
      dispatch({ type: "SET_CREATING_APPOINTMENT", payload: false });
    }
  }, [state, createAppointment]);

  const value: BookingContextType = {
    ...state,
    companyId,
    brandColor,
    goToStep,
    goBack,
    reset,
    selectService,
    selectDateTime,
    selectFirstChoice,
    selectEmployee,
    selectBranch,
    submitClientData,
    updateAvailabilityData,
    confirmAppointment,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

// Hook customizado para usar o contexto
export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return context;
}
