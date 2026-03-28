"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { UtensilsCrossed, Store, Building2, HeartHandshake, ArrowLeft, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const Auth = () => {
  const { session, loading, refreshProfile } = useApp();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      const finalizeAuth = async () => {
        const pendingRole = localStorage.getItem('pending_role');
        if (pendingRole) {
          await supabase.from('profiles').update({ role: pendingRole }).eq('id', session.user.id);
          localStorage.removeItem('pending_role');
        }
        await refreshProfile();
        navigate('/dashboard');
      };
      finalizeAuth();
    }
  }, [session, navigate, refreshProfile]);

  const roles = [
    { 
      id: 'Provider', 
      label: 'Food Provider', 
      desc: 'Restaurants, Hotels, Groceries', 
      longDesc: 'List your surplus food, manage inventory, and track your environmental impact. Help reduce waste at the source.',
      icon: Store, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      id: 'NGO', 
      label: 'NGO / Charity', 
      desc: 'Distribute food to those in need', 
      longDesc: 'Browse available surplus, request allocations for your community, and coordinate with volunteers for delivery.',
      icon: Building2, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      id: 'Volunteer', 
      label: 'Volunteer', 
      desc: 'Help with logistics and delivery', 
      longDesc: 'Be the bridge between providers and NGOs. Claim delivery tasks, navigate routes, and ensure food reaches its destination safely.',
      icon: HeartHandshake, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
  ];

  if (loading && !session) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white mb-4 shadow-lg shadow-emerald-200">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">RescuFood</h1>
          <p className="text-slate-500 mt-2">Join our mission to end food waste</p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedRole ? (
            <motion.div key="role-selection" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid gap-4">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-emerald-500 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", role.bg)}>
                      <role.icon className={cn("w-6 h-6", role.color)} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{role.label}</h3>
                      <p className="text-xs text-slate-500">{role.desc}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-50 pt-3">
                    {role.longDesc}
                  </p>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div key="auth-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setSelectedRole(null)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to roles
              </button>
              <Card className="border-none shadow-xl rounded-[2rem] p-8 bg-white">
                <div className="mb-6 p-4 bg-emerald-50 rounded-xl flex gap-3 items-start">
                  <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800 font-medium">
                    You are signing up as a <b>{selectedRole}</b>. {roles.find(r => r.id === selectedRole)?.longDesc}
                  </p>
                </div>
                <SupabaseAuth
                  supabaseClient={supabase}
                  appearance={{ theme: ThemeSupa, variables: { default: { colors: { brand: '#059669', brandAccent: '#047857' }, radii: { buttonRadius: '12px', inputRadius: '12px' } } } }}
                  providers={[]}
                  theme="light"
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Auth;