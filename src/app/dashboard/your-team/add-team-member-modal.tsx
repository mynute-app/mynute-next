import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddEmployeeForm } from "@/hooks/post-employee";
import { Mail, Lock, User, Phone, Briefcase } from "lucide-react";

interface AddUserDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function AddUserDialog({
  isOpen,
  setIsOpen,
}: AddUserDialogProps) {
  const { form, handleSubmit } = useAddEmployeeForm();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="backdrop-blur-md p-6 max-w-lg">
        <DialogTitle className="text-lg font-semibold text-gray-800">
          Criar Usuáriosadassasda
        </DialogTitle>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
          {/* Nome */}
          <div className="flex items-center  px-3 py-2">
            <User className="text-gray-500" size={20} />
            <Input
              {...form.register("name")}
              placeholder="Nome"
              className="flex-1 ml-2  focus:ring-0"
            />
          </div>
          {form.formState.errors.name && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.name.message}
            </p>
          )}

          {/* Sobrenome */}
          <div className="flex items-center  px-3 py-2">
            <User className="text-gray-500" size={20} />
            <Input
              {...form.register("surname")}
              placeholder="Sobrenome"
              className="flex-1 ml-2  focus:ring-0"
            />
          </div>
          {form.formState.errors.surname && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.surname.message}
            </p>
          )}

          {/* Email */}
          <div className="flex items-center px-3 py-2">
            <Mail className="text-gray-500" size={20} />
            <Input
              {...form.register("email")}
              type="email"
              placeholder="Email"
              className="flex-1 ml-2  focus:ring-0"
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.email.message}
            </p>
          )}

          {/* Telefone */}
          <div className="flex items-center  px-3 py-2">
            <Phone className="text-gray-500" size={20} />
            <Input
              {...form.register("phone")}
              placeholder="Telefone"
              className="flex-1 ml-2  focus:ring-0"
            />
          </div>
          {form.formState.errors.phone && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.phone.message}
            </p>
          )}

          {/* Senha */}
          <div className="flex items-center  px-3 py-2">
            <Lock className="text-gray-500" size={20} />
            <Input
              {...form.register("password")}
              type="password"
              placeholder="Senha"
              className="flex-1 ml-2 focus:ring-0"
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.password.message}
            </p>
          )}

          {/* Papel (Select) */}
          <div className="flex items-center  px-3 py-2">
            <Briefcase className="text-gray-500" size={20} />
            <select
              {...form.register("role")}
              className="flex-1 ml-2 border-none focus:ring-0 bg-transparent"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="bg-blue-800 text-white">
              Criar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
