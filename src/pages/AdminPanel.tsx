"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Users, ShoppingBasket, UtensilsCrossed, TrendingUp, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AdminPanel = () => {
  const { user, inventory, transactions } = useApp();

  if (user?.role !== 'Admin') {
    return <div className="p-20 text-center">Access Denied. Admins only.</div>;
  }

  const stats = [
    { label: 'Total Inventory', value: inventory.length, icon: UtensilsCrossed, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Transactions', value: transactions.filter(t => t.status !== 'Delivered').length, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
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