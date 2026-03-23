"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, CheckCircle2, Clock, MapPin, Star } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const Dashboard = () => {
  const { user, inventory, completeTransaction } = useApp();

  const activeRequests = inventory.filter(item => 
    item.status === 'Requested' || item.status === 'Allocated'
  );

  const handleComplete = (id: string) => {
    completeTransaction(id);
    showSuccess('Transaction completed! Impact logged.');
  };

  if (!user) return <div className="p-20 text-center">Please login to view dashboard.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 md:pt-24">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user.name}</h1>
          <p className="text-slate-500">Role: <span className="font-bold text-emerald-600">{user.role}</span></p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Card className="border-none shadow-sm rounded-3xl bg-emerald-600 text-white">
            <CardContent className="p-6">
              <p className="text-emerald-100 text-sm font-medium mb-1">Active Tasks</p>
              <h3 className="text-4xl font-bold">{activeRequests.length}</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardContent className="p-6">
              <p className="text-slate-500 text-sm font-medium mb-1">Completed</p>
              <h3 className="text-4xl font-bold text-slate-900">24</h3>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardContent className="p-6">
              <p className="text-slate-500 text-sm font-medium mb-1">Trust Score</p>
              <div className="flex items-center gap-2">
                <h3 className="text-4xl font-bold text-slate-900">4.9</h3>
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-emerald-600" />
          Active Logistics & Requests
        </h2>

        <div className="space-y-4">
          {activeRequests.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
              <p className="text-slate-400">No active requests at the moment.</p>
            </div>
          ) : (
            activeRequests.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{item.name}</h3>
                          <Badge className="bg-amber-100 text-amber-700 border-none">{item.status}</Badge>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.location} • From: {item.providerName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button variant="outline" className="rounded-xl border-slate-200">
                        Track Pickup
                      </Button>
                      <Button 
                        onClick={() => handleComplete(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Delivered
                      </Button>
                    </div>
                  </div>
                  
                  {/* Step 8: Logistics Progress */}
                  <div className="px-6 pb-6">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-2/3 transition-all duration-1000" />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Requested</span>
                      <span className="text-emerald-600">In Transit</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;