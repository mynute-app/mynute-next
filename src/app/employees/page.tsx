"use client";

import { useState } from "react";
import {
  Bell,
  Calendar,
  Home,
  Menu,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("home");

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return <HomeSection />;
      case "employees":
        return <EmployeesSection />;
      case "services":
        return <ServicesSection />;
      case "workplace":
        return <WorkplaceSection />;
      default:
        return <HomeSection />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden w-64 bg-white shadow-md lg:block">
        <SidebarContent setActiveSection={setActiveSection} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden absolute top-4 left-4"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Navegue pelo dashboard</SheetDescription>
          </SheetHeader>
          <SidebarContent setActiveSection={setActiveSection} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="text-2xl font-semibold mb-6">
          Dashboard de Agendamento
        </h1>
        {renderContent()}
      </main>
    </div>
  );
}

function SidebarContent({ setActiveSection }:any) {
  return (
    <nav className="flex flex-col p-4">
      <Button
        variant="ghost"
        className="justify-start"
        onClick={() => setActiveSection("home")}
      >
        <Home className="mr-2 h-4 w-4" />
        Início
      </Button>
      <Button
        variant="ghost"
        className="justify-start"
        onClick={() => setActiveSection("employees")}
      >
        <Users className="mr-2 h-4 w-4" />
        Funcionários
      </Button>
      <Button
        variant="ghost"
        className="justify-start"
        onClick={() => setActiveSection("services")}
      >
        <Calendar className="mr-2 h-4 w-4" />
        Serviços
      </Button>
      <Button
        variant="ghost"
        className="justify-start"
        onClick={() => setActiveSection("workplace")}
      >
        <Settings className="mr-2 h-4 w-4" />
        Local de Trabalho
      </Button>
    </nav>
  );
}

function HomeSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">15</div>
          <p className="text-xs text-muted-foreground">+2 desde o último mês</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Serviços</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">30</div>
          <p className="text-xs text-muted-foreground">+5 desde o último mês</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">120</div>
          <p className="text-xs text-muted-foreground">+22 desde ontem</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ 15.231</div>
          <p className="text-xs text-muted-foreground">
            +7% desde o último mês
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function EmployeesSection() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Funcionários</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Funcionário
        </Button>
      </div>
      <Table>
        <TableCaption>Lista de funcionários ativos</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Serviços</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>João Silva</TableCell>
            <TableCell>Cabeleireiro</TableCell>
            <TableCell>Corte, Coloração</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                Editar
              </Button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Maria Santos</TableCell>
            <TableCell>Manicure</TableCell>
            <TableCell>Manicure, Pedicure</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                Editar
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function ServicesSection() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Serviços</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Serviço
        </Button>
      </div>
      <Table>
        <TableCaption>Lista de serviços oferecidos</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Serviço</TableHead>
            <TableHead>Duração</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Corte de Cabelo</TableCell>
            <TableCell>45 min</TableCell>
            <TableCell>R$ 50,00</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                Editar
              </Button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Manicure</TableCell>
            <TableCell>60 min</TableCell>
            <TableCell>R$ 40,00</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                Editar
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function WorkplaceSection() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Detalhes do Local de Trabalho</CardTitle>
        <CardDescription>
          Atualize as informações do seu estabelecimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Nome do Estabelecimento</Label>
              <Input id="name" placeholder="Nome do seu negócio" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" placeholder="Endereço completo" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="(00) 00000-0000" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Breve descrição do seu negócio"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancelar</Button>
        <Button>Salvar Alterações</Button>
      </CardFooter>
    </Card>
  );
}
