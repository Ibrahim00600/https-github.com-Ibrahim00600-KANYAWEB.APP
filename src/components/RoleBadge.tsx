import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, UserCheck, Wrench, Truck, ShoppingBag } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, showIcon = true }) => {
  const getBadgeStyle = () => {
    switch (role) {
      case 'super_admin':
        return {
          bg: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
          label: 'Super Admin',
          icon: ShieldCheck,
        };
      case 'manager':
        return {
          bg: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
          label: 'Manager',
          icon: UserCheck,
        };
      case 'operator':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
          label: 'Operator (Factory)',
          icon: Wrench,
        };
      case 'driver':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
          label: 'Driver (Logistics)',
          icon: Truck,
        };
      case 'customer':
        return {
          bg: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
          label: 'Customer',
          icon: ShoppingBag,
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          label: role,
          icon: ShieldCheck,
        };
    }
  };

  const style = getBadgeStyle();
  const IconComponent = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} transition-colors`}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5" />}
      {style.label}
    </span>
  );
};
