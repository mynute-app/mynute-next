import { Dispatch, SetStateAction, useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddEmployeeForm } from "@/hooks/post-employee";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiGlobe,
  FiLock,
} from "react-icons/fi";

interface AddUserDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function AddUserDialog({
  isOpen,
  setIsOpen,
}: AddUserDialogProps) {
  const { form, handleSubmit } = useAddEmployeeForm();
  const {
    register,
    handleSubmit: submitHandler,
    setValue,
    watch,
    formState,
  } = form;
  const { errors, isSubmitting } = formState;

  const [selectedTimezone, setSelectedTimezone] = useState<string>("");

  // Auto-select user's timezone
  useEffect(() => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setSelectedTimezone(userTimezone);
    setValue("timezone", userTimezone);
  }, [setValue]);

  const onSubmit = async (data: any) => {
    console.log("📤 Form data being submitted:", data);
    const success = await handleSubmit(data);
    if (success) {
      console.log("✅ Employee created successfully");
      setIsOpen(false);
    }
  };

  // Phone number formatting with +55 prefix
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // If starts with 55, keep it, otherwise add +55
    if (digits.startsWith("55")) {
      const remaining = digits.slice(2);
      if (remaining.length <= 11) {
        return `+55 ${remaining}`;
      }
    } else {
      if (digits.length <= 11) {
        return `+55 ${digits}`;
      }
    }

    return value; // Return as-is if doesn't fit expected pattern
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue("phone", formatted);
  };

  const phoneValue = watch("phone") || "";

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
              <Label htmlFor="name">Nome completo*</Label>
              <Input
                id="name"
                placeholder="Digite o nome completo"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
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
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Telefone */}
          <div className="flex items-center gap-3">
            <FiPhone className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="phone">Telefone*</Label>
              <Input
                id="phone"
                placeholder="+55 (11) 99999-9999"
                value={phoneValue}
                onChange={handlePhoneChange}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Senha */}
          <div className="flex items-center gap-3">
            <FiLock className="text-gray-500 w-5 h-5 mt-7" />
            <div className="flex-1">
              <Label htmlFor="password">Senha*</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite a senha"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Cargo e Fuso Horário */}
          <div className="flex gap-3">
            <div className="flex items-center gap-3 flex-1">
              <FiBriefcase className="text-gray-500 w-5 h-5 mt-7" />
              <div className="flex-1">
                <Label htmlFor="role">Cargo*</Label>
                <Select
                  onValueChange={value =>
                    setValue("role", value as "user" | "admin")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1">
              <FiGlobe className="text-gray-500 w-5 h-5 mt-7" />
              <div className="flex-1">
                <Label htmlFor="timezone">Fuso Horário*</Label>
                <Select
                  value={selectedTimezone}
                  onValueChange={value => {
                    setSelectedTimezone(value);
                    setValue("timezone", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fuso horário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">
                      São Paulo (UTC-3)
                    </SelectItem>
                    <SelectItem value="America/New_York">
                      Nova York (UTC-5)
                    </SelectItem>
                    <SelectItem value="Europe/London">
                      Londres (UTC+0)
                    </SelectItem>
                    <SelectItem value="Asia/Tokyo">Tóquio (UTC+9)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.timezone && (
                  <p className="text-sm text-red-500">
                    {errors.timezone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botões no Rodapé */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
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
