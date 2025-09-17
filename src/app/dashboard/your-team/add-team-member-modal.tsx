import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddEmployeeForm } from "@/hooks/post-employee";
import { FiUser, FiMail, FiPhone } from "react-icons/fi";
import { FormError } from "@/app/auth/_components/form/form-error";

interface AddUserDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onSuccess?: () => void;
}

export default function AddUserDialog({
  isOpen,
  setIsOpen,
  onSuccess,
}: AddUserDialogProps) {
  const { form, handleSubmit } = useAddEmployeeForm(onSuccess);

  const {
    register,
    handleSubmit: submitHandler,
    setValue,
    formState,
    setError,
  } = form;

  const { errors, isSubmitting } = formState;

  // Phone number formatting with +55 prefix for E164 format
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");

    let formattedDigits: string;
    if (digits.startsWith("55") && digits.length <= 13) {
      formattedDigits = digits;
    } else if (digits.length <= 11) {
      formattedDigits = `55${digits}`;
    } else {
      // fallback simples: devolve com + e só dígitos
      return `+${digits}`;
    }

    return `+${formattedDigits}`;
  };

  const onSubmit = async (data: any) => {
    // garante defaults esperados pela API
    data.timezone = "America/Sao_Paulo";
    data.role = "user";
    data.password = "Senha123!";

    const ok = await handleSubmit(data, setError);
    if (ok) {
      setIsOpen(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-xl rounded-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Membro da Equipe</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para adicionar um novo membro à equipe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitHandler(onSubmit)} className="space-y-4">
          {/* Nome */}
          <div className="flex items-center gap-3">
            <FiUser className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="name">Nome*</Label>
              <Input
                id="name"
                placeholder="Digite o nome"
                className={
                  errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
                }
                {...register("name")}
              />
              <FormError message={errors.name?.message} />
            </div>
          </div>

          {/* Sobrenome */}
          <div className="flex items-center gap-3">
            <FiUser className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="surname">Sobrenome*</Label>
              <Input
                id="surname"
                placeholder="Digite o sobrenome"
                className={
                  errors.surname
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
                {...register("surname")}
              />
              <FormError message={errors.surname?.message} />
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <FiMail className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="email">Email*</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite o email"
                className={
                  errors.email
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
                {...register("email")}
              />
              <FormError message={errors.email?.message} />
            </div>
          </div>

          {/* Telefone */}
          <div className="flex items-center gap-3">
            <FiPhone className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="phone">Telefone*</Label>
              <Input
                id="phone"
                placeholder="+5511999999999"
                className={
                  errors.phone
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
                {...register("phone", {
                  onChange: e => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setValue("phone", formatted, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  },
                })}
              />
              <FormError message={errors.phone?.message} />
            </div>
          </div>

          {/* Botões no Rodapé */}
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="default" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
