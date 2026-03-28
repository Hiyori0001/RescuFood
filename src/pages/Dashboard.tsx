"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Truck, CheckCircle2, Clock, MapPin, Star, User, XCircle, ArrowDownLeft, Info, Navigation, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import RoleInfo from '@/components/RoleInfo';

const Dashboard = () => {
  const { user, transactions, updateTransactionStatus, claimDelivery, updateLocation } = useApp();
  const [newLocation, setNewLocation] = useState(user?.location || '');
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  if (!user) return <div className="p-20 text-center">Please login to view dashboard.</div>;

  const incomingRequests = transactions.filter(t => 
    (t.providerId === user.id || user.role === 'Admin') && t.status === 'Pending'
  );

  const myActiveTasks = transactions.filter(t => {
    const isFinished = t.status === 'Delivered' || t.status === 'Cancelled';
    if (isFinished) return false;
    if ((t.providerId === user.id || user.role === 'Admin') && t.status === 'Pending') return false;
    if (user.role === 'Admin') return true;
    const isInvolved = t.providerId === user.id || t.beneficiaryId === user.id || t.volunteerId === user.id;
    const isAvailableForVolunteer = user.role === 'Volunteer' && t.status === 'Approved' && !t.volunteerId;
    return isInvolved || isAvailableForVolunteer;
  });
  
  const completedCount = transactions.filter(t => 
    t.status === 'Delivered' && 
    (user.role === 'Admin' || t.providerId === user.id || t.beneficiaryId === user.id || t.volunteerId === user.id)
  ).length;

  const openMap = (origin?: string, destination?: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin || 'Current Location')}&destination=${encodeURIComponent(destination || '')}`;
    window.open(url, '_blank');
  };

  const handleSaveLocation = async () => {
    await updateLocation(newLocation);
    setIsEditingLocation(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 md:pt-24">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">Welcome, {user.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <RoleInfo role={user.role} className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs" />
              
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                <MapPin className="w-3 h-3 text-emerald-600" />
                {isEditingLocation ? (
                  <div className="flex items-center gap-2">
                    <Input 
                      value={newLocation} 
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="h-6 text-xs w-32 border-none bg-slate-50"
                      placeholder="Enter location..."
                    />
                    <button onClick={handleSaveLocation} className="text-emerald-600 hover:text-emerald-700">
                      <Save className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditingLocation(true)} className="text-xs text-slate-600 hover:text-emerald-600 transition-colors">
                    {user.location || 'Set Current Location'}
                  </button>
                )}
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
                <span className="text-xl font-bold text-slate-900">{completedCount}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </header>

        {incomingRequests.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
              {user.role === 'Admin' ? 'All Pending Requests' : 'Incoming Requests'} ({incomingRequests.length})
            </h2>
            <div className="grid gap-4">
              {incomingRequests.map((t) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-white border-l-4 border-emerald-500">
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                          <Clock className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{t.itemName}</h3>
                          <p className="text-sm text-slate-500">Requested by an NGO</p>
                          <p className="text-xs text-slate-400 mt-1">Created: {new Date(t.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button onClick={() => updateTransactionStatus(t.id, t.itemId, 'Approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6">
                          Approve Request
                        </Button>
                        <Button variant="outline" onClick={() => updateTransactionStatus(t.id, t.itemId, 'Cancelled')} className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl">
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-emerald-600" />
          {user.role === 'Volunteer' ? 'Available Deliveries & Tasks' : 'Active Logistics & Requests'}
        </h2>

        <div className="space-y-4">
          {myActiveTasks.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
              <p className="text-slate-400">No active tasks at the moment.</p>
            </div>
          ) : (
            myActiveTasks.map((t) => (
              <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", t.status === 'In Transit' ? "bg-blue-50" : "bg-emerald-50")}>
                        {t.status === 'In Transit' ? <Truck className="w-6 h-6 text-blue-600" /> : <Clock className="w-6 h-6 text-emerald-600" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{t.itemName}</h3>
                          <Badge className={cn("border-none", t.status === 'In Transit' ? "bg-blue-100 text-blue-700" : t.status === 'Approved' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                            {t.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button 
                            onClick={() => openMap(undefined, t.providerLocation || 'Pickup Location')}
                            className="text-xs text-slate-500 flex items-center gap-1 hover:text-emerald-600 transition-colors"
                          >
                            <MapPin className="w-3 h-3" /> 
                            Pickup: {t.providerLocation || 'Not specified'}
                          </button>
                          <button 
                            onClick={() => openMap(undefined, t.beneficiaryLocation || 'Dropoff Location')}
                            className="text-xs text-slate-500 flex items-center gap-1 hover:text-emerald-600 transition-colors"
                          >
                            <MapPin className="w-3 h-3" /> 
                            Dropoff: {t.beneficiaryLocation || 'Not specified'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {user.role === 'Volunteer' && t.status === 'Approved' && !t.volunteerId && (
                        <Button onClick={() => claimDelivery(t.id)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                          Claim Delivery
                        </Button>
                      )}
                      {t.status === 'In Transit' && (t.volunteerId === user.id || user.role === 'Admin') && (
                        <Button onClick={() => openMap(t.providerLocation, t.beneficiaryLocation)} variant="outline" className="rounded-xl border-blue-200 text-blue-600">
                          <Navigation className="w-4 h-4 mr-2" /> Route Map
                        </Button>
                      )}
                      {t.status === 'In Transit' && (t.volunteerId === user.id || user.role === 'Admin') && (
                        <Button onClick={() => updateTransactionStatus(t.id, t.itemId, 'Delivered')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full transition-all duration-1000", t.status === 'In Transit' ? "bg-blue-500" : "bg-emerald-500")} style={{ width: t.status === 'Pending' ? '25%' : t.status === 'Approved' ? '50%' : t.status === 'In Transit' ? '75%' : '100%' }} />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className={t.status === 'Pending' ? 'text-emerald-600' : ''}>Requested</span>
                      <span className={t.status === 'Approved' ? 'text-emerald-600' : ''}>Approved</span>
                      <span className={t.status === 'In Transit' ? 'text-blue-600' : ''}>In Transit</span>
                      <span className={t.status === 'Delivered' ? 'text-emerald-600' : ''}>Delivered</span>
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