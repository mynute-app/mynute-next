"use client";

/**
 * BookingFlow - Componente principal que orquestra o fluxo de agendamento
 * Responsável por renderizar o step correto baseado no estado
 */

import { useBooking } from "./BookingProvider";
import { BookingStep, FirstChoice } from "./types";
import { ChoiceSelection } from "./steps/ChoiceSelection";
import { EmployeeSelectionStep } from "./steps/EmployeeSelectionStep";
import { BranchSelectionStep } from "./steps/BranchSelectionStep";

// Importar componentes existentes (adaptados)
import { AppointmentBooking } from "../appointment-booking-hybrid";
import { ClientDetailsForm } from "../client-details-form";
import { AppointmentConfirmation } from "../appointment-confirmation";

interface BookingFlowProps {
  brandColor?: string;
  companyId?: string;
}

export function BookingFlow({ brandColor, companyId }: BookingFlowProps) {
  const {
    currentStep,
    selectedService,
    selectedDate,
    selectedTime,
    selectedBranchId,
    selectedEmployeeId,
    firstChoice,
    availabilityData,
    clientData,
    goBack,
    selectFirstChoice,
    selectEmployee,
    selectBranch,
    submitClientData,
    confirmAppointment,
    isCreatingAppointment,
    error,
  } = useBooking();

  // Renderizar o step correto
  switch (currentStep) {
    case BookingStep.SERVICE_SELECTION:
      // Este step é renderizado pelo ServiceList
      return null;

    case BookingStep.DATETIME_SELECTION:
      // Este step é renderizado pelo AppointmentBooking (parte de seleção de horário)
      if (!selectedService || !availabilityData) return null;

      return (
        <AppointmentBooking
          service={selectedService}
          onBack={goBack}
          brandColor={brandColor}
          initialAvailabilityData={availabilityData}
        />
      );

    case BookingStep.CHOICE_SELECTION:
      // Novo step: escolher entre Local ou Profissional
      return (
        <ChoiceSelection
          onChoice={selectFirstChoice}
          onBack={goBack}
          brandColor={brandColor}
        />
      );

    case BookingStep.EMPLOYEE_SELECTION:
      // Seleção de funcionário
      if (!selectedDate || !selectedTime || !availabilityData) return null;

      // Obter funcionários disponíveis para o horário
      const dateData = availabilityData.available_dates.find(
        d => d.date === selectedDate
      );
      const timeSlot = dateData?.time_slots.find(t => t.time === selectedTime);
      const availableEmployeeIds = timeSlot?.employees || [];

      return (
        <EmployeeSelectionStep
          employees={availabilityData.employee_info}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedBranchId={
            firstChoice === FirstChoice.BRANCH ? selectedBranchId : null
          }
          availableEmployeeIds={availableEmployeeIds}
          onEmployeeSelect={selectEmployee}
          onBack={goBack}
          brandColor={brandColor}
        />
      );

    case BookingStep.BRANCH_SELECTION:
      // Seleção de local
      if (!selectedDate || !selectedTime || !availabilityData) return null;

      return (
        <BranchSelectionStep
          branches={availabilityData.branch_info}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedEmployeeId={
            firstChoice === FirstChoice.EMPLOYEE ? selectedEmployeeId : null
          }
          onBranchSelect={selectBranch}
          onBack={goBack}
          brandColor={brandColor}
        />
      );

    case BookingStep.CLIENT_FORM:
      // Formulário de dados do cliente
      if (
        !selectedService ||
        !selectedDate ||
        !selectedTime ||
        !selectedBranchId ||
        !selectedEmployeeId ||
        !availabilityData
      )
        return null;

      return (
        <ClientDetailsForm
          service={selectedService}
          selectedSlot={{
            date: selectedDate,
            time: selectedTime,
            branchId: selectedBranchId,
            employeeId: selectedEmployeeId,
          }}
          branches={availabilityData.branch_info}
          employees={availabilityData.employee_info}
          brandColor={brandColor}
          onSubmit={submitClientData}
          onBack={goBack}
        />
      );

    case BookingStep.CONFIRMATION:
      // Confirmação final
      if (
        !selectedService ||
        !selectedDate ||
        !selectedTime ||
        !selectedBranchId ||
        !selectedEmployeeId ||
        !clientData ||
        !availabilityData
      )
        return null;

      return (
        <AppointmentConfirmation
          service={selectedService}
          selectedSlot={{
            date: selectedDate,
            time: selectedTime,
            branchId: selectedBranchId,
            employeeId: selectedEmployeeId,
          }}
          clientData={clientData}
          branches={availabilityData.branch_info}
          employees={availabilityData.employee_info}
          brandColor={brandColor}
          onConfirm={confirmAppointment}
          onBack={goBack}
          loading={isCreatingAppointment}
          error={error}
        />
      );

    default:
      return null;
  }
}
