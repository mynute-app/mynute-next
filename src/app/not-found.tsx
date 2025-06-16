import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <FileQuestion className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Página não encontrada
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            A página que você está procurando não existe ou foi movida.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <p>Isso pode ter acontecido porque:</p>
            <ul className="text-left space-y-1 list-disc list-inside mt-2">
              <li>O link foi digitado incorretamente</li>
              <li>A página foi removida ou movida</li>
              <li>Você não tem permissão para acessar esta página</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full" variant="default">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Voltar ao início
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full"
              onClick={() => window.history.back()}
            >
              <span>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar à página anterior
              </span>
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
