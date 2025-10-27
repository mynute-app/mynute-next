/**
 * Barrel export para o módulo de booking
 * Facilita imports e mantém a organização
 */

export { BookingProvider, useBooking } from "./BookingProvider";
export { BookingFlow } from "./BookingFlow";
export { BookingStep, FirstChoice } from "./types";
export type {
  BookingState,
  BookingActions,
  BookingContextType,
  BranchInfo,
  EmployeeInfo,
  TimeSlot,
  AvailableDate,
  AvailabilityData,
  SelectedSlot,
  ClientData,
} from "./types";
