"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, CheckCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "./animations";

const HeroSection = () => (
  <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-white">
    <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5" />
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.5, scale: 1 }}
      transition={{ duration: 1.5 }}
      className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
    />
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.5, scale: 1 }}
      transition={{ duration: 1.5, delay: 0.3 }}
      className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
    />

    <div className="max-w-7xl mx-auto relative">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="text-center max-w-4xl mx-auto"
      >
        <motion.div variants={fadeInUp}>
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Plataforma SaaS Multi-Tenant
          </Badge>
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
        >
          Agendamentos Inteligentes para{" "}
          <span className="text-gradient">Negócios Modernos</span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
        >
          Plataforma completa para simplificar e otimizar a gestão de
          agendamentos. Gerencie múltiplas filiais, equipes e serviços em um
          único painel.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/agendar">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" className="btn-gradient text-lg px-8 h-14">
                <Calendar className="w-5 h-5 mr-2" />
                Agendar agora
              </Button>
            </motion.div>
          </Link>
          <Link href="/empresa/cadastro">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 h-14 hover:text-black/50"
              >
                Sou empresa
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>Setup em 5 minutos</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>Plano grátis disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>Suporte humanizado</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
