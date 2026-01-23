"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "./animations";
import { testimonials } from "./data";

const TestimonialsSection = () => (
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
          <Badge className="mb-4 bg-warning/10 text-warning border-warning/20">
            <Star className="w-3 h-3 mr-1" />
            Depoimentos
          </Badge>
        </motion.div>
        <motion.h2
          variants={fadeInUp}
          className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
        >
          O que nossos clientes dizem
        </motion.h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="grid md:grid-cols-3 gap-6"
      >
        {testimonials.map((testimonial, index) => (
          <motion.div key={index} variants={fadeInUp}>
            <Card className="card-hover h-full">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Star className="w-4 h-4 fill-accent text-accent" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-foreground mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default TestimonialsSection;
