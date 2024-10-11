import { useState, useRef } from "react";
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
import { IoClose } from "react-icons/io5";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CreatedService } from "./Created-Service";
import { CreatedPerson } from "./Created-Person";
import  SchedulePanel  from "./Schedule-Panel";

export function CustomAlertDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("address");
  const formRef = useRef<HTMLFormElement | null>(null);

  const closeModal = () => setIsOpen(false);

  const handleSave = () => {
    // Checa a aba ativa e realiza a submissão correspondente
    if (activeTab === "address") {
      if (formRef.current) formRef.current.requestSubmit();
    } else if (activeTab === "service") {
      // Lógica para salvar outra aba (se necessário)
      console.log("Salvando conteúdo da aba de serviço...");
    }
  };

  return (
    <AlertDialogComponent open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="flex gap-2 justify-center items-center"
        >
          <LuSettings />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <div className="relative">
          <div
            className="absolute -top-2 right-0 cursor-pointer text-gray-600 hover:text-gray-900"
            onClick={closeModal}
          >
            <IoClose size={24} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              Configurações
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="mt-4 h-[400px] overflow-y-auto scrollbar-hide">
            <Tabs
              defaultValue="address"
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full"
            >
              <TabsList>
                <TabsTrigger value="address">Endereço</TabsTrigger>
                <TabsTrigger value="person">Profissionais</TabsTrigger>
                <TabsTrigger value="service">Serviço</TabsTrigger>
                <TabsTrigger value="schedule">Configurção</TabsTrigger>
              </TabsList>
              <TabsContent value="address" className="h-full">
                <CreatedAddress closeModal={closeModal} formRef={formRef} />
              </TabsContent>
              <TabsContent value="person" className="h-full">
                <CreatedPerson closeModal={closeModal} formRef={formRef} />
              </TabsContent>
              <TabsContent value="service" className="h-full">
                <CreatedService closeModal={closeModal} formRef={formRef} />
              </TabsContent>
              <TabsContent value="schedule" className="h-full">
                <SchedulePanel closeModal={closeModal}  />
              </TabsContent>
            </Tabs>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialogComponent>
  );
}
