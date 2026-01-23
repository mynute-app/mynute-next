"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "./animations";
import { howItWorks } from "./data";

const HowItWorksSection = () => (
  <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="text-center mb-16"
      >
        <motion.div variants={fadeInUp}>
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
            <Zap className="w-3 h-3 mr-1" />
            Fluxo Simples
          </Badge>
        </motion.div>
        <motion.h2
          variants={fadeInUp}
          className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
        >
          3 Passos para Transformar seu Negócio
        </motion.h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="grid md:grid-cols-3 gap-8"
      >
        {howItWorks.map((item, index) => (
          <motion.div key={index} variants={fadeInUp} className="relative">
            <Card className="card-hover border-2 border-transparent hover:border-primary/20 h-full">
              <CardContent className="p-8">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
                >
                  <span className="text-2xl font-bold text-primary">
                    {item.step}
                  </span>
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-3 text-center">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {item.description}
                </p>
                <ul className="space-y-2">
                  {item.details.map((detail, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle className="w-4 h-4 text-success shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            {index < 2 && (
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-8 h-8 text-muted-foreground/30" />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default HowItWorksSection;
