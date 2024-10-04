import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch"; // Switch do shadcn
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Select do shadcn
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Schema de validação usando Zod
const createdPersonSchema = z.object({
  fullName: z.string().min(1, "O nome completo é obrigatório"),
  profession: z.string().optional(),
  email: z.string().min(1, "O e-mail é obrigatório").email("E-mail inválido"),
  phone: z.string().optional(),
  allowLogin: z.boolean().optional(),
  image: z.any().optional(),
  address: z.string().min(1, "O endereço é obrigatório"),
  observation: z.string().optional(),
});

type CreatedPersonFormData = z.infer<typeof createdPersonSchema>;

export const CreatedPerson = ({
  closeModal,
  formRef,
}: {
  closeModal: () => void;
  formRef: React.MutableRefObject<HTMLFormElement | null>;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const form = useForm<CreatedPersonFormData>({
    resolver: zodResolver(createdPersonSchema),
    defaultValues: {
      fullName: "",
      profession: "",
      email: "",
      phone: "",
      allowLogin: false,
      address: "",
      observation: "",
    },
  });

  const onSubmit = async (data: CreatedPersonFormData) => {
    setLoading(true);
    try {
      // Exemplo de chamada à API para salvar a pessoa
      const response = await fetch("http://localhost:3333/persons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Pessoa criada!",
          description: "A pessoa foi adicionada com sucesso.",
          variant: "default",
        });
        closeModal();
        form.reset();
      } else {
        toast({
          title: "Erro ao criar pessoa",
          description: "Houve um problema ao adicionar a pessoa.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro de rede",
        description: "Não foi possível se conectar ao servidor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        ref={formRef}
        className="space-y-4 flex flex-col px-2"
      >
        {/* Campo Nome Completo */}
        <FormField
          name="fullName"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nome completo <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Digite o nome completo" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Profissão */}
        <FormField
          name="profession"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profissão</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Digite a profissão" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo E-mail */}
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                E-mail <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="example@gmail.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Telefone */}
        <FormField
          name="phone"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Digite o telefone" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Switch para Permitir Login */}
        <FormField
          name="allowLogin"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Permitir login</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={value => field.onChange(value)}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

        {/* Campo Imagem (Upload) */}
        <FormField
          name="image"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem</FormLabel>
              <FormControl>
                <Input type="file" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Endereços */}
        <FormField
          name="address"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Endereços <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={value => field.onChange(value)}
                  value={field.value}
                >
                  <SelectTrigger>Selecione um endereço</SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="trabalho">Trabalho</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Observação */}
        <FormField
          name="observation"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Adicione observações ou notas"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      </form>
    </Form>
  );
};
