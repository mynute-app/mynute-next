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

function TeamMemberActions({
  selectedMember,
  onDelete,
  onSave,
}: {
  selectedMember: any;
  onDelete: () => void;
  onSave: (updatedUser: any) => void;
}) {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);

  const isAdmin = selectedMember?.id === 0;

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
        onSave={updatedUser => {
          onSave(updatedUser);
          setEditDialogOpen(false);
        }}
        isOpen={isEditDialogOpen}
        onClose={() => setEditDialogOpen(false)}
      />

      {/* Dropdown para mais opções, exibido apenas para membros normais */}
      {!isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="hover:bg-slate-200 rounded-full p-2 cursor-pointer transition-all duration-300">
              <IoMdMore className="size-5" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDelete} className="text-red-500">
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export default TeamMemberActions;
