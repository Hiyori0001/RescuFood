"use client";

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Leaf, Users, Utensils, TrendingUp, Droplets, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

const Impact = () => {
  const { impactMetrics } = useApp();
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrend = async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('transactions')
        .select('created_at')
        .eq('status', 'Delivered')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (!error && data) {
        // Group by day
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            name: days[d.getDay()],
            fullDate: d.toISOString().split('T')[0],
            meals: 0
          };
        });

        data.forEach(t => {
          const date = t.created_at.split('T')[0];
          const dayObj = last7Days.find(d => d.fullDate === date);
          if (dayObj) dayObj.meals += 10; // Assuming 10 meals per transaction for visualization
        });

        setTrendData(last7Days);
      }
      setLoading(false);
    };

    fetchTrend();
  }, []);

  // Environmental Impact Calculations (Standard Estimates)
  // 1kg food waste saved = ~2.5kg CO2e
  // 1kg food waste saved = ~250L water
  const co2Saved = (impactMetrics.wasteReduced * 2.5).toFixed(1);
  const waterSaved = (impactMetrics.wasteReduced * 250).toLocaleString();
  const treesEquivalent = Math.floor(Number(co2Saved) / 20); // 1 tree absorbs ~20kg CO2/year

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
          <p className="text-slate-500">Real-time measurement of our collective contribution</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
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
          <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Weekly Redistribution Trend
              </CardTitle>
            </CardHeader>
            <div className="h-[300px] w-full">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-2xl animate-pulse">
                  <p className="text-slate-400 text-sm">Loading trend data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
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
              )}
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl p-6 bg-emerald-900 text-white">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Environmental Impact</CardTitle>
            </CardHeader>
            <div className="space-y-6">
              <div className="p-4 bg-emerald-800/50 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">CO2 Emissions Saved</p>
                  <h4 className="text-2xl font-bold">{co2Saved} kg</h4>
                  <p className="text-emerald-300 text-xs mt-1">Equivalent to planting {treesEquivalent} trees</p>
                </div>
              </div>
              
              <div className="p-4 bg-emerald-800/50 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">Water Saved</p>
                  <h4 className="text-2xl font-bold">{waterSaved} L</h4>
                  <p className="text-emerald-300 text-xs mt-1">Saved from food production waste</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border border-emerald-700 rounded-2xl bg-emerald-800/20">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-medium">Your community has reduced waste by {impactMetrics.wasteReduced}kg this month!</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Impact;