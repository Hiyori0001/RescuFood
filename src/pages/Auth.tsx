"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, UserRole } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Utensils, HeartHandshake, Users, Truck, ShieldAlert } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const Auth = () => {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('Admin');
  const [name, setName] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    setUser({ role, name, id: Math.random().toString(36).substr(2, 9) });
    showSuccess(`Welcome back, ${name}! Logged in as ${role}.`);
    navigate('/dashboard');
  };

  const roles = [
    { id: 'Admin', icon: ShieldAlert, label: 'Administrator', desc: 'Full system access' },
    { id: 'Provider', icon: Utensils, label: 'Food Provider', desc: 'Restaurants, Kitchens' },
    { id: 'NGO', icon: HeartHandshake, label: 'NGO / Partner', desc: 'Community orgs' },
    { id: 'Beneficiary', icon: Users, label: 'Beneficiary', desc: 'Individuals' },
    { id: 'Volunteer', icon: Truck, label: 'Volunteer', desc: 'Logistics' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pb-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="bg-emerald-600 p-8 text-white flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4">Join the Mission</h2>
              <p className="text-emerald-50 opacity-90 leading-relaxed">
                Select your role to start redistributing surplus food and making a real impact.
              </p>
            </div>
            <div className="p-8 bg-white">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization / Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter your name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border-slate-200"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Select Your Role</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {roles.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id as UserRole)}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-2xl border-2 transition-all text-left",
                          role === r.id 
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                            : "border-slate-100 hover:border-emerald-200 text-slate-600"
                        )}
                      >
                        <r.icon className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-bold text-center">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 text-lg font-bold">
                  Continue
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;