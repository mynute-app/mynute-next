/**
 * Types e enums para o fluxo de agendamento
 * Seguindo princípios SOLID e Clean Code
 */

import type { Service } from "../../../../../types/company";

/**
 * Enum para os passos do fluxo de agendamento
 */
export enum BookingStep {
  SERVICE_SELECTION = "service-selection",
  DATETIME_SELECTION = "datetime-selection",
  CHOICE_SELECTION = "choice-selection", // Escolher entre Local ou Profissional
  EMPLOYEE_SELECTION = "employee-selection",
  BRANCH_SELECTION = "branch-selection",
  CLIENT_FORM = "client-form",
  CONFIRMATION = "confirmation",
}

/**
 * Tipo para indicar qual escolha o cliente fez primeiro
 */
export enum FirstChoice {
  NONE = "none",
  EMPLOYEE = "employee",
  BRANCH = "branch",
}

/**
 * Interface para informações de filial
 */
export interface BranchInfo {
  id: string;
  name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  design?: {
    images?: {
      profile?: {
        url: string;
        alt: string;
      };
    };
  };
}

/**
 * Interface para informações de funcionário
 */
export interface EmployeeInfo {
  id: string;
  name: string;
  surname: string;
  meta?: {
    design?: {
      images?: {
        profile?: {
          url: string;
          alt: string;
        };
      };
    };
  };
}

/**
 * Interface para slot de horário
 */
export interface TimeSlot {
  time: string;
  employees: string[];
  available: boolean;
}

/**
 * Interface para data disponível
 */
export interface AvailableDate {
  date: string;
  branch_id: string;
  time_slots: TimeSlot[];
}

/**
 * Interface para dados de disponibilidade
 */
export interface AvailabilityData {
  available_dates: AvailableDate[];
  employee_info: EmployeeInfo[];
  branch_info: BranchInfo[];
}

/**
 * Interface para slot selecionado pelo usuário
 */
export interface SelectedSlot {
  date: string;
  time: string;
  branchId: string;
  employeeId: string;
}

/**
 * Interface para dados do cliente
 */
export interface ClientData {
  name: string;
  email: string;
  phone: string;
}

/**
 * Interface principal do estado do booking
 */
export interface BookingState {
  // Passo atual
  currentStep: BookingStep;

  // Serviço selecionado
  selectedService: Service | null;

  // Data e hora selecionadas
  selectedDate: string | null;
  selectedTime: string | null;

  // Primeira escolha (funcionário ou local)
  firstChoice: FirstChoice;

  // Funcionário selecionado
  selectedEmployeeId: string | null;

  // Local selecionado
  selectedBranchId: string | null;

  // Dados do cliente
  clientData: ClientData | null;

  // Dados de disponibilidade
  availabilityData: AvailabilityData | null;

  // Loading states
  isLoadingAvailability: boolean;
  isCreatingAppointment: boolean;

  // Error states
  error: string | null;
}

/**
 * Interface para ações do booking
 */
export interface BookingActions {
  // Navegação
  goToStep: (step: BookingStep) => void;
  goBack: () => void;
  reset: () => void;

  // Seleções
  selectService: (service: Service, availabilityData: AvailabilityData) => void;
  selectDateTime: (date: string, time: string, branchId: string) => void;
  selectFirstChoice: (choice: FirstChoice) => void;
  selectEmployee: (employeeId: string) => void;
  selectBranch: (branchId: string) => void;
  submitClientData: (data: ClientData) => void;

  // Confirmação
  confirmAppointment: () => Promise<void>;
}

/**
 * Interface completa do contexto de booking
 */
export interface BookingContextType extends BookingState, BookingActions {}
