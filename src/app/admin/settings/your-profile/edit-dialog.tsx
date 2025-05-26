import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { UserProfileForm } from "./edit-about-section";
import { useUpdateUser } from "@/hooks/update-userUser";
import { User } from "../../../../../types/user";

export const EditDialog = ({
  user,
  onSave,
  isOpen,
  onClose,
}: {
  user: User;
  onSave: (updatedUser: any) => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { updateUser, loading, error } = useUpdateUser(); // Usando o hook
  const [activeTab, setActiveTab] = useState("profile");

  const handleSave = async (updatedUserData: any) => {
    // Logando os dados recebidos para verificar o que está sendo passado para a função
    console.log("Dados recebidos para salvar:", updatedUserData);

    // Chama o hook updateUser para atualizar os dados
    const updatedUser = await updateUser(updatedUserData);

    if (updatedUser) {
      onSave(updatedUser); // Passa os dados atualizados para o componente pai
      onClose(); // Fecha o modal após salvar
    } else {
      // Se ocorrer um erro, você pode exibir uma mensagem ou algo do tipo
      console.error("Erro ao salvar as alterações");
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl" onEscapeKeyDown={onClose}>
        <DialogHeader>
          <DialogTitle>Your profile</DialogTitle>
          <DialogClose asChild onClick={onClose}>
            <Button variant="ghost" className="absolute right-2 top-2"></Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex gap-8">
          {/* Lado esquerdo - Avatar e tabs */}
          <div className="flex flex-col items-start space-y-4 w-1/3">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold">
              testador
            </div>
            <p className="text-lg font-semibold"> testador 2</p>

            {/* Menu de abas */}
            <div className="flex flex-col space-y-2">
              <button
                className={`text-left px-4 py-2 font-medium ${
                  activeTab === "profile"
                    ? "bg-gray-200 text-black"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>
              {/* Outras tabs */}
            </div>
          </div>

          {/* Lado direito - Conteúdo das tabs */}
          <div className="w-2/3 space-y-6">
            {activeTab === "profile" && (
              <UserProfileForm onSubmit={handleSave} />
            )}
            {/* Outros conteúdos de tab */}
          </div>
        </div>

        <DialogFooter className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="ml-2" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
