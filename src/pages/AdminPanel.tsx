"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Users, ShoppingBasket, UtensilsCrossed, TrendingUp, Activity, CheckCircle2, XCircle, Clock, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const AdminPanel = () => {
  const { user, inventory, transactions, updateTransactionStatus, isProcessing } = useApp();

  if (user?.role !== 'Admin') {
    return <div className="p-20 text-center">Access Denied. Admins only.</div>;
  }

  const pendingApprovals = transactions.filter(t => t.status === 'Pending Approval');
  const pendingConfirmations = transactions.filter(t => t.status === 'Pending Confirmation');

  const stats = [
    { label: 'Total Inventory', value: inventory.length, icon: UtensilsCrossed, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Transactions', value: transactions.filter(t => !['Delivered', 'Cancelled'].includes(t.status)).length, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Completed Deliveries', value: transactions.filter(t => t.status === 'Delivered').length, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 md:pt-24">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
              Admin Control Center
            </h1>
            <p className="text-slate-500">System-wide monitoring and administrative tools</p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
            <Link to="/members"><Users className="w-4 h-4 mr-2" /> Manage Members</Link>
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Approvals Queue */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Verification Queue
          </h2>
          <div className="grid gap-4">
            {[...pendingApprovals, ...pendingConfirmations].length === 0 ? (
              <div className="bg-white p-8 rounded-3xl text-center border border-slate-100">
                <p className="text-slate-400 text-sm">No pending verifications at the moment.</p>
              </div>
            ) : (
              <>
                {pendingApprovals.map((t) => (
                  <Card key={t.id} className="border-none shadow-sm rounded-2xl overflow-hidden border-l-4 border-amber-500">
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                          <ShoppingBasket className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">{t.itemName}</h3>
                            <Badge className="bg-amber-100 text-amber-700 border-none text-[10px]">Request Approval</Badge>
                          </div>
                          <p className="text-xs text-slate-500">Requested by: {t.beneficiaryName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => updateTransactionStatus(t.id, t.itemId, 'Approved')}
                          disabled={isProcessing}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 px-4 text-xs font-bold"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Request
                        </Button>
                        <Button 
                          onClick={() => updateTransactionStatus(t.id, t.itemId, 'Cancelled')}
                          disabled={isProcessing}
                          variant="outline" 
                          className="rounded-xl h-9 px-4 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {pendingConfirmations.map((t) => (
                  <Card key={t.id} className="border-none shadow-sm rounded-2xl overflow-hidden border-l-4 border-blue-500">
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <Truck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">{t.itemName}</h3>
                            <Badge className="bg-blue-100 text-blue-700 border-none text-[10px]">Delivery Confirmation</Badge>
                          </div>
                          <p className="text-xs text-slate-500">Delivered to: {t.beneficiaryName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => updateTransactionStatus(t.id, t.itemId, 'Delivered')}
                          disabled={isProcessing}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 px-4 text-xs font-bold"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Delivery
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm rounded-3xl p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                System Health
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-medium text-slate-600">Database Connection</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-medium text-slate-600">Auth Service</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Operational</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-medium text-slate-600">Storage Bucket</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Healthy</span>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {transactions.slice(0, 3).map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border-b border-slate-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                    {t.itemName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">{t.itemName}</p>
                    <p className="text-[10px] text-slate-500">{t.status} • {new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No recent activity</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;