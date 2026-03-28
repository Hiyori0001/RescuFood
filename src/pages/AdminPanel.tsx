"use client";

import React, { useEffect, useState } from 'react';
import { useApp, UserRole } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Users, UserCog } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const AdminPanel = () => {
  const { user } = useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('role', { ascending: true });

    if (error) {
      showError('Failed to fetch users');
    } else {
      setUsers(data || []);
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

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 md:pt-24">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            User Management
          </h1>
          <p className="text-slate-500">Manage roles and permissions for the RescuFood community</p>
        </header>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              Registered Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-50">
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="border-slate-50">
                    <TableCell className="pl-6 font-medium">{u.full_name || 'Anonymous'}</TableCell>
                    <TableCell>
                      <Badge className={
                        u.role === 'Admin' ? 'bg-emerald-100 text-emerald-700' : 
                        u.role === 'Provider' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end items-center gap-2">
                        <UserCog className="w-4 h-4 text-slate-400" />
                        <Select 
                          defaultValue={u.role} 
                          onValueChange={(val: UserRole) => updateRole(u.id, val)}
                          disabled={u.id === user.id} // Can't demote yourself
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Provider">Provider</SelectItem>
                            <SelectItem value="NGO">NGO</SelectItem>
                            <SelectItem value="Beneficiary">Beneficiary</SelectItem>
                            <SelectItem value="Volunteer">Volunteer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;