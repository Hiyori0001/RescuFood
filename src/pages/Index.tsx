"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Heart, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MadeWithDyad } from '@/components/made-with-by-RescuFood';
import { cn } from '@/lib/utils';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pt-20">
      {/* Hero Section */}
      <section className="px-6 py-12 md:py-24 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-emerald-700 uppercase bg-emerald-100 rounded-full">
            Zero Waste • Zero Hunger
          </span>
          <h1 className="text-4xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Redistributing Surplus <br />
            <span className="text-emerald-600">For a Better World</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Our intelligent algorithm matches surplus food from providers with those who need it most, ensuring nothing goes to waste.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-2xl text-lg shadow-lg shadow-emerald-200">
              <Link to="/auth">Get Started <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 rounded-2xl text-lg border-slate-200">
              Learn How It Works
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Real-time Matching", desc: "Our algorithm identifies the nearest suitable NGO or beneficiary instantly.", color: "bg-amber-100 text-amber-600" },
            { icon: ShieldCheck, title: "Safety First", desc: "Automated verification ensures all food safety norms and certifications are met.", color: "bg-blue-100 text-blue-600" },
            { icon: Heart, title: "Community Impact", desc: "Track every meal saved and every kilogram of waste reduced in real-time.", color: "bg-rose-100 text-rose-600" }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", feature.color)}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <MadeWithDyad />
    </div>
  );
};

export default Index;