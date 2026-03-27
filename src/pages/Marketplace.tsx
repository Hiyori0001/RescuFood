"use client";

import React, { useState } from 'react';
import { useApp, FoodItem } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Info, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const Marketplace = () => {
  const { inventory, requestFood, user } = useApp();
  const [filter, setFilter] = useState<'All' | 'Donated' | 'Paid'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const availableItems = inventory.filter(item => {
    const matchesStatus = item.status === 'Available';
    const matchesFilter = filter === 'All' || (filter === 'Donated' ? item.pricing === 'Donated' : item.pricing !== 'Donated');
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.providerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 md:pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Food Marketplace</h1>
            <p className="text-slate-500">Find surplus food near you</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search food or providers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-slate-200 rounded-xl shadow-sm focus:ring-emerald-500"
              />
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {availableItems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No items found</h3>
                <p className="text-slate-400 max-w-xs mx-auto mt-2">Try adjusting your search or filters to find what you're looking for.</p>
              </motion.div>
            ) : (
              availableItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
                    <div className="h-40 bg-emerald-50 flex items-center justify-center relative overflow-hidden">
                      <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-emerald-700 border-none shadow-sm z-10">
                        {item.type}
                      </Badge>
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                        <Navigation className="w-10 h-10 text-emerald-500" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 to-transparent" />
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{item.name}</h3>
                          <p className="text-sm text-slate-500 font-medium">{item.providerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-emerald-600">
                            {item.pricing === 'Donated' ? 'FREE' : `₹${item.price}`}
                          </p>
                          <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-tighter bg-slate-100 text-slate-500 border-none">
                            {item.pricing}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-slate-400" />
                          </div>
                          <span>{item.location} • <b>{item.distance} km away</b></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                            <Info className="w-4 h-4 text-slate-400" />
                          </div>
                          <span>Quantity: <b className="text-slate-900">{item.quantity}</b></span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => requestFood(item)}
                        disabled={!user || user.id === item.providerId}
                        className={cn(
                          "w-full rounded-2xl py-7 font-bold text-lg transition-all shadow-lg",
                          user?.id === item.providerId 
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100"
                        )}
                      >
                        {user?.id === item.providerId ? 'Your Listing' : 'Request Allocation'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;