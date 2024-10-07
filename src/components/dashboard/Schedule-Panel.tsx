import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface SchedulePanelProps {
  closeModal: () => void;
}

const SchedulePanel = ({ closeModal }: SchedulePanelProps) => {
  const config = {
    endereco: {
      label: "Endereço",
      options: [{ label: "Ocultar o endereço", key: "ocultarEndereco" }],
    },
    profissionais: {
      label: "Profissionais",
      options: [
        { label: "Opção para profissionais", key: "opcaoProfissionais" },
      ],
    },
    servico: {
      label: "Serviço",
      options: [{ label: "Opção para serviço", key: "opcaoServico" }],
    },
    servicosExtras: {
      label: "Serviços Extras",
      options: [
        { label: "Opção para serviços extras", key: "opcaoServicosExtras" },
      ],
    },
    dataHora: {
      label: "Data e Hora",
      options: [{ label: "Opção para data e hora", key: "opcaoDataHora" }],
    },
    informacao: {
      label: "Informação",
      options: [{ label: "Opção para informação", key: "opcaoInformacao" }],
    },
    carrinho: {
      label: "Carrinho",
      options: [{ label: "Opção para carrinho", key: "opcaoCarrinho" }],
    },
    confirmacao: {
      label: "Confirmação",
      options: [
        {
          label: "Ocultar seção de métodos de pagamentos",
          key: "ocultarMetodosPagamento",
        },
        {
          label:
            "Não mostrar a linha de desconto se um desconto não for adicionado",
          key: "linhaDesconto",
        },
        { label: "Ocultar seção de preços", key: "ocultarPrecos" },
        {
          label: "Redirect users on confirmation",
          key: "redirectUsers",
          type: "input",
        },
        { label: "Ocultar seção de cupom", key: "ocultarCupom" },
      ],
    },
    finalizar: {
      label: "Finalizar",
      options: [{ label: "Opção para finalizar", key: "opcaoFinalizar" }],
    },
  };

  return (
    <div className=" h-full mt-40">
      <Tabs defaultValue="endereco" className="flex w-full">
        <TabsList className="flex flex-col w-1/4 pr-4 border-r border-gray-300 ">
          {Object.entries(config).map(([key, value]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="w-full text-left mb-2"
            >
              {value.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="w-3/4 pl-4 ">
          {Object.entries(config).map(([key, value]) => (
            <TabsContent
              key={key}
              value={key}
              className="p-4 bg-gray-100 rounded"
            >
              <h2 className="font-bold mb-2">
                Configurações de {value.label}:
              </h2>
              <div>
                {value.options.map(option => (
                  <div key={option.key} className="flex items-center mb-2">
                    <label className="mr-2">{option.label}:</label>
                    {"type" in option && option.type === "input" ? (
                      <input
                        type="text"
                        placeholder="URL for redirection"
                        className="ml-2 p-1 border rounded"
                      />
                    ) : (
                      <Switch />
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default SchedulePanel;
