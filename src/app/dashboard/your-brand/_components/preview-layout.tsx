"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

type Config = {
  logo?: string | null;
  bannerColor?: string;
  primaryColor?: string;
  bannerImage?: string | null;
  dark_mode?: boolean;
};

export default function PreviewLayout({ config }: { config: Config }) {
  const {
    logo = null,
    bannerColor = "#f5f5f5",
    primaryColor = "#000000",
    bannerImage = null,
    dark_mode = false,
  } = config;

  return (
    <div className="w-full h-full flex items-center justify-center py-10 px-4">
      <div
        className={`max-w-7xl w-full rounded-xl shadow-2xl overflow-hidden flex flex-col gap-6 border border-gray-200 transition-colors duration-300 ${
          dark_mode ? "bg-[#1a1a1a] text-white" : "bg-white text-black"
        }`}
      >
        <div
          className="h-40 w-full flex items-center justify-center relative"
          style={{ backgroundColor: bannerColor }}
        >
          {bannerImage && (
            <img
              src={bannerImage}
              alt="Banner"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {logo && (
            <img
              src={logo}
              alt="Logo"
              className="relative z-10 h-20 object-contain"
            />
          )}
          {!logo && !bannerImage && (
            <div className="w-20 h-20 bg-gray-300 rounded-md z-10" />
          )}
        </div>

        <div className="flex justify-center items-center gap-4">
          <div
            className="text-white px-4 py-2 rounded-md font-bold shadow"
            style={{ backgroundColor: primaryColor }}
          >
            1
          </div>
          <div className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md font-bold">
            2
          </div>
        </div>

        <div className="text-center text-xl font-semibold -mt-4">Endereço</div>

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
          <Button style={{ backgroundColor: primaryColor, color: "white" }}>
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}
