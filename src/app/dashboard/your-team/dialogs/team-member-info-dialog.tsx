"use client";

import { Mail, Phone, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Employee } from "../../../../../types/company";

type TeamMemberInfoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Employee | null;
};

export function TeamMemberInfoDialog({
  open,
  onOpenChange,
  member,
}: TeamMemberInfoDialogProps) {
  const initials = [member?.name, member?.surname]
    .map(value => (value || "").trim())
    .filter(Boolean)
    .map(value => value[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const profileImage = member?.meta?.design?.images?.profile?.url || "";
  const displayEmail =
    member?.email ||
    (member as { user?: { email?: string } } | null)?.user?.email ||
    "";
  const displayPhone =
    member?.phone ||
    (member as { phone_number?: string } | null)?.phone_number ||
    "";
  const displayBio =
    (member as { bio?: string } | null)?.bio ||
    (member as { description?: string } | null)?.description ||
    "";
  const displayNickname =
    (member as { nickname?: string } | null)?.nickname || "";
  const isActive =
    (member as { active?: boolean } | null)?.active ??
    (member as { is_active?: boolean } | null)?.is_active ??
    true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>
            {member ? "Editar profissional" : "Carregando profissional..."}
          </DialogTitle>
          <DialogDescription>
            {member
              ? "Visualize as informacoes do profissional."
              : "Aguarde enquanto carregamos as informacoes."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          {!member ? (
            <div className="py-6 text-sm text-muted-foreground">
              Buscando dados do profissional.
            </div>
          ) : (
            <div className="mt-4 pb-6 space-y-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={member.name || "Profissional"}
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : initials ? (
                    initials
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Foto do profissional</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload indisponivel no momento.
                  </p>
                  <Button type="button" variant="outline" size="sm" disabled>
                    <Upload className="w-4 h-4 mr-2" />
                    Escolher arquivo
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={`${member.name || ""} ${member.surname || ""}`.trim()}
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nickname">Apelido</Label>
                  <Input
                    id="nickname"
                    value={displayNickname}
                    readOnly
                    placeholder="Sem apelido"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={displayEmail}
                      readOnly
                      placeholder="Email nao informado"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={displayPhone}
                      readOnly
                      placeholder="Telefone nao informado"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio / Descricao</Label>
                  <Textarea
                    id="bio"
                    value={displayBio}
                    readOnly
                    placeholder="Nenhuma descricao cadastrada"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label>Profissional ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    Profissionais inativos nao recebem agendamentos
                  </p>
                </div>
                <Switch checked={isActive} disabled />
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
