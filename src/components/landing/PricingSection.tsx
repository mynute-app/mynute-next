"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp, scaleIn, staggerContainer } from "./animations";
import { plans } from "./data";

const PricingSection = () => (
  <section id="precos" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="text-center mb-16"
      >
        <motion.div variants={fadeInUp}>
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Clock className="w-3 h-3 mr-1" />
            Receita SaaS Escalável
          </Badge>
        </motion.div>
        <motion.h2
          variants={fadeInUp}
          className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
        >
          Planos de Preços Transparentes
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="text-muted-foreground text-lg max-w-2xl mx-auto"
        >
          Comece grátis e escale conforme seu negócio cresce.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {plans.map((plan, index) => (
          <motion.div key={index} variants={scaleIn} whileHover={{ y: -5 }}>
            <Card
              className={`card-hover relative h-full ${
                plan.highlighted
                  ? "border-2 border-primary shadow-lg"
                  : "border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Mais Popular
                  </Badge>
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/empresa/cadastro">
                  <Button
                    className={`w-full ${plan.highlighted ? "btn-gradient" : ""}`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    Começar agora
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default PricingSection;
