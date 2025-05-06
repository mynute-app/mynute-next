"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export default function PreviewLayout({
  config,
}: {
  config: {
    logo: string | null;
    bannerColor: string;
    primaryColor: string;
  };
}) {
  return (
    <div
      className="w-full h-full flex items-center justify-center py-10 px-4"
      style={{
        background: "linear-gradient(to bottom right, #f0f2f5, #e3e5ea)",
      }}
    >
      <div className="bg-white max-w-7xl w-full rounded-xl shadow-2xl overflow-hidden flex flex-col gap-6 border border-gray-200">
        {/* Banner com fundo customizado */}
        <div
          className="h-40 w-full flex items-center justify-center"
          style={{ backgroundColor: config.bannerColor }}
        >
          {config.logo ? (
            <img src={config.logo} alt="Logo" className="h-16 object-contain" />
          ) : (
            <div className="w-20 h-20 bg-gray-300 rounded-md" />
          )}
        </div>

        {/* Etapas com cor primária */}
        <div className="flex justify-center items-center gap-4">
          <div
            className="text-white px-4 py-2 rounded-md font-bold shadow"
            style={{ backgroundColor: config.primaryColor }}
          >
            1
          </div>
          <div className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md font-bold">
            2
          </div>
        </div>

        <div className="text-center text-xl font-semibold -mt-4">Endereço</div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 space-y-2 border border-gray-200">
              <div className="flex items-center gap-2">
                <MapPin className="text-gray-500" size={16} />
                <div className="h-4 w-16 bg-gray-300 rounded" />
              </div>
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-2/3 bg-gray-200 rounded" />
              <div className="h-3 w-1/2 bg-gray-200 rounded" />
            </Card>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between px-8 pb-6">
          <Button variant="outline" disabled>
            Anterior
          </Button>
          <Button
            style={{ backgroundColor: config.primaryColor, color: "white" }}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}
