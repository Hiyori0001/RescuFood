"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { UtensilsCrossed, LayoutDashboard, ShoppingBasket, BarChart3, UserCircle, ShieldCheck, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const { user, signOut } = useApp();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Provider', 'NGO', 'Beneficiary', 'Volunteer'] },
    { path: '/marketplace', label: 'Marketplace', icon: ShoppingBasket, roles: ['Admin', 'Provider', 'NGO', 'Beneficiary', 'Volunteer'] },
    { path: '/inventory', label: 'Inventory', icon: UtensilsCrossed, roles: ['Admin', 'Provider', 'NGO'] },
    { path: '/impact', label: 'Impact', icon: BarChart3, roles: ['Admin', 'Provider', 'NGO', 'Beneficiary', 'Volunteer'] },
    { path: '/admin', label: 'Admin', icon: ShieldCheck, roles: ['Admin'] },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-emerald-100 px-4 py-2 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="hidden md:flex items-center gap-2 text-emerald-600 font-bold text-xl">
          <UtensilsCrossed className="w-6 h-6" />
          <span>RescuFood</span>
        </Link>

        <div className="flex flex-1 justify-around md:justify-end md:gap-8">
          {navItems.filter(item => !user || item.roles.includes(user.role)).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 rounded-xl transition-all",
                location.pathname === item.path 
                  ? "text-emerald-600 bg-emerald-50" 
                  : "text-slate-500 hover:text-emerald-500"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
            </Link>
          ))}
          
          {!user ? (
            <Link to="/auth" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 text-slate-500">
              <UserCircle className="w-5 h-5" />
              <span className="text-[10px] md:text-sm font-medium">Login</span>
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 text-emerald-700 font-semibold">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">
                  {user.name[0]}
                </div>
                <span className="text-[10px] md:text-sm hidden md:block">{user.name}</span>
              </div>
              <button 
                onClick={signOut}
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;