"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, List } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const services = {
  sobrancelha: {
    name: "Sobrancelha",
    duration: "10 min",
    price: "R$ 20",
    provider: "Augusto",
  },
  testador: {
    name: "Testador",
    duration: "20 min",
    price: "R$ 50",
    provider: "Vitor Augusto",
  },
};

// Gera um ID de reserva aleatório de 8 caracteres
const generateReservationId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

export default function SucessoPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.service as string;
  const dateParam = params.date as string;
  const timeParam = params.time as string;

  const service = services[serviceId as keyof typeof services];
  const [copied, setCopied] = useState(false);
  const reservationId = generateReservationId();

  if (!service) {
    return <div className="p-4">Serviço não encontrado</div>;
  }

  // Formatar a data para exibição
  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      // Capitalize first letter
      const formatted = date.toLocaleDateString("pt-BR", options);
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch (e) {
      return "Quinta-feira, 3 de abril de 2025";
    }
  };

  // Formatar a hora para exibição
  const formatTime = (time: string) => {
    return time.replace("-", ":") + " AM";
  };

  const startTime = formatTime(timeParam);
  // Calcular o horário de término com base na duração do serviço
  const endTime = service.name === "Testador" ? "11:20 AM" : "11:10 AM";

  const handleCopyId = () => {
    navigator.clipboard.writeText(reservationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-10">
      <Card className="bg-zinc-900 border-zinc-800 p-8 max-w-2xl w-full mb-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-1">Reserva confirmada</h1>
          <p className="text-zinc-400">com Vitor</p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="text-zinc-400">Data e hora</div>
            <div className="text-right">
              <div>
                Quinta-feira, 3 de abril de 2025 • {startTime} — {endTime}
              </div>
              <div className="text-sm text-zinc-500">
                Fuso horário (América/São_Paulo)
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-zinc-400">ID da reserva</div>
            <div className="flex items-center">
              <span className="mr-2">{reservationId}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-zinc-400 hover:text-white"
                onClick={handleCopyId}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-start">
            <div className="text-zinc-400">Serviço</div>
            <div className="flex items-start">
              <div className="bg-zinc-800 p-2 rounded-md mr-3">
                <List className="h-5 w-5" />
              </div>
              <div className="text-right">
                <div>{service.name}</div>
                <div className="text-sm text-zinc-400">
                  {service.duration} • com {service.provider}
                </div>
              </div>
              <div className="ml-10">{service.price}</div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-zinc-800 font-medium">
            <div>Total a pagar</div>
            <div>{service.price}</div>
          </div>
        </div>

        <div className="text-center text-zinc-400 text-sm mt-8">
          Uma confirmação foi enviada para você por e-mail
        </div>

        <div className="flex justify-center mt-6">
          <Link href="/">
            <Button variant="outline" className="rounded-full px-6">
              Marque outra consulta
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800 p-6 max-w-2xl w-full">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">
            Quer sua própria página de reservas?
          </h2>
          <p className="text-zinc-400 text-sm">
            Automatize reservas, pagamentos e lembretes para economizar inúmeras
            horas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            className="bg-zinc-800 border-zinc-700"
            placeholder="vitoraugusto2010201078@gmail.com"
            readOnly
          />
          <Button className="whitespace-nowrap rounded-full">
            Obtenha sua página de reservas
          </Button>
        </div>
      </Card>
    </div>
  );
}
