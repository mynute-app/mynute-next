"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DeleteServiceDialogProps = {
  serviceName: string; 
  onConfirm: () => void; 
  onCancel: () => void;
};

export const DeleteServiceDialog = ({
  serviceName,
  onConfirm,
  onCancel,
}: DeleteServiceDialogProps) => {
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza de que deseja excluir o serviço{" "}
            <strong>{serviceName}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
