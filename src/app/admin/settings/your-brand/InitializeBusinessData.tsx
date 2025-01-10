"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function InitializeBusinessData({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch(
          `http://localhost:3333/business?email=${session.user.email}`
        );
        const data = await response.json();

        if (data.length === 0) {
          await fetch("http://localhost:3333/business", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              businessName: "",
            }),
          });
          toast({
            title: "Bem-vindo!",
            description: "Estrutura inicial criada com sucesso.",
          });
        }
      } catch (error) {
        console.error("Erro ao inicializar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível inicializar os dados.",
          variant: "destructive",
        });
      }
    };

    initializeData();
  }, [session, toast]);

  return <>{children}</>;
}
