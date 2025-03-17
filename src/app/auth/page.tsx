import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdOutlineEmail } from "react-icons/md";

import { FcGoogle } from "react-icons/fc";
export default function Page() {
  return (
    <div className="container grid gap-12 py-8 md:grid-cols-2 md:py-16 mx-auto  place-items-center flex-grow min-h-[80vh] items-center justify-center">
      <div className="flex flex-col justify-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-[#1a2b47] md:text-5xl lg:text-6xl">
          Crie seu próprio calendário de reservas
        </h1>
        <p className="text-lg text-gray-600">
          Agende compromissos, gerencie seu calendário e aceite pagamentos em
          qualquer lugar, com software de reserva online gratuito.
        </p>
      </div>

      <div className="flex items-center justify-center ">
        <div className="flex items-center justify-center  ">
          <Card className="w-full max-w-md p-8 shadow-lg rounded-xl bg-white border border-gray-200  ">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Crie sua conta grátis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center py-5 border-gray-300 hover:border-gray-400 transition"
              >
                <FcGoogle className="mr-2 h-5 w-5" /> Continuar com Google
              </Button>
              <div className="relative flex items-center py-2">
                <div className="flex-1 border-t border-gray-300" />
                <span className="px-4 text-gray-500 text-sm">ou</span>
                <div className="flex-1 border-t border-gray-300" />
              </div>
              <div>
                <Link href="/auth/login" passHref>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center py-5 border-gray-300 hover:border-gray-400 transition"
                  >
                    <MdOutlineEmail className="mr-2 h-5 w-5 text-gray-600" />
                    Continuar com e-mail
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Ao continuar, você concorda com nossos
                <Link href="#" className="text-blue-600 hover:underline">
                  {" "}
                  Termos de Uso{" "}
                </Link>
                &
                <Link href="#" className="text-blue-600 hover:underline">
                  {" "}
                  Política de Privacidade
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
