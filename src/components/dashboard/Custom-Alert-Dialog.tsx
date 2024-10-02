import { useState } from "react";
import {
  AlertDialog as AlertDialogComponent,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LuSettings } from "react-icons/lu";
import { CreatedAddress } from "./Created-Address";
import { IoClose } from "react-icons/io5"; // Importa o ícone de fechar

export function CustomAlertDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialogComponent open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="flex gap-2 justify-center items-center"
        >
          Settings <LuSettings />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        {/* Adiciona um container flex para alinhar o X corretamente */}
        <div className="relative">
          {/* Botão para fechar o modal */}
          <div
            className="absolute -top-2 right-0 cursor-pointer text-gray-600 hover:text-gray-900"
            onClick={() => setIsOpen(false)}
          >
            <IoClose size={24} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              Criar um Endereço
            </AlertDialogTitle>
          </AlertDialogHeader>
          {/* Passa a função para fechar o modal */}
          <CreatedAddress closeModal={() => setIsOpen(false)} />
        </div>
      </AlertDialogContent>
    </AlertDialogComponent>
  );
}
