"use client";

import { useState } from "react";
import { ClientVerifyCodeDialog } from "./client-verify-code-dialog";

interface UnverifiedEmailAlertProps {
  email: string;
  onVerificationSuccess: (token: string) => void;
}

export function UnverifiedEmailAlert({
  email,
  onVerificationSuccess,
}: UnverifiedEmailAlertProps) {
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);

  return (
    <>
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
        <p className="font-medium text-yellow-700">⚠️ Email não verificado</p>
        <p className="text-xs text-yellow-600 mt-1">
          Você receberá um código de verificação por email para continuar.{" "}
          <button
            type="button"
            onClick={() => {
              setIsVerifyDialogOpen(true);
            }}
            className="text-yellow-700 underline hover:text-yellow-800 font-medium"
          >
            Verificar agora
          </button>
        </p>
      </div>

      <ClientVerifyCodeDialog
        open={isVerifyDialogOpen}
        onOpenChange={setIsVerifyDialogOpen}
        email={email}
        onSuccess={onVerificationSuccess}
      />
    </>
  );
}
