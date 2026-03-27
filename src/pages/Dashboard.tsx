"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Star, 
  User, 
  XCircle, 
  ArrowDownLeft, 
  ArrowUpRight,
  Package,
  History,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { user, session, loading, transactions, updateTransactionStatus, claimDelivery } = useApp();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  );

  if (!session || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="max-w-md w-full p-8 text-center rounded-3xl border-none shadow-xl">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Session Expired</h2>
        <p className="text-slate-500 mb-6">Please log in again to access your dashboard.</p>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 w-full rounded-xl py-6">
          <a href="/auth">Go to Login</a>
        </Button>
      </Card>
    </div>
  );

  const incomingRequests = transactions.filter(t => {
    if (t.status !== 'Pending') return false;
    if (t.providerId === user.id) return true;
    if (user.role === 'Admin' && t.beneficiaryId !== user.id) return true;
    return false;
  });

  const myRequests = transactions.filter(t => 
    t.beneficiaryId === user.id && t.status !== 'Delivered' && t.status !== 'Cancelled'
  );

  const activeDeliveries = transactions.filter(t => {
    const isActive = t.status === 'Approved' || t.status === 'In Transit';
    if (!isActive) return false;
    
    if (user.role === 'Admin') return true;
    if (user.role === 'Volunteer') return !t.volunteerId || t.volunteerId === user.id;
    return t.providerId === user.id || t.beneficiaryId === user.id;
  });

  const history = transactions.filter(t => 
    t.status === 'Delivered' || t.status === 'Cancelled'
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 md:pt-24">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <User className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Hello, {user.name}</h1>
            </div>
            <p className="text-slate-500 flex items-center gap-2">
              Account Type: <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none">{user.role}</Badge>
            </p>
          </div>
          
          <div className="flex gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="text-center px-4 border-r border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trust Score</p>
              <div className="flex items-center gap-1 justify-center">
                <span className="text-2xl font-bold text-slate-900">4.9</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div className="text-center px-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Impact</p>
              <div className="flex items-center gap-1 justify-center">
                <span className="text-2xl font-bold text-slate-900">{transactions.filter(t => t.status === 'Delivered').length}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* SECTION: Incoming Requests */}
            {(user.role === 'Provider' || user.role === 'Admin') && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                    Incoming Requests
                  </h2>
                  <Badge className="bg-emerald-100 text-emerald-700">{incomingRequests.length}</Badge>
                </div>
                
                <div className="space-y-4">
                  {incomingRequests.length === 0 ? (
                    <Card className="border-none shadow-sm rounded-3xl p-8 text-center bg-white/50 border border-dashed border-slate-200">
                      <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-400">No pending requests for your items.</p>
                    </Card>
                  ) : (
                    incomingRequests.map((t) => (
                      <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-white border-l-4 border-emerald-500">
                          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                                <Clock className="w-6 h-6 text-emerald-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900">{t.itemName}</h3>
                                <p className="text-sm text-slate-500">
                                  {t.providerId === user.id ? 'Requested from your listing' : 'Global Request'}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{new Date(t.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                onClick={() => updateTransactionStatus(t.id, t.itemId, 'Approved')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                              >
                                Accept Request
                              </Button>
                              <Button 
                                variant="ghost"
                                onClick={() => updateTransactionStatus(t.id, t.itemId, 'Cancelled')}
                                className="text-rose-500 hover:bg-rose-50 rounded-xl"
                              >
                                <XCircle className="w-5 h-5" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </section>
            )}

            {/* SECTION: Active Logistics (The "What's Next" Section) */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  Active Logistics & Delivery
                </h2>
                <Badge className="bg-emerald-100 text-emerald-700">{activeDeliveries.length}</Badge>
              </div>
              
              <div className="space-y-4">
                {activeDeliveries.length === 0 ? (
                  <Card className="border-none shadow-sm rounded-3xl p-8 text-center bg-white/50 border border-dashed border-slate-200">
                    <p className="text-slate-400">No active deliveries in progress. Once a request is accepted, it will appear here.</p>
                  </Card>
                ) : (
                  activeDeliveries.map((t) => (
                    <motion.div key={t.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                      <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-white">
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                            <div className="flex items-start gap-4">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                t.status === 'In Transit' ? "bg-blue-50" : "bg-emerald-50"
                              )}>
                                {t.status === 'In Transit' ? <Truck className="w-6 h-6 text-blue-600" /> : <Package className="w-6 h-6 text-emerald-600" />}
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900">{t.itemName}</h3>
                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> 
                                  {t.status === 'In Transit' ? 'On the way to destination' : 'Waiting for a volunteer to pick up'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {user.role === 'Volunteer' && t.status === 'Approved' && !t.volunteerId && (
                                <Button 
                                  onClick={() => claimDelivery(t.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                                >
                                  Claim Delivery
                                </Button>
                              )}
                              {(t.volunteerId === user.id || user.role === 'Admin') && t.status === 'In Transit' && (
                                <Button 
                                  onClick={() => updateTransactionStatus(t.id, t.itemId, 'Delivered')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Delivered
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Logistics Timeline */}
                          <div className="grid grid-cols-3 gap-2 relative">
                            <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100 -z-0" />
                            {[
                              { label: 'Accepted', active: true, icon: CheckCircle2 },
                              { label: 'In Transit', active: t.status === 'In Transit', icon: Truck },
                              { label: 'Delivered', active: t.status === 'Delivered', icon: Package }
                            ].map((step, i) => (
                              <div key={i} className="flex flex-col items-center text-center relative z-10">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center mb-2 border-2",
                                  step.active ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 text-slate-300"
                                )}>
                                  <step.icon className="w-4 h-4" />
                                </div>
                                <span className={cn(
                                  "text-[10px] font-bold uppercase tracking-wider",
                                  step.active ? "text-emerald-600" : "text-slate-400"
                                )}>{step.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" />
                Recent Activity
              </h2>
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                <div className="divide-y divide-slate-50">
                  {history.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No recent history.</div>
                  ) : (
                    history.map((t) => (
                      <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-slate-900 text-sm">{t.itemName}</p>
                          <Badge variant="outline" className={cn(
                            "text-[10px] uppercase",
                            t.status === 'Delivered' ? "text-emerald-600 border-emerald-100" : "text-rose-600 border-rose-100"
                          )}>
                            {t.status}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </section>

            <Card className="border-none shadow-lg rounded-3xl bg-emerald-900 text-white p-6">
              <h3 className="font-bold text-lg mb-4">Community Goal</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-emerald-300">Monthly Target</span>
                    <span className="font-bold">85%</span>
                  </div>
                  <div className="h-2 w-full bg-emerald-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[85%]" />
                  </div>
                </div>
                <p className="text-xs text-emerald-200 leading-relaxed">
                  We're close to saving 5,000 meals this month! Keep up the great work.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;