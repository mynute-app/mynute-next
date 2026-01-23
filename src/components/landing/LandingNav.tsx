"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingNav = () => (
  <motion.nav
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="fixed top-0 left-0 right-0 z-50 bg-gray-100 border-b border-border/50"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-8 h-8 rounded-lg bg-black flex items-center justify-center"
          >
            <Calendar className="w-5 h-5 text-primary-foreground" />
          </motion.div>
          <span className="text-xl font-bold text-foreground">Mynute</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#problema"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Problema
          </a>
          <a
            href="#solucao"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Solução
          </a>
          <a
            href="#segmentos"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Segmentos
          </a>
          <a
            href="#precos"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Preços
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/register-company">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="sm" className="btn-gradient">
                Criar conta
              </Button>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  </motion.nav>
);

export default LandingNav;
