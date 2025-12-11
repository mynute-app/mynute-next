"use client";

import { useSession } from "next-auth/react";
import { decodeJWTToken, JWTUserData } from "@/utils/decode-jwt";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function TokenInfoPage() {
  const { data: session, status } = useSession();
  const [decodedData, setDecodedData] = useState<JWTUserData | null>(null);
  const [rawToken, setRawToken] = useState<string>("");

  useEffect(() => {
    if (session?.accessToken) {
      setRawToken(session.accessToken);
      const userData = decodeJWTToken(session.accessToken);
      setDecodedData(userData);
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando informações do token...</div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Não Autenticado</CardTitle>
            <CardDescription>
              Você precisa estar logado para ver as informações do token.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Informações do Token JWT</h1>
        <Badge variant="outline" className="text-sm">
          Status: {status}
        </Badge>
      </div>

      {/* Informações da Sessão */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Dados da Sessão</CardTitle>
          <CardDescription>
            Informações básicas disponíveis na sessão do NextAuth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Email:
              </label>
              <p className="text-lg">{session?.user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Nome:</label>
              <p className="text-lg">{session?.user?.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Raw */}
      <Card>
        <CardHeader>
          <CardTitle>🔑 Token Raw</CardTitle>
          <CardDescription>
            O token JWT completo recebido da API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm break-all">
              {rawToken || "Token não disponível"}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Dados Decodificados */}
      {decodedData ? (
        <Card>
          <CardHeader>
            <CardTitle>🔓 Dados Decodificados do JWT</CardTitle>
            <CardDescription>
              Informações extraídas do payload do token JWT
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">ID:</label>
                <p className="text-lg font-mono">{decodedData.id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Nome:
                </label>
                <p className="text-lg">{decodedData.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Sobrenome:
                </label>
                <p className="text-lg">{decodedData.surname}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Email:
                </label>
                <p className="text-lg">{decodedData.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Telefone:
                </label>
                <p className="text-lg">{decodedData.phone}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Verificado:
                </label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={decodedData.verified ? "default" : "destructive"}
                  >
                    {decodedData.verified ? "✅ Sim" : "❌ Não"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Company ID:
                </label>
                <p className="text-lg font-mono bg-blue-50 p-2 rounded border">
                  {decodedData.company_id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">
              ❌ Erro ao Decodificar
            </CardTitle>
            <CardDescription>
              Não foi possível decodificar o token JWT. Verifique o console para
              mais detalhes.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* JSON Completo */}
      {decodedData && (
        <Card>
          <CardHeader>
            <CardTitle>📄 JSON Completo</CardTitle>
            <CardDescription>
              Representação completa dos dados em formato JSON
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
                {JSON.stringify(decodedData, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
