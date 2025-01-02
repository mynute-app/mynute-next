import { create } from "zustand";

// Definindo a tipagem da store
interface CalendarEventDateTime {
  dateTime: string; // ISO String
  timeZone: string;
}

interface WizardStore {
  currentStep: number;
  selectedAddress: string | null;
  selectedPerson: string | null;
  selectedService: string | null;
  selectedCalendarDate: {
    start: CalendarEventDateTime;
    end: CalendarEventDateTime;
  } | null; // Apenas start e end
  selectedBusiness: string | null;
  setSelectedAddress: (address: string) => void;
  setSelectedPerson: (person: string) => void;
  setSelectedService: (service: string) => void;
  setSelectedCalendarDate: (date: {
    start: CalendarEventDateTime;
    end: CalendarEventDateTime;
  }) => void; // Atualiza start e end
  setSelectedBusiness: (business: string) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export const useWizardStore = create<WizardStore>(set => ({
  currentStep: 1,
  selectedBusiness: null,
  selectedAddress: null,
  selectedPerson: null,
  selectedService: null,
  selectedCalendarDate: null, // Apenas start e end
  setSelectedBusiness: business => set({ selectedBusiness: business }),
  setSelectedAddress: address => set({ selectedAddress: address }),
  setSelectedPerson: person => set({ selectedPerson: person }),
  setSelectedService: service => set({ selectedService: service }),
  setSelectedCalendarDate: date => set({ selectedCalendarDate: date }), // Recebe start e end
  setCurrentStep: step => set({ currentStep: step }),
  nextStep: () => set(state => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set(state => ({ currentStep: state.currentStep - 1 })),
}));
