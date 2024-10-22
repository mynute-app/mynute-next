"use client";

import { useState } from "react";
import { Upload, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GiBurningTree } from "react-icons/gi";
import BusinessHours from "../custom/BusinessHours";
export default function BrandDetailsForm() {
  const [businessName, setBusinessName] = useState("Vitor");
  const [bookingUrl, setBookingUrl] = useState("vitordcx3");
  const [industry, setIndustry] = useState("Barbershop");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Brazil");
  const [zipCode, setZipCode] = useState("");
  const [currency, setCurrency] = useState("Brazil - BRL R$");

  return (
    <div className="container mx-auto ">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold mb-6">Detalhes da Empresa</h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-0 relative">
                <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md ">
                  <div className="border-2  rounded-full border-gray-300 p-2 shadow-md">
                    <GiBurningTree className="size-6 " />
                  </div>
                  <Button
                    variant="outline"
                    className="absolute bottom-2 right-2 rounded-md shadow-sm"
                  >
                    <Upload className="mr-2 h-4 w-4" /> Upload banner image
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center shadow-md">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold">Logotipo da marca</h3>
                <p className="text-xs text-gray-500">
                  Selecione uma imagem de 200 x 200 px, com <br /> tamanho
                  máximo de 10 MB
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Carregar logo{" "}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Nome</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookingUrl">URL da sua página de reservas</Label>
              <div className="flex">
                <Input
                  id="bookingUrl"
                  value={bookingUrl}
                  onChange={e => setBookingUrl(e.target.value)}
                  className="rounded-r-none"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  .setmore.com
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Indústria</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Barbershop">Barbershop</SelectItem>
                  <SelectItem value="Salon">Salon</SelectItem>
                  <SelectItem value="Spa">Spa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Street name, apt, suite, floor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="California">California</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="Texas">Texas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                value={zipCode}
                onChange={e => setZipCode(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brazil">Brazil</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brazil - BRL R$">
                    Brazil - BRL R$
                  </SelectItem>
                  <SelectItem value="USA - USD $">USA - USD $</SelectItem>
                  <SelectItem value="Canada - CAD $">Canada - CAD $</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="about">Sobre</Label>
              <Textarea
                id="about"
                placeholder="Tell the world about your brand"
                className="h-32"
              />
            </div>

            <BusinessHours />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Sobre</h2>
          <Card className="bg-gray-900 text-white">
            <CardHeader>
              <div className="w-full h-40 bg-gray-800 rounded-md mb-4"></div>
              <CardTitle>{businessName}</CardTitle>
              <CardDescription className="text-gray-400">
                https://{bookingUrl}.setmore.com
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="secondary">
                Book now
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
