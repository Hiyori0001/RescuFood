"use client";

import React, { useState } from 'react';
import { useApp, FoodItem } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Info, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Marketplace = () => {
  const { inventory, requestFood, user, isProcessing, transactions } = useApp();
  const [filter, setFilter] = useState<'All' | 'Donated' | 'Paid'>('All');

  const availableItems = inventory.filter(item => 
    item.status === 'Available' && 
    (filter === 'All' || (filter === 'Donated' ? item.pricing === 'Donated' : item.pricing !== 'Donated'))
  );

  const isVolunteer = user?.role === 'Volunteer';

  const isItemRequested = (itemId: string) => {
    return transactions.some(t => t.itemId === itemId && t.status !== 'Cancelled');
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

        {isVolunteer && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">As a Volunteer, you can view available food but cannot request allocations. Check the Dashboard for delivery tasks!</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableItems.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-100">
              <p className="text-slate-400">No food items available matching your criteria.</p>
            </div>
          ) : (
            availableItems.map((item) => {
              const requested = isItemRequested(item.id);
              return (
                <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
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
                      </div>

                      <Button 
                        onClick={() => requestFood(item)}
                        disabled={!user || user.id === item.providerId || isVolunteer || requested || isProcessing}
                        className={cn(
                          "w-full rounded-xl py-6 font-bold",
                          requested ? "bg-slate-100 text-slate-400" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        )}
                      >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                         requested ? 'Already Requested' :
                         user?.id === item.providerId ? 'Your Listing' : 
                         isVolunteer ? 'Volunteers Cannot Request' : 'Request Allocation'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;