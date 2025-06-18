import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YourBrandErrorProps {
  error: string;
  onRetry?: () => void;
}

export default function YourBrandError({
  error,
  onRetry,
}: YourBrandErrorProps) {
  return (
    <div className="p-4 max-h-screen h-screen overflow-y-auto flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Card de Erro */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          {/* Ícone */}
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>

          {/* Título */}
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Erro ao Carregar Dados
          </h3>

          {/* Mensagem de Erro */}
          <p className="text-red-600 mb-6 text-sm">
            Não foi possível carregar os dados da empresa.
          </p>

          {/* Detalhes do Erro */}
          <div className="bg-red-100 border border-red-300 rounded-md p-3 mb-6">
            <p className="text-xs text-red-700 font-mono break-words">
              {error}
            </p>
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            )}

            <Button
              onClick={() => window.location.reload()}
              variant="default"
              className="bg-red-600 hover:bg-red-700"
            >
              Recarregar Página
            </Button>
          </div>
        </div>

        {/* Sugestões */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Possíveis soluções:</p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Verifique sua conexão com a internet</li>
            <li>• Tente fazer login novamente</li>
            <li>• Entre em contato com o suporte se o problema persistir</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
