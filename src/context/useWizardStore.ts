// store/useWizardStore.ts
import { create } from "zustand";

// Definindo a tipagem da store
interface WizardStore {
  currentStep: number;
  selectedAddress: string | null;
  setSelectedAddress: (address: string) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export const useWizardStore = create<WizardStore>(set => ({
  currentStep: 1,
  selectedAddress: null,
  setSelectedAddress: address => set({ selectedAddress: address }),
  setCurrentStep: step => set({ currentStep: step }),
  nextStep: () => set(state => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set(state => ({ currentStep: state.currentStep - 1 })),
}));
