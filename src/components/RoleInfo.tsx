"use client";

import React from 'react';
import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserRole } from '@/context/AppContext';

interface RoleInfoProps {
  role: UserRole;
  className?: string;
  showLabel?: boolean;
}

export const ROLE_DESCRIPTIONS: Record<UserRole, { title: string; desc: string }> = {
  Admin: {
    title: "Administrator",
    desc: "Full system oversight. Manage community members, monitor global impact metrics, and ensure platform integrity."
  },
  Provider: {
    title: "Commercial Provider",
    desc: "Restaurants, hotels, and grocery stores. List surplus food, manage inventory, and track environmental contributions."
  },
  Donor: {
    title: "Individual Donor",
    desc: "Individuals or households with surplus food. Donate directly to the community without commercial affiliation."
  },
  NGO: {
    title: "NGO / Charity",
    desc: "Food receptors and distributors. Identify community needs, request allocations, and manage local distribution."
  },
  Volunteer: {
    title: "Logistics Volunteer",
    desc: "The bridge between providers and receptors. Claim delivery tasks, navigate routes, and ensure safe food transport."
  }
};

const RoleInfo: React.FC<RoleInfoProps> = ({ role, className, showLabel = true }) => {
  const info = ROLE_DESCRIPTIONS[role];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {showLabel && <span className="font-bold">{role}</span>}
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-0.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-emerald-600">
            <Info className="w-3.5 h-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4 rounded-2xl shadow-xl border-none bg-white z-[100]">
          <h4 className="font-bold text-slate-900 mb-1">{info.title}</h4>
          <p className="text-xs text-slate-600 leading-relaxed">{info.desc}</p>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RoleInfo;