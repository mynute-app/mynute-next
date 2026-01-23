import { Calendar } from "lucide-react";

const FooterSection = () => (
  <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-sidebar-background text-black/80">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Mynute</span>
          </div>
          <p className="text-sm text-black/70">
            Agendamentos inteligentes para negócios modernos.
          </p>
          <p className="text-xs text-black/50 mt-2">mynute.app</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Produto</h4>
          <ul className="space-y-2 text-sm text-black/70">
            <li>
              <a
                href="#solucao"
                className="hover:text-sidebar-foreground transition-colors"
              >
                Funcionalidades
              </a>
            </li>
            <li>
              <a
                href="#segmentos"
                className="hover:text-sidebar-foreground transition-colors"
              >
                Segmentos
              </a>
            </li>
            <li>
              <a
                href="#precos"
                className="hover:text-sidebar-foreground transition-colors"
              >
                Preços
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Empresa</h4>
          <ul className="space-y-2 text-sm text-black/70">
            <li>
              <a
                href="#"
                className="hover:text-sidebar-foreground transition-colors"
              >
                Sobre nós
              </a>
            </li>
            {/* <li>
              <a
                href="#"
                className="hover:text-sidebar-foreground transition-colors"
              >
                Carreiras
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-sidebar-foreground transition-colors"
              >
                Blog
              </a>
            </li> */}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Suporte</h4>
          <ul className="space-y-2 text-sm text-black/70">
            <li>
              <a
                href="#"
                className="hover:text-sidebar-foreground transition-colors"
              >
                Central de ajuda
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-sidebar-foreground transition-colors"
              >
                Contato
              </a>
            </li>
            {/* <li>
              <a
                href="#"
                className="hover:text-sidebar-foreground transition-colors"
              >
                Status
              </a>
            </li> */}
          </ul>
        </div>
      </div>
      <div className="pt-8 border-t border-black/20 text-sm text-black/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© 2025 Mynute. Todos os direitos reservados.</p>
        {/* <div className="flex gap-6">
          <a
            href="#"
            className="hover:text-sidebar-foreground transition-colors"
          >
            Termos de uso
          </a>
          <a
            href="#"
            className="hover:text-sidebar-foreground transition-colors"
          >
            Privacidade
          </a>
        </div> */}
      </div>
    </div>
  </footer>
);

export default FooterSection;
