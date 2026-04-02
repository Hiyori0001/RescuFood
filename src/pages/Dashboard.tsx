"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, CheckCircle2, Clock, MapPin, Star, User, XCircle, ArrowDownLeft, Navigation, Settings, ExternalLink, Heart, Leaf, Utensils, Loader2, RefreshCw, ArrowUpRight, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, Navigate } from 'react-router-dom';
import RoleInfo from '@/components/RoleInfo';

const Dashboard = () => {
  const { user, session, transactions, updateTransactionStatus, claimDelivery, inventory, loading, refreshData } = useApp();
  const [showDebug, setShowDebug] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Profile Not Found</h2>
        <p className="text-slate-500 max-w-xs">We couldn't find your profile information. Please try logging in again or contact support.</p>
        <Button asChild className="bg-emerald-600 mt-4">
          <Link to="/auth">Back to Login</Link>
        </Button>
      </div>
    );
  }

  // Filter for requests that need approval (Pending status)
  // Providers and Donors see requests for items they listed
  const incomingRequests = transactions.filter(t => 
    t.status === 'Pending' && (t.providerId === user.id || user.role === 'Admin')
  );

  // NGOs see their own pending requests
  const myPendingRequests = transactions.filter(t => 
    t.status === 'Pending' && t.beneficiaryId === user.id
  );

  // Filter for active tasks (Approved, In Transit)
  const myActiveTasks = transactions.filter(t => {
    const isFinished = t.status === 'Delivered' || t.status === 'Cancelled';
    if (isFinished) return false;
    
    // Don't show pending requests in the active tasks section
    if (t.status === 'Pending') return false;
    
    if (user.role === 'Admin') return true;
    
    // Volunteers see approved tasks that haven't been claimed yet, or tasks they've claimed
    if (user.role === 'Volunteer') {
      return (t.status === 'Approved' && !t.volunteerId) || t.volunteerId === user.id;
    }
    
    // Providers and NGOs see tasks they are involved in
    return t.providerId === user.id || t.beneficiaryId === user.id;
  });
  
  const completedCount = transactions.filter(t => 
    t.status === 'Delivered' && 
    (user.role === 'Admin' || t.providerId === user.id || t.beneficiaryId === user.id || t.volunteerId === user.id)
  ).length;

  const isProviderOrDonor = user.role === 'Provider' || user.role === 'Donor' || user.role === 'Admin';
  const isNGO = user.role === 'NGO' || user.role === 'Admin';

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 md:pt-24">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <Link to="/profile" className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 overflow-hidden border-2 border-white shadow-sm hover:opacity-80 transition-opacity">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-emerald-600" />
              )}
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                <Button onClick={() => refreshData()} variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-emerald-50 text-slate-400 hover:text-emerald-600">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button onClick={() => setShowDebug(!showDebug)} variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-emerald-50 text-slate-400 hover:text-emerald-600">
                  <Bug className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <RoleInfo role={user.role} className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs" />
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs text-slate-600">{user.location || 'Location not set'}</span>
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
                <span className="text-xl font-bold text-slate-900">{completedCount}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </header>

        {showDebug && (
          <Card className="mb-8 border-2 border-dashed border-amber-200 bg-amber-50 p-4 rounded-2xl">
            <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2"><Bug className="w-4 h-4" /> Debug Info</h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>User ID: {user.id}</div>
              <div>Role: {user.role}</div>
              <div>Total Transactions: {transactions.length}</div>
              <div>Pending Requests: {incomingRequests.length}</div>
            </div>
            <div className="mt-4 space-y-1">
              {transactions.map(t => (
                <div key={t.id} className="p-1 bg-white rounded border border-amber-100 text-[10px]">
                  ID: {t.id.slice(0,8)} | Status: {t.status} | Prov: {t.providerId?.slice(0,8)} | Bene: {t.beneficiaryId?.slice(0,8)}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Incoming Requests for Providers */}
        {isProviderOrDonor && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
              Incoming Requests ({incomingRequests.length})
            </h2>
            <div className="grid gap-4">
              {incomingRequests.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl text-center border border-slate-100">
                  <p className="text-slate-400 text-sm">No pending requests for your food items.</p>
                </div>
              ) : (
                incomingRequests.map((t) => (
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
                          <Button 
                            onClick={() => updateTransactionStatus(t.id, t.itemId, 'Approved')} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 font-bold"
                          >
                            Approve Request
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => updateTransactionStatus(t.id, t.itemId, 'Cancelled')} 
                            className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl"
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Reject
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

        {/* My Requests for NGOs */}
        {isNGO && myPendingRequests.length > 0 && (
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
                          <p className="text-sm text-slate-500">Waiting for provider approval</p>
                          <p className="text-xs text-slate-400 mt-1">Requested: {new Date(t.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-none">Pending</Badge>
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
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> 
                            Status: {t.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {user.role === 'Volunteer' && t.status === 'Approved' && !t.volunteerId && (
                        <Button onClick={() => claimDelivery(t.id)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                          Claim Delivery
                        </Button>
                      )}
                      {t.status === 'In Transit' && (t.volunteerId === user.id || user.role === 'Admin') && (
                        <Button onClick={() => updateTransactionStatus(t.id, t.itemId, 'Delivered')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
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