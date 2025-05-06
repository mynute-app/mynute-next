"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export default function PreviewLayout() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f0f2f5] to-[#e3e5ea] py-10 px-4">
      <div className="bg-white max-w-7xl w-full rounded-xl shadow-2xl overflow-hidden flex flex-col gap-6 border border-gray-200">
        {/* Banner simulado */}
        <div className="bg-gray-100 h-40 w-full flex items-center justify-center">
          <div className="w-20 h-20 bg-gray-300 rounded-md" />
        </div>

        {/* Etapas */}
        <div className="flex justify-center items-center gap-4">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-md font-bold shadow">
            1
          </div>
          <div className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md font-bold">
            2
          </div>
        </div>

        {/* Título */}
        <div className="text-center text-xl font-semibold -mt-4">Endereço</div>

        {/* Cards placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-8">
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              className="p-4 space-y-2 shadow-sm border border-gray-200"
            >
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

        {/* Botões inferiores */}
        <div className="flex justify-between px-8 pb-6">
          <Button variant="outline" disabled>
            Anterior
          </Button>
          <Button>Próximo</Button>
        </div>
      </div>
    </div>
  );
}
