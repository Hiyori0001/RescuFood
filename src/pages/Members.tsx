"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Members = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .order('full_name', { ascending: true });

      if (!error && data) {
        setMembers(data);
      }
      setLoading(false);
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(m => 
    (m.full_name || 'Anonymous').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 md:pt-24">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-600" />
              Community Members
            </h1>
            <p className="text-slate-500">Meet the people making a difference</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search members..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200 rounded-xl shadow-sm focus:ring-emerald-500"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-none shadow-sm rounded-2xl hover:shadow-md transition-all bg-white overflow-hidden group">
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-2 border-emerald-50 group-hover:border-emerald-200 transition-colors">
                    <AvatarImage src={member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                      {(member.full_name || 'U')[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                      {member.full_name || 'Anonymous User'}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0 h-4 bg-slate-50 text-slate-500 border-none">
                      {member.role}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400">No members found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;