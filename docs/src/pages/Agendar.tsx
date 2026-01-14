import { useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingHeader } from "@/components/booking/BookingHeader";
import { BookingProgress } from "@/components/booking/BookingProgress";
import { BranchSelection } from "@/components/booking/BranchSelection";
import { ServiceSelection } from "@/components/booking/ServiceSelection";
import { StaffSelection } from "@/components/booking/StaffSelection";
import { DateTimeSelection } from "@/components/booking/DateTimeSelection";
import { CustomerForm } from "@/components/booking/CustomerForm";
import { BookingConfirmation } from "@/components/booking/BookingConfirmation";
import { toast } from "@/hooks/use-toast";

// Mock data - filiais
const mockBranches = [
  {
    id: "1",
    name: "Unidade Centro",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    workingHoursSummary: "Seg-Sex 08h-18h, Sáb 09h-14h",
  },
  {
    id: "2",
    name: "Unidade Shopping",
    address: "Shopping Center, Loja 45",
    city: "São Paulo",
    state: "SP",
    workingHoursSummary: "Seg-Dom 10h-22h",
  },
  {
    id: "3",
    name: "Unidade Zona Sul",
    address: "Av. Santo Amaro, 789",
    city: "São Paulo",
    state: "SP",
    workingHoursSummary: "Seg-Sex 09h-19h, Sáb 09h-15h",
  },
];

// Mock data - serviços (filtrados por filial)
const mockServicesByBranch: Record<string, typeof mockServicesBase> = {
  "1": [
    { id: "1", name: "Corte de Cabelo", description: "Corte masculino ou feminino", duration: 45, price: 50, category: "Cabelo" },
    { id: "2", name: "Barba", description: "Aparar e modelar a barba", duration: 30, price: 35, category: "Barba" },
    { id: "3", name: "Corte + Barba", description: "Combo completo", duration: 60, price: 75, category: "Combos" },
  ],
  "2": [
    { id: "1", name: "Corte de Cabelo", description: "Corte masculino ou feminino", duration: 45, price: 50, category: "Cabelo" },
    { id: "6", name: "Manicure", description: "Tratamento completo das unhas", duration: 45, price: 40, category: "Unhas" },
    { id: "7", name: "Pedicure", description: "Tratamento completo dos pés", duration: 60, price: 50, category: "Unhas" },
  ],
  "3": [
    { id: "1", name: "Corte de Cabelo", description: "Corte masculino ou feminino", duration: 45, price: 50, category: "Cabelo" },
    { id: "2", name: "Barba", description: "Aparar e modelar a barba", duration: 30, price: 35, category: "Barba" },
  ],
};

const mockServicesBase = [
  { id: "1", name: "Corte de Cabelo", description: "Corte masculino ou feminino", duration: 45, price: 50, category: "Cabelo" },
];

// Mock data - equipe (filtrada por filial)
const mockStaffByBranch: Record<string, typeof mockStaffBase> = {
  "1": [
    { id: "1", name: "Carlos Silva", role: "Barbeiro Senior", rating: 4.9 },
    { id: "2", name: "Ana Costa", role: "Cabeleireira", rating: 4.8 },
  ],
  "2": [
    { id: "3", name: "Pedro Santos", role: "Barbeiro", rating: 4.7 },
    { id: "4", name: "Maria Oliveira", role: "Manicure", rating: 4.9 },
  ],
  "3": [
    { id: "1", name: "Carlos Silva", role: "Barbeiro Senior", rating: 4.9 },
  ],
};

const mockStaffBase = [
  { id: "1", name: "Carlos Silva", role: "Barbeiro Senior", rating: 4.9 },
];

interface CustomerData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const STEPS = ["Filial", "Serviço", "Profissional", "Horário", "Dados", "Confirmação"];

const Agendar = () => {
  const { branchSlug } = useParams<{ branchSlug?: string }>();
  
  // Se veio por URL direta, pular etapa de filial
  const initialBranchId = branchSlug ? mockBranches.find(b => 
    b.name.toLowerCase().replace(/\s+/g, '-').includes(branchSlug.toLowerCase())
  )?.id || null : null;
  
  const skipBranchStep = !!initialBranchId;
  
  const [currentStep, setCurrentStep] = useState(skipBranchStep ? 2 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Booking state
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(initialBranchId);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    phone: "",
    email: "",
    notes: ""
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CustomerData, string>>>({});

  // Dados filtrados por filial
  const currentServices = selectedBranchId ? (mockServicesByBranch[selectedBranchId] || []) : [];
  const currentStaff = selectedBranchId ? (mockStaffByBranch[selectedBranchId] || []) : [];

  const selectedBranch = mockBranches.find(b => b.id === selectedBranchId);
  const selectedService = currentServices.find(s => s.id === selectedServiceId);
  const selectedStaff = currentStaff.find(s => s.id === selectedStaffId);

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!selectedBranchId) {
          toast({ title: "Selecione uma filial", variant: "destructive" });
          return false;
        }
        return true;
      case 2:
        if (!selectedServiceId) {
          toast({ title: "Selecione um serviço", variant: "destructive" });
          return false;
        }
        return true;
      case 3:
        if (!selectedStaffId) {
          toast({ title: "Selecione um profissional", variant: "destructive" });
          return false;
        }
        return true;
      case 4:
        if (!selectedDate || !selectedTime) {
          toast({ title: "Selecione data e horário", variant: "destructive" });
          return false;
        }
        return true;
      case 5:
        const errors: Partial<Record<keyof CustomerData, string>> = {};
        if (!customerData.name.trim()) errors.name = "Nome é obrigatório";
        if (!customerData.phone.trim()) errors.phone = "Telefone é obrigatório";
        if (customerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
          errors.email = "E-mail inválido";
        }
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
          toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (currentStep === 5) {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitting(false);
      setCurrentStep(6);
      toast({
        title: "Agendamento confirmado!",
        description: "Você receberá uma confirmação por WhatsApp.",
      });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > (skipBranchStep ? 2 : 1)) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 1: return !!selectedBranchId;
      case 2: return !!selectedServiceId;
      case 3: return !!selectedStaffId;
      case 4: return !!selectedDate && !!selectedTime;
      case 5: return !!customerData.name.trim() && !!customerData.phone.trim();
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BranchSelection
            branches={mockBranches}
            selectedBranchId={selectedBranchId}
            onSelect={setSelectedBranchId}
          />
        );
      case 2:
        return (
          <ServiceSelection
            services={currentServices}
            selectedServiceId={selectedServiceId}
            onSelect={setSelectedServiceId}
          />
        );
      case 3:
        return (
          <StaffSelection
            staff={currentStaff}
            selectedStaffId={selectedStaffId}
            onSelect={setSelectedStaffId}
            allowSkip={true}
          />
        );
      case 4:
        return (
          <DateTimeSelection
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectDate={setSelectedDate}
            onSelectTime={setSelectedTime}
          />
        );
      case 4:
        return (
          <CustomerForm
            data={customerData}
            onChange={setCustomerData}
            errors={formErrors}
          />
        );
      case 5:
        return (
          <BookingConfirmation
            booking={{
              serviceName: selectedService?.name || "",
              servicePrice: selectedService?.price || 0,
              serviceDuration: selectedService?.duration || 0,
              staffName: selectedStaffId === "any" ? "Primeiro disponível" : (selectedStaff?.name || ""),
              date: selectedDate!,
              time: selectedTime!,
              customerName: customerData.name,
              customerPhone: customerData.phone,
              customerEmail: customerData.email,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <BookingHeader />
      
      {currentStep < 5 && (
        <BookingProgress currentStep={currentStep} steps={STEPS} />
      )}
      
      <main className="max-w-2xl mx-auto px-4 pb-32">
        <div className="animate-in">
          {renderStep()}
        </div>
      </main>

      {/* Fixed bottom navigation */}
      {currentStep < 5 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t p-4 safe-area-bottom">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={!canGoNext() || isSubmitting}
              className="flex-1 btn-gradient"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirmando...
                </>
              ) : currentStep === 4 ? (
                "Confirmar Agendamento"
              ) : (
                <>
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      
      {/* New booking button on confirmation */}
      {currentStep === 5 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t p-4 safe-area-bottom">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={() => {
                setCurrentStep(1);
                setSelectedServiceId(null);
                setSelectedStaffId(null);
                setSelectedDate(null);
                setSelectedTime(null);
                setCustomerData({ name: "", phone: "", email: "", notes: "" });
              }}
              variant="outline"
              className="w-full"
            >
              Fazer Novo Agendamento
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agendar;
