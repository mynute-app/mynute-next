"use client";

/**
 * BookingOrchestrator - Componente orquestrador do novo fluxo de agendamento
 * Gerencia a transição entre os diferentes steps do booking
 */

import { useBooking, BookingStep } from "./booking";
import { BookingBreadcrumbs } from "./booking/shared/BookingBreadcrumbs";
import { AppointmentBookingNew } from "./appointment-booking-new";
import { ChoiceSelection } from "./booking/steps/ChoiceSelection";
import { EmployeeSelectionStep } from "./booking/steps/EmployeeSelectionStep";
import { BranchSelectionStep } from "./booking/steps/BranchSelectionStep";
import { ClientDetailsForm } from "./client-details-form";
import { AppointmentConfirmation } from "./appointment-confirmation";
import type { Service } from "../../../../types/company";

interface BookingOrchestratorProps {
  service: Service;
  onBack: () => void;
  brandColor?: string;
  initialAvailabilityData?: any;
}

export function BookingOrchestrator({
  service,
  onBack,
  brandColor,
  initialAvailabilityData,
}: BookingOrchestratorProps) {
  const {
    currentStep,
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

  // Renderizar breadcrumbs em todos os steps (exceto SERVICE_SELECTION)
  const showBreadcrumbs = currentStep !== BookingStep.SERVICE_SELECTION;

  return (
    <div className="space-y-4">
      {/* Breadcrumbs de progresso */}
      {showBreadcrumbs && (
        <BookingBreadcrumbs
          currentStep={currentStep}
          firstChoice={firstChoice}
          brandColor={brandColor}
        />
      )}

      {/* Renderizar step atual */}
      {renderCurrentStep()}
    </div>
  );

  function renderCurrentStep() {
    // Step 1: Seleção de Data/Hora (sempre após serviço)
    if (
      currentStep === BookingStep.SERVICE_SELECTION ||
      currentStep === BookingStep.DATETIME_SELECTION
    ) {
      return (
        <AppointmentBookingNew
          service={service}
          onBack={onBack}
          brandColor={brandColor}
          initialAvailabilityData={initialAvailabilityData || availabilityData}
        />
      );
    }

    // Step 2: Escolha entre Local ou Profissional
    if (currentStep === BookingStep.CHOICE_SELECTION) {
      return (
        <ChoiceSelection
          onChoice={selectFirstChoice}
          onBack={goBack}
          brandColor={brandColor}
        />
      );
    }

    // Step 3a: Seleção de Funcionário
    if (currentStep === BookingStep.EMPLOYEE_SELECTION) {
      if (!selectedDate || !selectedTime) return null;

      // Priorizar availabilityData (atualizado) ao invés do initialAvailabilityData (3 dias)
      const availability = availabilityData || initialAvailabilityData;
      if (!availability) return null;

      // Obter funcionários disponíveis para o horário
      const dateData = availability.available_dates.find(
        (d: any) => d.date === selectedDate
      );
      const timeSlot = dateData?.time_slots.find(
        (t: any) => t.time === selectedTime
      );
      const availableEmployeeIds = timeSlot?.employees || [];

      return (
        <EmployeeSelectionStep
          employees={availability.employee_info}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedBranchId={selectedBranchId}
          availableEmployeeIds={availableEmployeeIds}
          onEmployeeSelect={selectEmployee}
          onBack={goBack}
          brandColor={brandColor}
        />
      );
    }

    // Step 3b: Seleção de Local
    if (currentStep === BookingStep.BRANCH_SELECTION) {
      if (!selectedDate || !selectedTime) return null;

      const availability = availabilityData || initialAvailabilityData;
      if (!availability) return null;

      return (
        <BranchSelectionStep
          branches={availability.branch_info}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedEmployeeId={selectedEmployeeId}
          onBranchSelect={selectBranch}
          onBack={goBack}
          brandColor={brandColor}
        />
      );
    }

    // Step 4: Formulário de dados do cliente
    if (currentStep === BookingStep.CLIENT_FORM) {
      if (
        !selectedDate ||
        !selectedTime ||
        !selectedBranchId ||
        !selectedEmployeeId
      )
        return null;

      const availability = availabilityData || initialAvailabilityData;
      if (!availability) return null;

      return (
        <ClientDetailsForm
          service={service}
          selectedSlot={{
            date: selectedDate,
            time: selectedTime,
            branchId: selectedBranchId,
            employeeId: selectedEmployeeId,
          }}
          branches={availability.branch_info}
          employees={availability.employee_info}
          brandColor={brandColor}
          onSubmit={submitClientData}
          onBack={goBack}
        />
      );
    }

    // Step 5: Confirmação
    if (currentStep === BookingStep.CONFIRMATION) {
      if (
        !selectedDate ||
        !selectedTime ||
        !selectedBranchId ||
        !selectedEmployeeId ||
        !clientData
      )
        return null;

      const availability = availabilityData || initialAvailabilityData;
      if (!availability) return null;

      return (
        <AppointmentConfirmation
          service={service}
          selectedSlot={{
            date: selectedDate,
            time: selectedTime,
            branchId: selectedBranchId,
            employeeId: selectedEmployeeId,
          }}
          clientData={clientData}
          branches={availability.branch_info}
          employees={availability.employee_info}
          brandColor={brandColor}
          onConfirm={confirmAppointment}
          onBack={goBack}
          loading={isCreatingAppointment}
          error={error}
        />
      );
    }

    return null;
  }
}
