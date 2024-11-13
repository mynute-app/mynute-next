// store/useWizardStore.ts
import { create } from "zustand";

// Definindo a tipagem da store
interface WizardStore {
  currentStep: number;
  selectedAddress: string | null;
  selectedPerson: string | null;
  selectedService: string | null;
  selectedDate: Date | null;
  selectedBusiness: string | null; // Adicionado
  setSelectedAddress: (address: string) => void;
  setSelectedPerson: (person: string) => void;
  setSelectedService: (service: string) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedBusiness: (business: string) => void; // Adicionado
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export const useWizardStore = create<WizardStore>(set => ({
  currentStep: 1,
  selectedAddress: null,
  selectedPerson: null,
  selectedService: null,
  selectedDate: null,
  selectedBusiness: null, // Inicializado
  setSelectedAddress: address => set({ selectedAddress: address }),
  setSelectedPerson: person => set({ selectedPerson: person }),
  setSelectedService: service => set({ selectedService: service }),
  setSelectedDate: date => set({ selectedDate: date }),
  setSelectedBusiness: business => set({ selectedBusiness: business }), // Função adicionada
  setCurrentStep: step => set({ currentStep: step }),
  nextStep: () => set(state => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set(state => ({ currentStep: state.currentStep - 1 })),
}));
