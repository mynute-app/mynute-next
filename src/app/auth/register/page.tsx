import RegisterForm from "../_components/register-form";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen container mx-auto bg-slate-300 flex-col lg:flex-row justify-center items-center">
      {/* Lado esquerdo: Banner */}
      <div className="flex flex-col justify-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-[#1a2b47] md:text-5xl lg:text-6xl">
          Crie seu próprio calendário de reservas
        </h1>
        <p className="text-lg text-gray-600">
          Agende compromissos, gerencie seu calendário e aceite pagamentos em
          qualquer lugar, com software de reserva online gratuito.
        </p>
      </div>

      {/* Lado direito: Formulário */}
      <div className="w-full flex flex-col justify-center items-center p-10">
        <RegisterForm />
      </div>
    </div>
  );
}
