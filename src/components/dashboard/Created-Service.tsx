import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // Switch do shadcn
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; 
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const createdServiceSchema = z.object({
  serviceName: z.string().min(1, "O nome do serviço é obrigatório"),
  category: z.string().min(1, "A categoria é obrigatória"),
  price: z.string().min(1, "O preço é obrigatório"),
  duration: z.string().min(1, "A duração é obrigatória"),
  description: z.string().optional(),
  hidePrice: z.boolean().optional(),
  hideDuration: z.boolean().optional(),
});

type CreatedServiceFormData = z.infer<typeof createdServiceSchema>;

export const CreatedService = ({
  closeModal,
  formRef,
}: {
  closeModal: () => void;
  formRef: React.MutableRefObject<HTMLFormElement | null>;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const form = useForm<CreatedServiceFormData>({
    resolver: zodResolver(createdServiceSchema),
    defaultValues: {
      serviceName: "",
      category: "",
      price: "",
      duration: "",
      hidePrice: false,
      hideDuration: false,
      description: "",
    },
  });

  const onSubmit = async (data: CreatedServiceFormData) => {
    setLoading(true);
    try {
      // Chamada para salvar o serviço (exemplo de API fictícia)
      const response = await fetch("http://localhost:3333/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Serviço criado!",
          description: "O serviço foi adicionado com sucesso.",
          variant: "default",
        });
        closeModal();
        form.reset();
      } else {
        toast({
          title: "Erro ao criar serviço",
          description: "Houve um problema ao adicionar o serviço.",
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
        {/* Campo Nome do Serviço */}
        <FormField
          name="serviceName"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nome do Serviço <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Consulta" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Categoria */}
        <FormField
          name="category"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Categoria <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={value => field.onChange(value)}
                  value={field.value}
                >
                  <SelectTrigger>Selecione uma categoria</SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="terapia">Terapia</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Preço */}
        <FormField
          name="price"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Preço (R$) <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="0.00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Duração */}
        <FormField
          name="duration"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Duração <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={value => field.onChange(value)}
                  value={field.value}
                >
                  <SelectTrigger>Selecione a duração</SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1 hora e meia</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Switch para esconder preço */}
        <FormField
          name="hidePrice"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Ocultar preço no painel de reserva</FormLabel>
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

        {/* Switch para esconder duração */}
        <FormField
          name="hideDuration"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Ocultar duração no painel de reserva</FormLabel>
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

        {/* Campo Descrição */}
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descrição detalhada do serviço"
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
