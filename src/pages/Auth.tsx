"use client";

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { UtensilsCrossed } from 'lucide-react';

const Auth = () => {
  const { session } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white mb-4 shadow-lg shadow-emerald-200">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome to RescuFood</h1>
          <p className="text-slate-500 mt-2">Sign in to start saving food</p>
        </div>

        <Card className="border-none shadow-xl rounded-[2rem] p-8 bg-white">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#059669',
                    brandAccent: '#047857',
                  },
                  radii: {
                    buttonRadius: '12px',
                    inputRadius: '12px',
                  }
                }
              }
            }}
            providers={[]}
            theme="light"
            localization={{
              variables: {
                sign_up: {
                  full_name_label: 'Full Name',
                  full_name_placeholder: 'Your full name',
                }
              }
            }}
          />
        </Card>
        
        <p className="text-center text-xs text-slate-400 mt-8 px-4">
          By continuing, you agree to our terms of service and privacy policy.
          The first user to register will be granted Administrative privileges.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;