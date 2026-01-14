import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import Agenda from "@/pages/Agenda";
import Agendamentos from "@/pages/Agendamentos";
import Clientes from "@/pages/Clientes";
import Servicos from "@/pages/Servicos";
import Equipe from "@/pages/Equipe";
import ConfigBranding from "@/pages/configuracoes/Branding";
import ConfigServicos from "@/pages/configuracoes/ServicosConfig";
import ConfigEquipe from "@/pages/configuracoes/EquipeConfig";
import ConfigAgendamento from "@/pages/configuracoes/Agendamento";
import Agendar from "@/pages/Agendar";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public booking page */}
          <Route path="/agendar" element={<Agendar />} />
          
          {/* Admin routes */}
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/agendamentos" element={<Agendamentos />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/equipe" element={<Equipe />} />
            <Route path="/configuracoes/branding" element={<ConfigBranding />} />
            <Route path="/configuracoes/servicos" element={<ConfigServicos />} />
            <Route path="/configuracoes/equipe" element={<ConfigEquipe />} />
            <Route path="/configuracoes/agendamento" element={<ConfigAgendamento />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
