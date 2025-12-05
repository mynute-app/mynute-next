import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building, Calendar, Clock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export function LandingPage() {
  return (
    <div className="h-[100dvh] overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-800 flex flex-col justify-center">
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-4 max-h-screen gap-8 md:gap-12">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300">
            <Calendar className="w-3.5 h-3.5" />
            Sistema de Agendamento Online
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Gerencie seus agendamentos de forma simples e eficiente
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Mynute é a plataforma completa para gestão de agendamentos online.
            Aumente sua produtividade e melhore a experiência dos seus clientes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild size="lg" className="px-6">
              <Link href="/auth/register-company">
                <Building className="w-4 h-4 mr-2" />
                Cadastrar minha empresa
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <Card className="border-2 hover:border-blue-100 transition-colors">
              <CardHeader className="p-3 md:p-4 space-y-1.5">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-base md:text-lg">
                  Agendamento Fácil
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Seus clientes podem agendar serviços online 24/7, sem
                  complicações.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-green-100 transition-colors">
              <CardHeader className="p-3 md:p-4 space-y-1.5">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-base md:text-lg">
                  Gestão de Equipe
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Gerencie funcionários, filiais e horários de trabalho em um só
                  lugar.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-100 transition-colors">
              <CardHeader className="p-3 md:p-4 space-y-1.5">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-base md:text-lg">
                  Economia de Tempo
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Automatize confirmações, lembretes e reduza faltas nos
                  agendamentos.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-2 md:py-3 mt-auto">
        <div className="container mx-auto px-4">
          <div className="text-center text-xs text-slate-600 dark:text-slate-400">
            <p>
              © {new Date().getFullYear()} Mynute. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
