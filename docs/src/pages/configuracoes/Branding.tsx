import { Upload, Image, Palette, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ConfigBranding() {
  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Branding & Mídias</h1>
        <p className="page-description">
          Personalize a identidade visual do seu negócio
        </p>
      </div>

      {/* Logo Section */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Image className="w-5 h-5 text-primary" />
          Logo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Logo Principal (claro)</Label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Arraste uma imagem ou clique para fazer upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, SVG até 2MB
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <Label>Logo Alternativa (escuro)</Label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-sidebar">
              <Upload className="w-8 h-8 mx-auto text-sidebar-foreground/50 mb-2" />
              <p className="text-sm text-sidebar-foreground/70">
                Arraste uma imagem ou clique para fazer upload
              </p>
              <p className="text-xs text-sidebar-foreground/50 mt-1">
                PNG, SVG até 2MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Favicon */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Favicon</h2>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center border-2 border-dashed border-border">
            <Image className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Fazer upload
            </Button>
            <p className="text-xs text-muted-foreground">
              Recomendado: 32x32px ou 64x64px, formato ICO ou PNG
            </p>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Banner Principal (Hero)
        </h2>
        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Arraste uma imagem ou clique para fazer upload
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Recomendado: 1920x600px, JPG ou PNG até 5MB
          </p>
        </div>
      </div>

      {/* Gallery */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Galeria do Negócio
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Imagens do espaço, equipamentos, antes/depois de serviços
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer"
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-4">
          <Upload className="w-4 h-4 mr-2" />
          Adicionar mais imagens
        </Button>
      </div>

      {/* Colors */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Cores da Marca
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Cor Principal</Label>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary border border-border" />
              <Input defaultValue="#1f9d8a" className="flex-1" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cor de Destaque</Label>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-accent border border-border" />
              <Input defaultValue="#f59e0b" className="flex-1" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cor de Sucesso</Label>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-success border border-border" />
              <Input defaultValue="#22c55e" className="flex-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Type className="w-5 h-5 text-primary" />
          Informações do Negócio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Nome do Negócio</Label>
            <Input defaultValue="Lavable Auto Center" />
          </div>
          <div className="space-y-2">
            <Label>Slogan</Label>
            <Input defaultValue="Cuidamos do seu carro como você cuida da sua família" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="btn-gradient">Salvar Alterações</Button>
      </div>
    </div>
  );
}
