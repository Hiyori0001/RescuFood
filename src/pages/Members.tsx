"use client";

import React, { useEffect, useState } from 'react';
import { useApp, UserRole } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, UserCog, ArrowLeft, ShieldCheck, Store, Building2, HeartHandshake, User } from 'lucide-center';
import { showSuccess, showError } from '@/utils/toast';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import RoleInfo from '@/components/RoleInfo';

const Members = () => {
  const { user } = useApp();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      showError('Failed to fetch users');
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: UserRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      showError('Failed to update role: ' + error.message);
    } else {
      showSuccess('User role updated successfully');
      fetchUsers();
    }
  };

  if (user?.role !== 'Admin') {
    return <div className="p-20 text-center">Access Denied. Admins only.</div>;
  }

  const roles: { id: UserRole; label: string; icon: any; color: string; bg: string }[] = [
    { id: 'Admin', label: 'Administrators', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'Provider', label: 'Commercial Providers', icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'Donor', label: 'Donors', icon: User, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'NGO', label: 'NGOs & Charities', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'Volunteer', label: 'Volunteers', icon: HeartHandshake, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 md:pt-24">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-600" />
              Community Directory
            </h1>
            <p className="text-slate-500">Manage and view all members of the RescuFood ecosystem</p>
          </div>
          <Button asChild variant="outline" className="rounded-xl border-slate-200">
            <Link to="/admin"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin</Link>
          </Button>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {roles.map((roleGroup) => {
              const roleMembers = members.filter(m => m.role === roleGroup.id);
              if (roleMembers.length === 0) return null;

              return (
                <section key={roleGroup.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={cn("p-2 rounded-xl", roleGroup.bg)}>
                      <roleGroup.icon className={cn("w-5 h-5", roleGroup.color)} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">
                      {roleGroup.label} 
                      <span className="ml-2 text-sm font-normal text-slate-400">({roleMembers.length})</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roleMembers.map((member) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow bg-white">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                                {member.avatar_url ? (
                                  <img src={member.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
                                ) : (
                                  <User className="w-6 h-6 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 truncate">{member.full_name || 'Anonymous User'}</h3>
                                <p className="text-xs text-slate-500 mb-3 truncate">{member.bio || 'No bio provided'}</p>
                                
                                <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-slate-50">
                                  <RoleInfo role={member.role} className="text-[10px] uppercase tracking-wider" />
                                  
                                  <Select 
                                    defaultValue={member.role} 
                                    onValueChange={(val: UserRole) => updateRole(member.id, val)}
                                    disabled={member.id === user.id}
                                  >
                                    <SelectTrigger className="w-[110px] h-7 text-[10px] rounded-lg border-none bg-slate-50 hover:bg-slate-100 transition-colors">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Admin">Admin</SelectItem>
                                      <SelectItem value="Provider">Provider</SelectItem>
                                      <SelectItem value="Donor">Donor</SelectItem>
                                      <SelectItem value="NGO">NGO</SelectItem>
                                      <SelectItem value="Volunteer">Volunteer</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;