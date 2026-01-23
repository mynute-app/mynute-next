"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "./animations";
import { features } from "./data";

const SolutionSection = () => (
  <section id="solucao" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="text-center mb-16"
      >
        <motion.div variants={fadeInUp}>
          <Badge className="mb-4 bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-1" />A Solução
          </Badge>
        </motion.div>
        <motion.h2
          variants={fadeInUp}
          className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
        >
          Mynute: Plataforma Completa de Agendamentos
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="text-muted-foreground text-lg max-w-3xl mx-auto"
        >
          Plataforma SaaS poderosa e intuitiva para simplificar a gestão de
          agendamentos em múltiplas filiais, coordenando equipes e serviços a
          partir de um único painel.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={fadeInUp}>
            <Card className="card-hover group h-full border-2 border-black/10 shadow-sm">
              <CardContent className="p-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                >
                  <feature.icon className="w-6 h-6 text-primary" />
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default SolutionSection;
