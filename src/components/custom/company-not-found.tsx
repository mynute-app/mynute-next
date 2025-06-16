import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Building, Home } from "lucide-react";
import Link from "next/link";

interface CompanyNotFoundProps {
  subdomain: string;
}

export function CompanyNotFound({ subdomain }: CompanyNotFoundProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Empresa não encontrada
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Não foi possível encontrar uma empresa com o subdomínio:
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Building className="w-4 h-4 text-slate-500" />
              <span className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                {subdomain}
              </span>
            </div>
          </div>

          <div className="text-center text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>Isso pode ter acontecido porque:</p>
            <ul className="text-left space-y-1 list-disc list-inside">
              <li>O subdomínio foi digitado incorretamente</li>
              <li>A empresa ainda não foi cadastrada</li>
              <li>A empresa foi removida ou desativada</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full" variant="default">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Voltar ao início
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/register-company">
                <Building className="w-4 h-4 mr-2" />
                Cadastrar nova empresa
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
