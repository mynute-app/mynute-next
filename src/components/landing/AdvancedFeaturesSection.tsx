"use client";

import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp, scaleIn, staggerContainer } from "./animations";
import { advancedFeatures } from "./data";

const AdvancedFeaturesSection = () => (
  <section className="py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="text-center mb-16"
      >
        <motion.div variants={fadeInUp}>
          <Badge className="mb-4 bg-purple-500/10 text-purple-500 border-purple-500/20">
            <Rocket className="w-3 h-3 mr-1" />
            Escalabilidade
          </Badge>
        </motion.div>
        <motion.h2
          variants={fadeInUp}
          className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
        >
          Construído para Escalar com Simplicidade
        </motion.h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {advancedFeatures.map((feature, index) => (
          <motion.div key={index} variants={scaleIn}>
            <Card className="card-hover h-full text-center border-2 border-purple-500/20">
              <CardContent className="p-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4"
                >
                  <feature.icon className="w-6 h-6 text-purple-500" />
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

export default AdvancedFeaturesSection;
