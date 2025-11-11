"use client";

import { useState } from "react";
import { LoginFormEmployee } from "./form-employee";
import { LoginFormCode } from "./form-employee-code";

export function LoginFormSwitcher() {
  const [loginMode, setLoginMode] = useState<"password" | "code">("password");

  const toggleLoginMode = () => {
    setLoginMode(prev => (prev === "password" ? "code" : "password"));
  };

  return (
    <>
      {loginMode === "password" ? (
        <LoginFormEmployee
          provider="employee-login"
          onToggleMode={toggleLoginMode}
        />
      ) : (
        <LoginFormCode onToggleMode={toggleLoginMode} />
      )}
    </>
  );
}
