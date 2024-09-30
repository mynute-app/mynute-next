import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { BiLandscape } from "react-icons/bi";
export const CardService = () => {
  return (
    <Card className="w-64 p-4 shadow-md rounded-lg flex flex-col gap-4">
      <CardHeader className="flex items-center gap-4">
        <div className="bg-gray-200 rounded-full w-14 h-14 flex items-center justify-center">
          <BiLandscape />
        </div>
        <div className="flex-1">
          <CardTitle className="text-sm font-semibold">
            Alongamento em fibra de vidro
          </CardTitle>
          <CardDescription className="text-green-500 text-sm font-semibold">
            R$50,00
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <Badge className="bg-yellow-400 text-black px-3 py-1 rounded-full">
          50M
        </Badge>
      </CardContent>
    </Card>
  );
};
