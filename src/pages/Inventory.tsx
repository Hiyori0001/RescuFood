"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Clock, AlertTriangle, ChefHat } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';

const Inventory = () => {
  const { user, inventory, addFoodItem } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Raw' as 'Raw' | 'Cooked',
    quantity: '',
    expiryDate: '',
    pricing: 'Donated' as 'Donated' | 'Base-price' | 'Discounted',
    price: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setFormData({ name: '', type: 'Raw', quantity: '', expiryDate: '', pricing: 'Donated', price: 0 });
    } catch (error) {
      // Error is handled in addFoodItem with showError
    } finally {
      setIsSubmitting(false);
    }
  };

  const myInventory = inventory.filter(item => item.providerId === user?.id);

  const getRecipeRecommendation = (ingredient: string) => {
    const recipes: Record<string, string> = {
      'Tomatoes': 'Fresh Tomato Basil Pasta',
      'Potatoes': 'Roasted Herb Potatoes',
      'Milk': 'Homemade Paneer or Yogurt',
      'Bread': 'Garlic Bread Pudding',
    };
    return recipes[ingredient] || 'Mixed Vegetable Stew';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 md:pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Inventory</h1>
            <p className="text-slate-500">Manage your surplus food listings</p>
          </div>
          <Button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            {isAdding ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> List Food</>}
          </Button>
        </div>

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-none shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle>List New Surplus Item</CardTitle>
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
                    <Select onValueChange={(v: any) => setFormData({...formData, pricing: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Donated">Donated (Free)</SelectItem>
                        <SelectItem value="Base-price">Base-price (NGOs)</SelectItem>
                        <SelectItem value="Discounted">Discounted Sale</SelectItem>
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
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="md:col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl font-bold"
                  >
                    {isSubmitting ? 'Listing...' : 'Confirm Listing'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid gap-4">
          {myInventory.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400">No items listed yet.</p>
            </div>
          ) : (
            myInventory.map((item) => (
              <Card key={item.id} className="border-none shadow-sm rounded-2xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
                      <Badge variant={item.status === 'Available' ? 'outline' : 'secondary'} className="rounded-full">
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Expires: {new Date(item.expiryDate).toLocaleString()}</span>
                      <span className="font-medium text-emerald-600">{item.quantity}</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{item.pricing}</span>
                    </div>

                    {item.isNearExpiry && item.type === 'Raw' && (
                      <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-amber-800">Near Expiry Alert!</p>
                          <p className="text-xs text-amber-700 mb-2">This item expires in less than 48 hours. Consider converting it to a cooked dish.</p>
                          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-white w-fit px-3 py-1.5 rounded-lg shadow-sm">
                            <ChefHat className="w-3 h-3" />
                            Recommended: {getRecipeRecommendation(item.name)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;