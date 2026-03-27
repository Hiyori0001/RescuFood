"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Shield, Save, Loader2, Phone, FileText, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Profile = () => {
  const { user, session, refreshProfile } = useApp();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    bio: '',
    avatarUrl: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      // Fetch full profile data including new fields
      const fetchFullProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setFormData({
            fullName: data.full_name || '',
            phone: data.phone || '',
            bio: data.bio || '',
            avatarUrl: data.avatar_url || ''
          });
        }
      };
      fetchFullProfile();
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.id) return;

    setIsUpdating(true);
    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: formData.fullName,
        phone: formData.phone,
        bio: formData.bio,
        avatar_url: formData.avatarUrl
      })
      .eq('id', session.user.id);

    if (error) {
      showError('Failed to update profile');
    } else {
      await refreshProfile();
      showSuccess('Profile updated successfully!');
    }
    setIsUpdating(false);
  };

  const generateRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setFormData({ ...formData, avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}` });
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
              <div className="absolute -bottom-12 left-8 flex items-end gap-4">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={formData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl font-bold">
                    {user?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={generateRandomAvatar}
                  className="mb-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
                >
                  <RefreshCw className="w-3 h-3 mr-2" /> Randomize
                </Button>
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
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-600">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input 
                        id="name" 
                        value={formData.fullName} 
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        placeholder="Enter your full name"
                        className="pl-10 border-slate-200 focus:ring-emerald-500 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-600">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input 
                        id="phone" 
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+1 234 567 890"
                        className="pl-10 border-slate-200 focus:ring-emerald-500 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar" className="text-slate-600">Avatar URL</Label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input 
                      id="avatar" 
                      value={formData.avatarUrl} 
                      onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className="pl-10 border-slate-200 focus:ring-emerald-500 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-slate-600">Bio / Description</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Textarea 
                      id="bio" 
                      value={formData.bio} 
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell us about yourself or your organization..."
                      className="pl-10 border-slate-200 focus:ring-emerald-500 rounded-xl min-h-[100px]"
                    />
                  </div>
                </div>

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

                <Button 
                  type="submit" 
                  disabled={isUpdating}
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
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;