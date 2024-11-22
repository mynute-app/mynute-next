"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Calendar, HelpCircle, Settings, User } from "lucide-react";
import { SettingsSubSidebar } from "@/app/admin/settings/settings-sub-sidebar";

export const Sidebar = () => {
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const handleOptionClick = (option: string) => {
    setActiveOption(option === activeOption ? null : option);
  };

  return (
    <div className="flex h-screen border-r">
      {/* Sidebar principal */}
      <div className="p-4 ">
        <div className="flex items-center gap-2 pb-4 ">
          <User className="h-6 w-6" />
          <span className="font-semibold">Nome</span>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => handleOptionClick("services")}
            >
              <Calendar className="h-4 w-4" />
              Services
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => handleOptionClick("settings")}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </ScrollArea>
        <div className="absolute bottom-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <HelpCircle className="h-4 w-4" />
            Help & Support
          </Button>
        </div>
      </div>

      {/* Sub-sidebar: exibe conteúdo relacionado ao item selecionado */}
      <div className="p-4 flex-1 border-l bg-gray-100">
        {activeOption === "settings" && <SettingsSubSidebar />}
        {/* Conteúdo para "services" pode ser adicionado de forma similar */}
        {activeOption === "services" && (
          <div>
            <h2 className="text-lg font-semibold">Services</h2>
            <p className="text-sm text-muted-foreground">
              Configure services and availability.
            </p>
          </div>
        )}
        {!activeOption && <SettingsSubSidebar />}
      </div>
    </div>
  );
};
