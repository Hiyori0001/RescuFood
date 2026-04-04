"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, Save, ArrowLeft, Camera, Star, CheckCircle2, Phone, MapPin, Navigation } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import RoleInfo from '@/components/RoleInfo';
import { showSuccess, showError } from '@/utils/toast';

const Profile = () => {
  const { user, updateProfile, transactions } = useApp();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    avatar_url: '',
    location: ''
  });

  // Only initialize the form once when the user data is loaded
  // This prevents the "rewriting" bug where typing is interrupted by context refreshes
  useEffect(() => {
    if (user && !isInitialized) {
      setFormData({
        full_name: user.name || '',
        bio: user.bio || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || '',
        location: user.location || ''
      });
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Please login to view your profile.</p>
          <Button asChild className="bg-emerald-600">
            <Link to="/auth">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleDetectLocation = () => {
    setIsDetecting(true);
    if (!navigator.geolocation) {
      showError("Geolocation is not supported by your browser");
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // In a real app, we'd use a reverse geocoding API here
        // For now, we'll store the coordinates to show it's real data
        setFormData(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)} (GPS)` }));
        showSuccess("Location detected!");
        setIsDetecting(false);
      },
      (error) => {
        showError("Unable to retrieve your location");
        setIsDetecting(false);
      }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        full_name: formData.full_name,
        bio: formData.bio,
        phone: formData.phone,
        avatar_url: formData.avatar_url,
        location: formData.location
      });
    } finally {
      setIsSaving(false);
    }
  };

  const completedCount = transactions.filter(t => 
    t.status === 'Delivered' && 
    (user.role === 'Admin' || t.providerId === user.id || t.beneficiaryId === user.id || t.volunteerId === user.id)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 md:pt-24">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-500 hover:text-emerald-600">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <div className="w-20"></div>
        </div>

        <div className="grid gap-8">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <div className="h-32 bg-emerald-600 relative">
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-2xl bg-emerald-50 flex items-center justify-center overflow-hidden">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-emerald-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="pt-16 pb-8 px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{user.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <RoleInfo role={user.role} className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs" />
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trust Score</p>
                    <div className="flex items-center gap-1 justify-center">
                      <span className="text-lg font-bold text-slate-900">4.9</span>
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed</p>
                    <div className="flex items-center gap-1 justify-center">
                      <span className="text-lg font-bold text-slate-900">{completedCount}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Edit Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input 
                      id="full_name"
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                      className="rounded-xl border-slate-100"
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        id="phone"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="rounded-xl border-slate-100 pl-10"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location / Address</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        id="location"
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        className="rounded-xl border-slate-100 pl-10"
                        placeholder="Enter your area or address"
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleDetectLocation}
                      disabled={isDetecting}
                      className="rounded-xl border-slate-200 text-emerald-600 hover:bg-emerald-50"
                    >
                      {isDetecting ? "..." : <Navigation className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-400">This helps us match you with nearby food providers and volunteers.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Avatar Image URL</Label>
                  <div className="flex gap-3">
                    <Input 
                      id="avatar_url"
                      value={formData.avatar_url}
                      onChange={e => setFormData({...formData, avatar_url: e.target.value})}
                      className="rounded-xl border-slate-100 flex-1"
                      placeholder="https://example.com/photo.jpg"
                    />
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                      {formData.avatar_url ? (
                        <img src={formData.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio"
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    className="rounded-xl border-slate-100 min-h-[120px]"
                    placeholder="Tell the community about yourself..."
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 font-bold shadow-lg shadow-emerald-100"
                >
                  {isSaving ? 'Saving Changes...' : <><Save className="w-4 h-4 mr-2" /> Save Profile</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;