"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Clock, AlertTriangle, ChefHat, ShieldCheck, CheckCircle2, ListFilter, Heart, XCircle, Loader2 } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const Inventory = () => {
  const { user, inventory, addFoodItem, updateItemStatus, isProcessing } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // NGOs only see 'All'. Admins and Providers can toggle.
  const isNGO = user?.role === 'NGO';
  const isProvider = user?.role === 'Provider' || user?.role === 'Donor';
  const isAdmin = user?.role === 'Admin';

  const [viewMode, setViewMode] = useState<'Mine' | 'All'>(
    (isAdmin || isNGO) ? 'All' : 'Mine'
  );
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Raw' as 'Raw' | 'Cooked',
    quantity: '',
    expiryDate: '',
    pricing: 'Donated' as 'Donated' | 'Base-price' | 'Discounted',
    price: 0,
    isSafetyVerified: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.isSafetyVerified) {
      alert("Please verify food safety standards before listing.");
      return;
    }
    setIsSubmitting(true);
    try {
      await addFoodItem({
        ...formData,
        providerId: user?.id || 'anon',
        providerName: user?.name || 'Anonymous',
        location: 'Current Location',
      });
      showSuccess('Food item listed successfully!');
      setIsAdding(false);
      setFormData({ name: '', type: 'Raw', quantity: '', expiryDate: '', pricing: 'Donated', price: 0, isSafetyVerified: false });
    } catch (error) {
      // Error is handled in addFoodItem
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayInventory = viewMode === 'All' 
    ? inventory 
    : inventory.filter(item => item.providerId === user?.id);

  const getRecipeRecommendation = (ingredient: string) => {
    const recipes: Record<string, string> = {
      'Tomatoes': 'Fresh Tomato Basil Pasta',
      'Potatoes': 'Roasted Herb Potatoes',
      'Milk': 'Homemade Paneer or Yogurt',
      'Bread': 'Garlic Bread Pudding',
    };
    return recipes[ingredient] || 'Mixed Vegetable Stew';
  };

  const isDonor = user?.role === 'Donor';

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 md:pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isNGO ? 'Global Inventory' : viewMode === 'All' ? 'Global Inventory' : isDonor ? 'My Donations' : 'My Inventory'}
            </h1>
            <p className="text-slate-500">
              {isNGO ? 'Monitoring all food listings across the platform' : viewMode === 'All' ? 'Monitoring all food listings across the platform' : isDonor ? 'Manage your food donations' : 'Manage your surplus food listings'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Only show toggle for Admin and Provider/Donor */}
            {(isAdmin || isProvider) && (
              <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                <button
                  onClick={() => setViewMode('Mine')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    viewMode === 'Mine' ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  Mine
                </button>
                <button
                  onClick={() => setViewMode('All')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    viewMode === 'All' ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  All
                </button>
              </div>
            )}
            
            {(isProvider || isAdmin) && (
              <Button 
                onClick={() => setIsAdding(!isAdding)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                {isAdding ? 'Cancel' : <>{isDonor ? <Heart className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />} {isDonor ? 'Donate Food' : 'List Food'}</>}
              </Button>
            )}
          </div>
        </div>

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-none shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle>{isDonor ? 'Donate Surplus Food' : 'List New Surplus Item'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Item Name</Label>
                    <Input 
                      placeholder="e.g. Fresh Tomatoes" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select onValueChange={(v: any) => setFormData({...formData, type: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Raw">Raw Ingredients</SelectItem>
                        <SelectItem value="Cooked">Prepared Food</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input 
                      placeholder="e.g. 10kg or 20 portions" 
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date & Time</Label>
                    <Input 
                      type="datetime-local" 
                      value={formData.expiryDate}
                      onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pricing Strategy</Label>
                    <Select 
                      defaultValue={isDonor ? 'Donated' : undefined}
                      onValueChange={(v: any) => setFormData({...formData, pricing: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Donated">Donated (Free)</SelectItem>
                        {!isDonor && <SelectItem value="Base-price">Base-price (NGOs)</SelectItem>}
                        {!isDonor && <SelectItem value="Discounted">Discounted Sale</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.pricing !== 'Donated' && (
                    <div className="space-y-2">
                      <Label>Price (₹)</Label>
                      <Input 
                        type="number" 
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      />
                    </div>
                  )}

                  <div className="md:col-span-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id="safety" 
                        checked={formData.isSafetyVerified}
                        onCheckedChange={(checked) => setFormData({...formData, isSafetyVerified: !!checked})}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="safety"
                          className="text-sm font-bold text-emerald-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Safety Verification Checklist
                        </label>
                        <p className="text-xs text-emerald-700">
                          I confirm this food is stored at correct temperatures, handled with hygiene, and is fit for consumption.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !formData.isSafetyVerified}
                    className="md:col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl font-bold"
                  >
                    {isSubmitting ? 'Listing...' : isDonor ? 'Confirm Donation' : 'Confirm Listing'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid gap-4">
          {displayInventory.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400">No items found in this view.</p>
              {viewMode === 'Mine' && (
                <p className="text-xs text-slate-400 mt-2">Click "{isDonor ? 'Donate Food' : 'List Food'}" to add your first surplus item.</p>
              )}
            </div>
          ) : (
            displayInventory.map((item) => {
              const isPastExpiry = new Date(item.expiryDate).getTime() < Date.now();
              
              return (
                <Card key={item.id} className={cn(
                  "border-none shadow-sm rounded-2xl overflow-hidden",
                  item.status === 'Expired' && "opacity-60 grayscale"
                )}>
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
                          {item.isSafetyVerified && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-none flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {viewMode === 'All' && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
                              By: {item.providerName}
                            </span>
                          )}
                          <Badge variant={item.status === 'Available' ? 'outline' : 'secondary'} className={cn(
                            "rounded-full",
                            item.status === 'Expired' && "bg-rose-100 text-rose-700 border-none"
                          )}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Expires: {new Date(item.expiryDate).toLocaleString()}</span>
                        <span className="font-medium text-emerald-600">{item.quantity}</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{item.pricing}</span>
                      </div>

                      {/* Near Expiry Alert - Visible to Admin and NGO too */}
                      {item.isNearExpiry && item.status === 'Available' && (
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-bold text-amber-800">Near Expiry Alert!</p>
                              <p className="text-xs text-amber-700 mb-2">This item expires soon. {item.type === 'Raw' ? 'Consider converting it to a cooked dish.' : 'Prioritize distribution.'}</p>
                              {item.type === 'Raw' && (
                                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-white w-fit px-3 py-1.5 rounded-lg shadow-sm">
                                  <ChefHat className="w-3 h-3" />
                                  Recommended: {getRecipeRecommendation(item.name)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Mark as Expired Button for Admin/NGO */}
                          {(isAdmin || isNGO) && isPastExpiry && item.status !== 'Expired' && (
                            <Button 
                              onClick={() => updateItemStatus(item.id, 'Expired')}
                              disabled={isProcessing}
                              variant="outline" 
                              className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 h-9 px-4 text-xs font-bold shrink-0"
                            >
                              {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <><XCircle className="w-3 h-3 mr-2" /> Mark Expired</>}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;