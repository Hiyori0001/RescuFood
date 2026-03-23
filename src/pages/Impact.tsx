"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Leaf, Users, Utensils, TrendingUp } from 'lucide-react';

const Impact = () => {
  const { impactMetrics } = useApp();

  const data = [
    { name: 'Mon', meals: 40 },
    { name: 'Tue', meals: 30 },
    { name: 'Wed', meals: 65 },
    { name: 'Thu', meals: 45 },
    { name: 'Fri', meals: 90 },
    { name: 'Sat', meals: 120 },
    { name: 'Sun', meals: 85 },
  ];

  const stats = [
    { label: 'Meals Served', value: impactMetrics.mealsSaved, icon: Utensils, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Waste Reduced (kg)', value: impactMetrics.wasteReduced, icon: Leaf, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Communities', value: impactMetrics.communitiesServed, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 md:pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Impact Analytics</h1>
          <p className="text-slate-500">Measuring our collective contribution to zero waste</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                <CardContent className="p-8 flex items-center gap-6">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
                    <stat.icon className={cn("w-8 h-8", stat.color)} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                    <h3 className="text-3xl font-bold text-slate-900">{stat.value.toLocaleString()}</h3>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm rounded-3xl p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Weekly Redistribution Trend
              </CardTitle>
            </CardHeader>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="meals" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMeals)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl p-6 bg-emerald-900 text-white">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Environmental Impact</CardTitle>
            </CardHeader>
            <div className="space-y-6">
              <div className="p-4 bg-emerald-800/50 rounded-2xl">
                <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">CO2 Emissions Saved</p>
                <h4 className="text-2xl font-bold">1,240 kg</h4>
                <p className="text-emerald-300 text-xs mt-1">Equivalent to planting 52 trees</p>
              </div>
              <div className="p-4 bg-emerald-800/50 rounded-2xl">
                <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">Water Saved</p>
                <h4 className="text-2xl font-bold">45,000 L</h4>
                <p className="text-emerald-300 text-xs mt-1">Saved from food production waste</p>
              </div>
              <div className="flex items-center gap-4 p-4 border border-emerald-700 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-medium">Your community is in the top 5% of waste reduction this month!</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Impact;