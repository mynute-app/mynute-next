"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "./animations";
import { segments } from "./data";

const SegmentsSection = () => (
  <section id="segmentos" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="text-center mb-16"
      >
        <motion.div variants={fadeInUp}>
          <Badge className="mb-4 bg-warning/10 text-warning border-warning/20">
            <Users className="w-3 h-3 mr-1" />
            Segmentos-Alvo
          </Badge>
        </motion.div>
        <motion.h2
          variants={fadeInUp}
          className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
        >
          Para Diversos Negócios de Serviços
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="text-muted-foreground text-lg max-w-2xl mx-auto"
        >
          Projetada para empresas que se beneficiam da gestão eficiente de
          agendamentos, com foco em negócios com múltiplas filiais ou que buscam
          escalabilidade.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {segments.map((segment, index) => (
          <motion.div key={index} variants={fadeInUp}>
            <Card className="card-hover h-full border-2 border-warning/20">
              <CardContent className="p-6 text-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-4"
                >
                  <segment.icon className="w-6 h-6 text-warning" />
                </motion.div>
                <h3 className="font-semibold text-foreground mb-2">
                  {segment.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {segment.examples}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default SegmentsSection;
