"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Shield, Save, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Profile = () => {
  const { user, session, refreshProfile } = useApp();
  const [fullName, setFullName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) setFullName(user.name);
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.id) return;

    setIsUpdating(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', session.user.id);

    if (error) {
      showError('Failed to update profile');
    } else {
      await refreshProfile();
      showSuccess('Profile updated successfully!');
    }
    setIsUpdating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 md:pt-24">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <div className="h-32 bg-emerald-600 relative">
              <div className="absolute -bottom-12 left-8">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={user?.id ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}` : ''} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl font-bold">
                    {user?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <CardContent className="pt-16 pb-8 px-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
                <p className="text-slate-500 flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  {user?.role} Account
                </p>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-600">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input 
                      id="email" 
                      value={session?.user.email} 
                      disabled 
                      className="pl-10 bg-slate-50 border-slate-100 text-slate-500 rounded-xl"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-600">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input 
                      id="name" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="pl-10 border-slate-200 focus:ring-emerald-500 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isUpdating || fullName === user?.name}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-2xl font-bold shadow-lg shadow-emerald-100 transition-all"
                >
                  {isUpdating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
            <h3 className="font-bold text-emerald-900 mb-2">Security Tip</h3>
            <p className="text-sm text-emerald-700 leading-relaxed">
              Your role is assigned by the community administrators. If you need to change your account type (e.g., from Provider to NGO), please contact support.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;