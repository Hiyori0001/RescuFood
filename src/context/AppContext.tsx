"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Session } from '@supabase/supabase-js';

export type UserRole = 'Admin' | 'Provider' | 'NGO' | 'Beneficiary' | 'Volunteer';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
}

export interface FoodItem {
  id: string;
  name: string;
  type: 'Raw' | 'Cooked';
  quantity: string;
  expiryDate: string;
  providerId: string;
  providerName: string;
  location: string;
  status: 'Available' | 'Requested' | 'Allocated' | 'Delivered';
  pricing: 'Donated' | 'Base-price' | 'Discounted';
  price?: number;
  distance: number;
  isNearExpiry: boolean;
  isSafetyVerified: boolean;
}

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  providerId: string;
  beneficiaryId: string;
  volunteerId?: string;
  volunteerName?: string;
  status: string;
  createdAt: string;
}

interface AppState {
  user: UserProfile | null;
  session: Session | null;
  inventory: FoodItem[];
  transactions: Transaction[];
  impactMetrics: {
    mealsSaved: number;
    wasteReduced: number;
    communitiesServed: number;
  };
  loading: boolean;
}

interface AppContextType extends AppState {
  addFoodItem: (item: any) => Promise<void>;
  requestFood: (item: FoodItem) => Promise<void>;
  claimDelivery: (transactionId: string) => Promise<void>;
  updateTransactionStatus: (transactionId: string, itemId: string, newStatus: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [inventory, setInventory] = useState<FoodItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [impactMetrics, setImpactMetrics] = useState({
    mealsSaved: 0,
    wasteReduced: 0,
    communitiesServed: 0,
  });

  useEffect(() => {
    const initialize = async () => {
      const timeoutId = setTimeout(() => setLoading(false), 5000);

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        if (initialSession) {
          const profile = await syncRoleAndFetchProfile(initialSession.user.id);
          if (profile) {
            await fetchTransactions(initialSession.user.id, profile.role);
          }
        }
        
        await Promise.allSettled([
          fetchInventory(),
          fetchImpactMetrics()
        ]);
      } catch (error) {
        console.error("[AppContext] Initialization error:", error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      
      if (currentSession) {
        const profile = await syncRoleAndFetchProfile(currentSession.user.id);
        if (profile) {
          fetchTransactions(currentSession.user.id, profile.role);
        }
      } else {
        setUser(null);
        setTransactions([]);
      }
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setTransactions([]);
        localStorage.removeItem('pending_role');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncRoleAndFetchProfile = async (userId: string, retries = 3) => {
    try {
      let profileData = null;
      
      // Retry loop for new signups where the trigger might be slow
      for (let i = 0; i < retries; i++) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (data) {
          profileData = data;
          break;
        }
        
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!profileData) return null;

      const pendingRole = localStorage.getItem('pending_role');
      if (profileData && pendingRole && profileData.role === 'Beneficiary' && pendingRole !== 'Beneficiary') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: pendingRole })
          .eq('id', userId);
        
        if (!updateError) {
          profileData.role = pendingRole;
          localStorage.removeItem('pending_role');
        }
      }

      const profile: UserProfile = {
        id: profileData.id,
        name: profileData.full_name || 'User',
        role: profileData.role as UserRole,
      };
      
      setUser(profile);
      return profile;
    } catch (e) {
      console.error("[AppContext] Profile sync error:", e);
      return null;
    }
  };

  const fetchTransactions = async (userId: string, role?: UserRole) => {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          inventory (name)
        `);

      if (role !== 'Admin') {
        query = query.or(`provider_id.eq.${userId},beneficiary_id.eq.${userId},status.eq.Approved`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data.map(t => ({
        id: t.id,
        itemId: t.item_id,
        itemName: t.inventory?.name || 'Unknown Item',
        providerId: t.provider_id,
        beneficiaryId: t.beneficiary_id,
        volunteerId: t.volunteer_id,
        status: t.status,
        createdAt: t.created_at
      })));
    } catch (e) {
      console.error("[AppContext] Fetch transactions error:", e);
    }
  };

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInventory(data.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        quantity: item.quantity,
        expiryDate: item.expiry_date,
        providerId: item.provider_id,
        providerName: item.provider_name,
        location: item.location,
        status: item.status,
        pricing: item.pricing,
        price: item.price,
        distance: item.distance,
        isNearExpiry: new Date(item.expiry_date).getTime() - Date.now() < 72 * 60 * 60 * 1000,
        isSafetyVerified: item.is_safety_verified,
      })));
    } catch (e) {
      console.error("[AppContext] Fetch inventory error:", e);
    }
  };

  const fetchImpactMetrics = async () => {
    try {
      const { data } = await supabase.from('impact_metrics').select('*').maybeSingle();
      if (data) {
        setImpactMetrics({
          mealsSaved: data.meals_saved,
          wasteReduced: data.waste_reduced,
          communitiesServed: data.communities_served,
        });
      }
    } catch (e) {
      console.error("[AppContext] Fetch impact metrics error:", e);
    }
  };

  const addFoodItem = async (item: any) => {
    if (!session?.user) return;

    const { error } = await supabase.from('inventory').insert([{
      name: item.name,
      type: item.type,
      quantity: item.quantity,
      expiry_date: item.expiryDate,
      pricing: item.pricing,
      price: item.price || 0,
      location: item.location,
      provider_id: session.user.id,
      provider_name: user?.name || 'Anonymous',
      status: 'Available',
      distance: Math.floor(Math.random() * 10) + 1,
      is_safety_verified: item.isSafetyVerified || false
    }]);

    if (error) {
      showError('Failed to add item');
      throw error;
    }
    await fetchInventory();
  };

  const requestFood = async (item: FoodItem) => {
    if (!session?.user) return;

    const { error: transError } = await supabase.from('transactions').insert([{
      item_id: item.id,
      provider_id: item.providerId,
      beneficiary_id: session.user.id,
      status: 'Pending'
    }]);

    if (transError) {
      showError('Failed to create request');
      return;
    }

    await supabase.from('inventory').update({ status: 'Requested' }).eq('id', item.id);
    
    await fetchInventory();
    await fetchTransactions(session.user.id, user?.role);
    showSuccess('Request sent successfully!');
  };

  const claimDelivery = async (transactionId: string) => {
    if (!session?.user) return;

    const { error } = await supabase
      .from('transactions')
      .update({ 
        volunteer_id: session.user.id,
        status: 'In Transit' 
      })
      .eq('id', transactionId);

    if (error) {
      showError('Failed to claim delivery');
      return;
    }

    showSuccess('Delivery claimed! You are now in transit.');
    await fetchTransactions(session.user.id, user?.role);
  };

  const updateTransactionStatus = async (transactionId: string, itemId: string, newStatus: string) => {
    const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', transactionId);
    
    if (error) {
      showError('Failed to update status');
      return;
    }

    let invStatus = 'Requested';
    if (newStatus === 'Delivered') invStatus = 'Delivered';
    if (newStatus === 'Approved') invStatus = 'Allocated';
    if (newStatus === 'Cancelled') invStatus = 'Available';
    
    await supabase.from('inventory').update({ status: invStatus }).eq('id', itemId);

    if (newStatus === 'Delivered') {
      const { data: current } = await supabase.from('impact_metrics').select('*').maybeSingle();
      const update = {
        meals_saved: (current?.meals_saved || 0) + 10,
        waste_reduced: (current?.waste_reduced || 0) + 5,
        communities_served: (current?.communities_served || 0) + 1,
      };
      if (current) await supabase.from('impact_metrics').update(update).eq('id', current.id);
      else await supabase.from('impact_metrics').insert([update]);
    }

    if (session) await fetchTransactions(session.user.id, user?.role);
    await fetchInventory();
    await fetchImpactMetrics();
    showSuccess(`Status updated to ${newStatus}`);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    localStorage.removeItem('pending_role');
  };

  const refreshProfile = async () => {
    if (session?.user.id) await syncRoleAndFetchProfile(session.user.id);
  };

  return (
    <AppContext.Provider value={{ 
      user, session, inventory, transactions, impactMetrics, loading,
      addFoodItem, requestFood, claimDelivery, updateTransactionStatus, signOut, refreshProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};