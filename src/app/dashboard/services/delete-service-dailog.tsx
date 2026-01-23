"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

type DeleteServiceDialogProps = {
  isOpen: boolean;
  serviceName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const DeleteServiceDialog = ({
  isOpen,
  serviceName,
  onConfirm,
  onCancel,
}: DeleteServiceDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Excluir Serviço</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Tem certeza que deseja excluir o serviço{" "}
            <strong className="text-foreground">{serviceName}</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita e o serviço será removido
            permanentemente.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Excluir Serviço
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
