"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp, scaleIn, staggerContainer } from "./animations";
import { problems } from "./data";

const ProblemSection = () => (
  <section id="problema" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="text-center mb-16"
      >
        <motion.div variants={fadeInUp}>
          <Badge className="mb-4 bg-destructive/10 text-destructive border-destructive/20">
            <Zap className="w-3 h-3 mr-1" />O Problema
          </Badge>
        </motion.div>
        <motion.h2
          variants={fadeInUp}
          className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
        >
          A Crise de Agendamentos em Negócios de Serviços
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="text-muted-foreground text-lg max-w-2xl mx-auto"
        >
          A gestão de agendamentos enfrenta desafios que impactam diretamente a
          eficiência e rentabilidade.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="grid md:grid-cols-3 gap-8"
      >
        {problems.map((problem, index) => (
          <motion.div key={index} variants={scaleIn}>
            <Card className="card-hover border-2 border-destructive/20 h-full text-center">
              <CardContent className="p-8">
                <div className="text-5xl font-bold text-destructive mb-4">
                  {problem.stat}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {problem.label}
                </h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="text-center mt-8 text-muted-foreground"
      >
        A maioria das soluções existentes é{" "}
        <strong>cara, complexa ou não suporta múltiplas filiais</strong>.
      </motion.p>
    </div>
  </section>
);

export default ProblemSection;
