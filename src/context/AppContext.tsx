"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Session } from '@supabase/supabase-js';

export type UserRole = 'Admin' | 'Provider' | 'Donor' | 'NGO' | 'Volunteer';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  location?: string;
  bio?: string;
  avatar_url?: string;
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
  providerLocation?: string;
  beneficiaryLocation?: string;
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
  updateLocation: (location: string) => Promise<void>;
  updateProfile: (updates: { full_name?: string; bio?: string; avatar_url?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshData: () => Promise<void>;
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

  const fetchInventory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInventory((data || []).map(item => ({
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
  }, []);

  const fetchTransactions = useCallback(async (userId: string, role?: UserRole) => {
    try {
      // We fetch all transactions the user is involved in. 
      // RLS will handle the security, but we'll be explicit in our query.
      let query = supabase
        .from('transactions')
        .select(`
          *,
          inventory:item_id (name),
          provider:provider_id (location),
          beneficiary:beneficiary_id (location)
        `);

      // If not admin, filter by involvement
      if (role !== 'Admin') {
        if (role === 'Volunteer') {
          // Volunteers see approved tasks or tasks they've claimed
          query = query.or(`status.eq.Approved,volunteer_id.eq.${userId},status.eq.In Transit`);
        } else {
          // Providers and NGOs see their own transactions
          query = query.or(`provider_id.eq.${userId},beneficiary_id.eq.${userId}`);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      setTransactions((data || []).map(t => {
        // Handle potential array response from joins
        const inv = Array.isArray(t.inventory) ? t.inventory[0] : t.inventory;
        const prov = Array.isArray(t.provider) ? t.provider[0] : t.provider;
        const bene = Array.isArray(t.beneficiary) ? t.beneficiary[0] : t.beneficiary;
        
        return {
          id: t.id,
          itemId: t.item_id,
          itemName: inv?.name || 'Unknown Item',
          providerId: t.provider_id,
          beneficiaryId: t.beneficiary_id,
          volunteerId: t.volunteer_id,
          status: t.status,
          createdAt: t.created_at,
          providerLocation: prov?.location,
          beneficiaryLocation: bene?.location
        };
      }));
    } catch (e) {
      console.error("[AppContext] Fetch transactions error:", e);
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          name: data.full_name || 'User',
          role: data.role as UserRole,
          location: data.location,
          bio: data.bio,
          avatar_url: data.avatar_url
        };
        setUser(profile);
        // Fetch transactions immediately after profile is loaded
        fetchTransactions(userId, profile.role);
        return profile;
      }
    } catch (e) {
      console.error("[AppContext] Profile fetch error:", e);
    }
    return null;
  }, [fetchTransactions]);

  const fetchImpactMetrics = useCallback(async () => {
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
  }, []);

  const refreshData = useCallback(async () => {
    if (session?.user.id) {
      const profile = await fetchProfile(session.user.id);
      await Promise.all([
        fetchInventory(),
        fetchImpactMetrics(),
        profile ? fetchTransactions(session.user.id, profile.role) : Promise.resolve()
      ]);
    } else {
      await Promise.all([
        fetchInventory(),
        fetchImpactMetrics()
      ]);
    }
  }, [session, fetchProfile, fetchInventory, fetchImpactMetrics, fetchTransactions]);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession) {
        fetchProfile(initialSession.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        fetchProfile(currentSession.user.id);
      } else {
        setUser(null);
        setTransactions([]);
      }
      setLoading(false);
    });

    fetchInventory();
    fetchImpactMetrics();

    // Real-time subscription for transactions and inventory
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          console.log("[AppContext] Transaction change detected, refreshing...");
          refreshData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        () => {
          console.log("[AppContext] Inventory change detected, refreshing...");
          fetchInventory();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchProfile, fetchInventory, fetchImpactMetrics, refreshData]);

  const addFoodItem = async (item: any) => {
    if (!session?.user) return;

    const { error } = await supabase.from('inventory').insert([{
      name: item.name,
      type: item.type,
      quantity: item.quantity,
      expiry_date: item.expiryDate,
      pricing: item.pricing,
      price: item.price || 0,
      location: user?.location || 'Unknown Location',
      provider_id: session.user.id,
      provider_name: user?.name || 'Anonymous',
      status: 'Available',
      distance: Math.floor(Math.random() * 10) + 1,
      is_safety_verified: item.is_safety_verified || false
    }]);

    if (error) {
      showError('Failed to add item');
      throw error;
    }
    fetchInventory();
  };

  const requestFood = async (item: FoodItem) => {
    if (!session?.user) return;

    // 1. Create the transaction
    const { error: transError } = await supabase.from('transactions').insert([{
      item_id: item.id,
      provider_id: item.providerId,
      beneficiary_id: session.user.id,
      status: 'Pending'
    }]);

    if (transError) {
      showError('Failed to create request: ' + transError.message);
      return;
    }

    // 2. Update the inventory status
    const { error: invError } = await supabase.from('inventory').update({ status: 'Requested' }).eq('id', item.id);
    
    if (invError) {
      console.error("[AppContext] Failed to update inventory status:", invError);
    }

    showSuccess('Request sent successfully!');
    refreshData();
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
    refreshData();
  };

  const updateTransactionStatus = async (transactionId: string, itemId: string, newStatus: string) => {
    // 1. Update transaction status
    const { error: transError } = await supabase.from('transactions').update({ status: newStatus }).eq('id', transactionId);
    
    if (transError) {
      showError('Failed to update status: ' + transError.message);
      return;
    }

    // 2. Map transaction status to inventory status
    let invStatus = 'Requested';
    if (newStatus === 'Delivered') invStatus = 'Delivered';
    if (newStatus === 'Approved') invStatus = 'Allocated';
    if (newStatus === 'Cancelled') invStatus = 'Available';
    
    const { error: invError } = await supabase.from('inventory').update({ status: invStatus }).eq('id', itemId);
    if (invError) {
      console.error("[AppContext] Failed to update inventory status:", invError);
    }

    // 3. Update impact metrics if delivered
    if (newStatus === 'Delivered') {
      const { data: current } = await supabase.from('impact_metrics').select('*').maybeSingle();
      const update = {
        meals_saved: (current?.meals_saved || 0) + 10,
        waste_reduced: (current?.waste_reduced || 0) + 5,
        communities_served: (current?.communities_served || 0) + 1,
      };
      if (current) await supabase.from('impact_metrics').update(update).eq('id', current.id);
      else await supabase.from('impact_metrics').insert([update]);
      fetchImpactMetrics();
    }

    showSuccess(`Status updated to ${newStatus}`);
    refreshData();
  };

  const updateLocation = async (location: string) => {
    if (!session?.user) return;
    const { error } = await supabase.from('profiles').update({ location }).eq('id', session.user.id);
    if (error) showError('Failed to update location');
    else {
      showSuccess('Location updated!');
      await fetchProfile(session.user.id);
    }
  };

  const updateProfile = async (updates: { full_name?: string; bio?: string; avatar_url?: string }) => {
    if (!session?.user) return;
    const { error } = await supabase.from('profiles').update(updates).eq('id', session.user.id);
    if (error) showError('Failed to update profile');
    else {
      showSuccess('Profile updated!');
      await fetchProfile(session.user.id);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setTransactions([]);
      localStorage.removeItem('pending_role');
      showSuccess('Signed out successfully');
    } catch (e) {
      console.error("[AppContext] Sign out error:", e);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (session?.user.id) {
      await fetchProfile(session.user.id);
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, session, inventory, transactions, impactMetrics, loading,
      addFoodItem, requestFood, claimDelivery, updateTransactionStatus, updateLocation, updateProfile, signOut, refreshProfile, refreshData
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