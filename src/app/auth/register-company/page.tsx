"use client";

import { motion } from "framer-motion";
import { RegisterFormCompany } from "./_components/form-employee-register";

export default function RegisterEmployeePage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Coluna da esquerda: Formulário */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-lg">
          <RegisterFormCompany />
        </div>
      </div>

      <div className="relative overflow-hidden flex flex-col justify-center bg-muted px-10 py-12 text-left">
        {/* Fundo animado com blobs */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="pointer-events-none absolute inset-0"
        >
          <motion.div
            className="absolute w-72 h-72 bg-blue-300 rounded-full filter blur-3xl opacity-30"
            animate={{
              x: [0, 50, 0],
              y: [0, -50, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 10,
              ease: "easeInOut",
            }}
            style={{ top: "20%", left: "-10%" }}
          />

          <motion.div
            className="absolute w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-20"
            animate={{
              x: [0, -40, 0],
              y: [0, 60, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 12,
              ease: "easeInOut",
            }}
            style={{ bottom: "10%", right: "-15%" }}
          />
        </motion.div>

        {/* Texto sobreposto */}
        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-[#1a2b47] md:text-5xl lg:text-6xl">
            Faça parte da equipe da sua empresa
          </h1>
          <p className="text-lg text-muted-foreground">
            Crie sua conta de funcionário para acessar o sistema e colaborar com
            sua equipe de forma mais organizada e eficiente.
          </p>
        </div>
      </div>
    </div>
  );
}
