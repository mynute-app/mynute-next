import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Home, Globe } from "lucide-react";
import Link from "next/link";

export function InvalidSubdomain() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Subdomínio inválido
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            O endereço acessado não corresponde a um subdomínio válido.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>Para acessar o sistema, você precisa:</p>
            <ul className="text-left space-y-1 list-disc list-inside">
              <li>Usar um subdomínio válido da empresa</li>
              <li>Verificar se o endereço foi digitado corretamente</li>
              <li>Entrar em contato com a empresa para obter o link correto</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Formato esperado:
                </p>
                <p className="text-blue-700 dark:text-blue-300 font-mono">
                  empresa.agendakaki.com
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full" variant="default">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Voltar ao início
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Precisa de ajuda? Entre em contato com o suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
