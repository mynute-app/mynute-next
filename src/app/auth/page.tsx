"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import {
  CalendarIcon,
  CheckCircleIcon,
  BellIcon,
  ShareIcon,
} from "lucide-react";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/agenda" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-600">
            Agenda Inteligente
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Organize seu tempo com eficiência
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Por que usar nossa Agenda?
              </h2>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <span>Sincronização com Google Calendar</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span>Interface intuitiva e fácil de usar</span>
                </li>
                <li className="flex items-center">
                  <BellIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  <span>Lembretes inteligentes personalizados</span>
                </li>
                <li className="flex items-center">
                  <ShareIcon className="h-5 w-5 text-purple-500 mr-2" />
                  <span>Compartilhamento de eventos simples</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col justify-center">
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full py-6 text-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <FcGoogle className="mr-2 h-6 w-6" />
                Entrar com Google
              </Button>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Acesse agora e comece a organizar sua vida!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
