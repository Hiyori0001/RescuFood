"use client";

import React, { useState } from 'react';
import { useApp, FoodItem } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Info, CheckCircle2 } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const Marketplace = () => {
  const { inventory, requestFood, user } = useApp();
  const [filter, setFilter] = useState<'All' | 'Donated' | 'Paid'>('All');

  const availableItems = inventory.filter(item => 
    item.status === 'Available' && 
    (filter === 'All' || (filter === 'Donated' ? item.pricing === 'Donated' : item.pricing !== 'Donated'))
  );

  const handleRequest = (id: string) => {
    requestFood(id);
    showSuccess('Request sent! The provider will be notified for verification.');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 md:pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Food Marketplace</h1>
            <p className="text-slate-500">Find surplus food near you</p>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            {(['All', 'Donated', 'Paid'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  filter === f ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="h-32 bg-emerald-50 flex items-center justify-center relative">
                  <Badge className="absolute top-4 right-4 bg-white text-emerald-700 border-none shadow-sm">
                    {item.type}
                  </Badge>
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Navigation className="w-8 h-8 text-emerald-500" />
                  </div>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
                      <p className="text-sm text-slate-500">{item.providerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">
                        {item.pricing === 'Donated' ? 'FREE' : `₹${item.price}`}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{item.pricing}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{item.location} • <b>{item.distance} km away</b></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Info className="w-4 h-4 text-slate-400" />
                      <span>Quantity: {item.quantity}</span>
                    </div>
                    {item.isNearExpiry && (
                      <Badge variant="destructive" className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-50">
                        Expires Soon
                      </Badge>
                    )}
                  </div>

                  <Button 
                    onClick={() => handleRequest(item.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 font-bold"
                  >
                    Request Allocation
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;