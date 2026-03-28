"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, UserRole } from '@/context/AppContext';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { UtensilsCrossed, Store, Building2, HeartHandshake, ArrowLeft, Info, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import RoleInfo, { ROLE_DESCRIPTIONS } from '@/components/RoleInfo';

const Auth = () => {
  const { session, loading, refreshProfile } = useApp();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (session) {
      const finalizeAuth = async () => {
        // Check if user already has a role in the database
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        const pendingRole = localStorage.getItem('pending_role');
        
        // ONLY update the role if the user doesn't have one yet
        if (pendingRole && (!profile || !profile.role)) {
          await supabase.from('profiles').update({ role: pendingRole }).eq('id', session.user.id);
        }
        
        localStorage.removeItem('pending_role');
        await refreshProfile();
        navigate('/dashboard');
      };
      finalizeAuth();
    }
  }, [session, navigate, refreshProfile]);

  // Removed Admin from this list so it's not an option during signup
  const roles: { id: UserRole; label: string; desc: string; icon: any; color: string; bg: string }[] = [
    { 
      id: 'Provider', 
      label: 'Commercial Provider', 
      desc: 'Restaurants, Hotels, Groceries', 
      icon: Store, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      id: 'Donor', 
      label: 'Individual Donor', 
      desc: 'Donate surplus from home', 
      icon: User, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50' 
    },
    { 
      id: 'NGO', 
      label: 'NGO / Charity', 
      desc: 'Distribute food to those in need', 
      icon: Building2, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      id: 'Volunteer', 
      label: 'Volunteer', 
      desc: 'Help with logistics and delivery', 
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
                  onClick={() => {
                    setSelectedRole(role.id);
                    localStorage.setItem('pending_role', role.id);
                  }}
                  className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-emerald-500 hover:shadow-md transition-all text-left relative"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", role.bg)}>
                      <role.icon className={cn("w-6 h-6", role.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">{role.label}</h3>
                        <RoleInfo role={role.id} showLabel={false} />
                      </div>
                      <p className="text-xs text-slate-500">{role.desc}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-50 pt-3">
                    {ROLE_DESCRIPTIONS[role.id].desc}
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
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-emerald-800 font-bold">Signing up as {selectedRole}</p>
                      <RoleInfo role={selectedRole} showLabel={false} />
                    </div>
                    <p className="text-[10px] text-emerald-700 leading-relaxed">
                      {ROLE_DESCRIPTIONS[selectedRole].desc}
                    </p>
                  </div>
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