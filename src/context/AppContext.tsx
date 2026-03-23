"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'Provider' | 'NGO' | 'Beneficiary' | 'Volunteer';

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
  distance: number; // Mocked distance in km
  isNearExpiry: boolean;
}

interface AppState {
  user: { role: UserRole; name: string; id: string } | null;
  inventory: FoodItem[];
  requests: any[];
  impactMetrics: {
    mealsSaved: number;
    wasteReduced: number; // in kg
    communitiesServed: number;
  };
}

interface AppContextType extends AppState {
  setUser: (user: { role: UserRole; name: string; id: string } | null) => void;
  addFoodItem: (item: Omit<FoodItem, 'id' | 'status' | 'isNearExpiry' | 'distance'>) => void;
  requestFood: (itemId: string) => void;
  completeTransaction: (itemId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppState['user']>(null);
  const [inventory, setInventory] = useState<FoodItem[]>([
    {
      id: '1',
      name: 'Fresh Tomatoes',
      type: 'Raw',
      quantity: '10kg',
      expiryDate: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(), // 36 hours from now
      providerId: 'p1',
      providerName: 'Green Grocers',
      location: 'Downtown',
      status: 'Available',
      pricing: 'Donated',
      distance: 1.2,
      isNearExpiry: true,
    },
    {
      id: '2',
      name: 'Vegetable Biryani',
      type: 'Cooked',
      quantity: '20 portions',
      expiryDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      providerId: 'p2',
      providerName: 'Cloud Kitchen X',
      location: 'North Side',
      status: 'Available',
      pricing: 'Base-price',
      price: 50,
      distance: 3.5,
      isNearExpiry: true,
    }
  ]);

  const [impactMetrics, setImpactMetrics] = useState({
    mealsSaved: 1240,
    wasteReduced: 450,
    communitiesServed: 12,
  });

  const addFoodItem = (item: any) => {
    const newItem: FoodItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Available',
      distance: Math.floor(Math.random() * 10) + 1,
      isNearExpiry: new Date(item.expiryDate).getTime() - Date.now() < 72 * 60 * 60 * 1000,
    };
    setInventory(prev => [newItem, ...prev]);
  };

  const requestFood = (itemId: string) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: 'Requested' } : item
    ));
  };

  const completeTransaction = (itemId: string) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: 'Delivered' } : item
    ));
    setImpactMetrics(prev => ({
      ...prev,
      mealsSaved: prev.mealsSaved + 10,
      wasteReduced: prev.wasteReduced + 5,
    }));
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, inventory, impactMetrics, 
      addFoodItem, requestFood, completeTransaction,
      requests: [] 
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