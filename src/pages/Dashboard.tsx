"use client";

import React, { useState } from 'react';
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
  Package,
  History,
  AlertCircle,
  RefreshCw,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { user, session, loading, transactions, updateTransactionStatus, claimDelivery, refreshProfile } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProfile();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

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

  // Filter for Providers/Admins: Pending requests for their items
  const incomingRequests = transactions.filter(t => {
    if (t.status !== 'Pending') return false;
    if (t.providerId === user.id) return true;
    if (user.role === 'Admin' && t.beneficiaryId !== user.id) return true;
    return false;
  });

  // Filter for Volunteers: Available tasks (Approved by provider but no volunteer assigned yet)
  const availableTasks = transactions.filter(t => 
    t.status === 'Approved' && !t.volunteerId
  );

  // Filter for Volunteers: My active deliveries (Tasks I've claimed)
  const myDeliveries = transactions.filter(t => 
    t.volunteerId === user.id && (t.status === 'Approved' || t.status === 'In Transit')
  );

  // General active logistics for others (Providers/Beneficiaries/Admins)
  const activeLogistics = transactions.filter(t => {
    const isActive = t.status === 'Approved' || t.status === 'In Transit';
    if (!isActive) return false;
    if (user.role === 'Volunteer') return false; // Volunteers use the sections above
    return t.providerId === user.id || t.beneficiaryId === user.id || user.role === 'Admin';
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
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              className={cn("rounded-xl border-slate-200 bg-white", isRefreshing && "animate-spin")}
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
            </Button>
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
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* VOLUNTEER SECTION: Available Tasks */}
            {(user.role === 'Volunteer' || user.role === 'Admin') && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    Available for Pickup
                  </h2>
                  <Badge className="bg-blue-100 text-blue-700">{availableTasks.length} Tasks</Badge>
                </div>
                
                <div className="space-y-4">
                  {availableTasks.length === 0 ? (
                    <Card className="border-none shadow-sm rounded-3xl p-8 text-center bg-white/50 border border-dashed border-slate-200">
                      <p className="text-slate-400">No tasks currently available for pickup. Check back soon!</p>
                    </Card>
                  ) : (
                    availableTasks.map((t) => (
                      <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-white border-l-4 border-blue-500">
                          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                                <Package className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900">{t.itemName}</h3>
                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> Ready for pickup at Provider location
                                </p>
                              </div>
                            </div>
                            <Button 
                              onClick={() => claimDelivery(t.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                            >
                              Claim Delivery
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </section>
            )}

            {/* VOLUNTEER SECTION: My Active Deliveries */}
            {(user.role === 'Volunteer' || user.role === 'Admin') && myDeliveries.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-emerald-600" />
                    My Active Deliveries
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {myDeliveries.map((t) => (
                    <motion.div key={t.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                      <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-white border-l-4 border-emerald-500">
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                                <Truck className="w-6 h-6 text-emerald-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900">{t.itemName}</h3>
                                <p className="text-sm text-slate-500">
                                  {t.status === 'Approved' ? 'Please pick up the item' : 'In transit to destination'}
                                </p>
                              </div>
                            </div>
                            <Button 
                              onClick={() => updateTransactionStatus(t.id, t.itemId, 'Delivered')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Delivered
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* PROVIDER SECTION: Incoming Requests */}
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
                                <p className="text-sm text-slate-500">Provider Action Required</p>
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

            {/* GENERAL SECTION: Active Logistics (For non-volunteers) */}
            {user.role !== 'Volunteer' && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-emerald-600" />
                    Active Logistics
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {activeLogistics.length === 0 ? (
                    <Card className="border-none shadow-sm rounded-3xl p-8 text-center bg-white/50 border border-dashed border-slate-200">
                      <p className="text-slate-400">No active deliveries in progress.</p>
                    </Card>
                  ) : (
                    activeLogistics.map((t) => (
                      <motion.div key={t.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                        <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-white">
                          <div className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                t.status === 'In Transit' ? "bg-blue-50" : "bg-emerald-50"
                              )}>
                                {t.status === 'In Transit' ? <Truck className="w-6 h-6 text-blue-600" /> : <Package className="w-6 h-6 text-emerald-600" />}
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900">{t.itemName}</h3>
                                <p className="text-sm text-slate-500">
                                  {t.status === 'In Transit' ? 'On the way to destination' : 'Waiting for a volunteer'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </section>
            )}
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