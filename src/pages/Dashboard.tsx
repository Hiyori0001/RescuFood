"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, CheckCircle2, Clock, MapPin, Star, User, Navigation, Settings, ExternalLink, Loader2, RefreshCw, ArrowUpRight, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, Navigate } from 'react-router-dom';
import RoleInfo from '@/components/RoleInfo';

const Dashboard = () => {
  const { user, session, transactions, updateTransactionStatus, claimDelivery, loading, refreshData } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;
  if (!user) return null;

  const availableDeliveries = transactions.filter(t => t.status === 'Pending' && user.role === 'Volunteer');
  
  const myPendingRequests = transactions.filter(t => t.status === 'Pending' && t.beneficiaryId === user.id);

  const activeTransit = transactions.filter(t => 
    t.status === 'In Transit' && (t.providerId === user.id || t.beneficiaryId === user.id || t.volunteerId === user.id || user.role === 'Admin')
  );

  const completedHistory = transactions.filter(t => 
    t.status === 'Delivered' && (user.role === 'Admin' || t.providerId === user.id || t.beneficiaryId === user.id || t.volunteerId === user.id)
  );

  const openMap = (location?: string) => {
    if (!location) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, '_blank');
  };

  const openRoute = (origin?: string, destination?: string) => {
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin || 'Current Location')}&destination=${encodeURIComponent(destination || '')}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 md:pt-24">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <Link to="/profile" className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 overflow-hidden border-2 border-white shadow-sm hover:opacity-80 transition-opacity">
              {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-emerald-600" />}
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                <Button onClick={() => refreshData()} variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-emerald-50 text-slate-400 hover:text-emerald-600">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-emerald-50 text-slate-400 hover:text-emerald-600">
                  <Link to="/profile"><Settings className="w-4 h-4" /></Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <RoleInfo role={user.role} className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs" />
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs text-slate-600">{user.location || 'Location not set'}</span>
                  {user.location && <button onClick={() => openMap(user.location)} className="text-slate-400 hover:text-emerald-600"><ExternalLink className="w-3 h-3" /></button>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trust Score</p>
              <div className="flex items-center gap-1 justify-end">
                <span className="text-xl font-bold text-slate-900">4.9</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed</p>
              <div className="flex items-center gap-1 justify-end">
                <span className="text-xl font-bold text-slate-900">{completedHistory.length}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Volunteer: Available Deliveries */}
        {user.role === 'Volunteer' && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Available Deliveries ({availableDeliveries.length})
            </h2>
            <div className="grid gap-4">
              {availableDeliveries.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl text-center border border-slate-100">
                  <p className="text-slate-400 text-sm">No pending deliveries available right now.</p>
                </div>
              ) : (
                availableDeliveries.map((t) => (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-white border-l-4 border-blue-500">
                      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                            <Navigation className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{t.itemName}</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" /> Pickup: {t.providerLocation || 'Unknown'}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Dropoff: {t.beneficiaryLocation || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <Button onClick={() => claimDelivery(t.id)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-bold">
                          Accept Delivery
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        )}

        {/* NGO: My Requests */}
        {user.role === 'NGO' && myPendingRequests.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-blue-600" />
              My Pending Requests ({myPendingRequests.length})
            </h2>
            <div className="grid gap-4">
              {myPendingRequests.map((t) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white border-l-4 border-blue-500">
                    <div className="p-6 flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                          <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{t.itemName}</h3>
                          <p className="text-sm text-slate-500">Searching for a volunteer to deliver your request.</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-none">Searching Volunteer</Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Active Transit Tracking */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            Active Transit & Tracking ({activeTransit.length})
          </h2>
          <div className="grid gap-4">
            {activeTransit.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
                <p className="text-slate-400">No items currently in transit.</p>
              </div>
            ) : (
              activeTransit.map((t) => (
                <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                          <Truck className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900">{t.itemName}</h3>
                            <Badge className="bg-emerald-100 text-emerald-700 border-none">In Transit</Badge>
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <User className="w-3 h-3 text-emerald-600" /> 
                              Volunteer: <span className="font-bold text-slate-700">{t.volunteerName || 'Assigning...'}</span>
                            </p>
                            <button onClick={() => openMap(t.providerLocation)} className="text-xs text-slate-500 flex items-center gap-1 hover:text-emerald-600 transition-colors">
                              <MapPin className="w-3 h-3" /> Pickup: {t.providerLocation || 'Not specified'}
                            </button>
                            <button onClick={() => openMap(t.beneficiaryLocation)} className="text-xs text-slate-500 flex items-center gap-1 hover:text-emerald-600 transition-colors">
                              <MapPin className="w-3 h-3" /> Dropoff: {t.beneficiaryLocation || 'Not specified'}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button onClick={() => openRoute(t.providerLocation, t.beneficiaryLocation)} variant="outline" className="rounded-xl border-emerald-200 text-emerald-600">
                          <Navigation className="w-4 h-4 mr-2" /> View Route
                        </Button>
                        {(user.role === 'Volunteer' || user.role === 'Admin') && (
                          <Button onClick={() => updateTransactionStatus(t.id, t.itemId, 'Delivered')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Delivered
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="px-6 pb-6">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: '75%' }} />
                      </div>
                      <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Requested</span>
                        <span>Accepted</span>
                        <span className="text-emerald-600">In Transit</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Completed History */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-600" />
            Completed History ({completedHistory.length})
          </h2>
          <div className="grid gap-4">
            {completedHistory.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl text-center border border-slate-100">
                <p className="text-slate-400 text-sm">No completed transactions yet.</p>
              </div>
            ) : (
              completedHistory.slice(0, 5).map((t) => (
                <Card key={t.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white opacity-80">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{t.itemName}</h3>
                        <p className="text-[10px] text-slate-500">
                          {new Date(t.createdAt).toLocaleDateString()} • Delivered by {t.volunteerName || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-emerald-100 text-emerald-600">Delivered</Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;