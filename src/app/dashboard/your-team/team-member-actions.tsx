import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MdOutlineModeEdit } from "react-icons/md";
import { IoMdMore } from "react-icons/io";
import EditUserDialog from "./info-team/edit-user-dialog";
import { useDeleteEmployee } from "@/hooks/employee/use-delete-employee";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function TeamMemberActions({
  selectedMember,
  onDelete,
}: {
  selectedMember: any;
  onDelete: () => void;
}) {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const hasRole =
    selectedMember?.roles &&
    Array.isArray(selectedMember.roles) &&
    selectedMember.roles.length > 0;

  const { deleteEmployee, isDeleting } = useDeleteEmployee({
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      onDelete();
    },
  });

  const handleDelete = async () => {
    if (selectedMember?.id) {
      await deleteEmployee(selectedMember.id);
    }
  };

  return (
    <div className="flex gap-4">
      {/* Botão para abrir o modal de edição, exibido para todos */}
      <div
        className="hover:bg-slate-200 rounded-full p-2 cursor-pointer transition-all duration-300"
        onClick={() => setEditDialogOpen(true)}
      >
        {/* <MdOutlineModeEdit className="size-5" /> */}
      </div>

      {/* Modal de edição */}
      <EditUserDialog
        user={selectedMember}
        isOpen={isEditDialogOpen}
        onClose={() => setEditDialogOpen(false)}
      />

      {/* Dropdown para mais opções, exibido apenas para membros sem role (não Owner/Admin) */}
      {!hasRole && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="hover:bg-slate-200 rounded-full p-2 cursor-pointer transition-all duration-300">
              <IoMdMore className="size-5" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-red-500"
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Dialog de confirmação para deletar */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o funcionário{" "}
              <strong>
                {selectedMember?.name} {selectedMember?.surname}
              </strong>
              ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TeamMemberActions;
