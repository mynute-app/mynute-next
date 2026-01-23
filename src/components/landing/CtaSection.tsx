"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeIn, fadeInUp } from "./animations";

const CtaSection = () => (
  <motion.section
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={fadeIn}
    className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-100 to-white"
  >
    <div className="max-w-4xl mx-auto text-center">
      <motion.h2
        variants={fadeInUp}
        className="text-3xl sm:text-4xl font-bold mb-6"
      >
        Pronto para transformar seu negócio?
      </motion.h2>
      <motion.p
        variants={fadeInUp}
        className="text-lg opacity-90 mb-8 max-w-2xl mx-auto"
      >
        Junte-se a milhares de empresas que já simplificaram seus agendamentos e
        aumentaram seu faturamento com a Mynute.
      </motion.p>
      <motion.div
        variants={fadeInUp}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Link href="/auth/register-company">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button size="lg" className="text-lg px-8 h-14 btn-gradient">
              <Building2 className="w-5 h-5 mr-2" />
              Cadastrar minha empresa
            </Button>
          </motion.div>
        </Link>
      
      </motion.div>
    </div>
  </motion.section>
);

export default CtaSection;
