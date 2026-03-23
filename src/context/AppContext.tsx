"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

export type UserRole = 'Admin' | 'Provider' | 'NGO' | 'Beneficiary' | 'Volunteer';

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
}

interface AppState {
  user: { role: UserRole; name: string; id: string } | null;
  inventory: FoodItem[];
  impactMetrics: {
    mealsSaved: number;
    wasteReduced: number;
    communitiesServed: number;
  };
}

interface AppContextType extends AppState {
  setUser: (user: AppState['user']) => void;
  addFoodItem: (item: Omit<FoodItem, 'id' | 'status' | 'isNearExpiry' | 'distance'>) => Promise<void>;
  requestFood: (itemId: string) => Promise<void>;
  completeTransaction: (itemId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppState['user']>(null);
  const [inventory, setInventory] = useState<FoodItem[]>([]);
  const [impactMetrics, setImpactMetrics] = useState({
    mealsSaved: 0,
    wasteReduced: 0,
    communitiesServed: 0,
  });

  // Fetch initial data from Supabase
  useEffect(() => {
    fetchInventory();
    fetchImpactMetrics();
  }, []);

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inventory:', error);
      return;
    }

    const formattedData: FoodItem[] = data.map(item => ({
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
    }));

    setInventory(formattedData);
  };

  const fetchImpactMetrics = async () => {
    const { data, error } = await supabase
      .from('impact_metrics')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching impact metrics:', error);
      return;
    }

    if (data) {
      setImpactMetrics({
        mealsSaved: data.meals_saved,
        wasteReduced: data.waste_reduced,
        communitiesServed: data.communities_served,
      });
    }
  };

  const addFoodItem = async (item: any) => {
    const distance = Math.floor(Math.random() * 10) + 1;
    const { error } = await supabase
      .from('inventory')
      .insert([{
        name: item.name,
        type: item.type,
        quantity: item.quantity,
        expiry_date: item.expiryDate,
        provider_id: item.providerId,
        provider_name: item.providerName,
        location: item.location,
        status: 'Available',
        pricing: item.pricing,
        price: item.price || 0,
        distance: distance
      }]);

    if (error) {
      console.error('Supabase error:', error);
      showError('Failed to add item: ' + error.message);
      throw error;
    }
    await fetchInventory();
  };

  const requestFood = async (itemId: string) => {
    const { error } = await supabase
      .from('inventory')
      .update({ status: 'Requested' })
      .eq('id', itemId);

    if (error) {
      showError('Failed to request food');
      return;
    }
    await fetchInventory();
  };

  const completeTransaction = async (itemId: string) => {
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ status: 'Delivered' })
      .eq('id', itemId);

    if (updateError) {
      showError('Failed to complete transaction');
      return;
    }

    const { data: currentMetrics } = await supabase.from('impact_metrics').select('*').single();
    
    const newMetrics = {
      meals_saved: (currentMetrics?.meals_saved || 0) + 10,
      waste_reduced: (currentMetrics?.waste_reduced || 0) + 5,
      communities_served: (currentMetrics?.communities_served || 0) + 1,
    };

    if (currentMetrics) {
      await supabase.from('impact_metrics').update(newMetrics).eq('id', currentMetrics.id);
    } else {
      await supabase.from('impact_metrics').insert([newMetrics]);
    }

    await fetchInventory();
    await fetchImpactMetrics();
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, inventory, impactMetrics, 
      addFoodItem, requestFood, completeTransaction
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