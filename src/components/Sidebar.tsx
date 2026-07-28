import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  LayoutDashboard,
  Factory,
  Boxes,
  ShoppingCart,
  Truck,
  Users,
  BarChart3,
  Settings,
  Store,
  Droplets,
  ChevronRight,
  MessageSquare,
  CreditCard,
  Wallet,
  FileCheck2,
} from 'lucide-react';

export type TabType =
  | 'home'
  | 'dashboard'
  | 'production'
  | 'operator_hub'
  | 'inventory'
  | 'sales'
  | 'debts'
  | 'staff_advances'
  | 'deliveries'
  | 'messaging'
  | 'customer_portal'
  | 'users'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenLoginModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenLoginModal }) => {
  const { currentUser, productionRecords, inventory, deliveries, messages } = useApp();

  const role = currentUser.role;
  const isHome = activeTab === 'home';

  const pendingApprovalsCount = productionRecords.filter((r) => r.status === 'pending_approval').length;
  const lowStockCount = inventory.filter((i) => i.totalInStock <= i.minStockAlert).length;
  const driverActiveDeliveries = deliveries.filter(
    (d) => d.driverId === currentUser.id && (d.status === 'assigned' || d.status === 'in_transit' || d.status === 'loaded')
  ).length;

  const unreadMessagesCount = messages.filter(
    (m) => m.recipientId === currentUser.id && !m.isRead
  ).length;

  const allNavItems = [
    {
      id: 'home' as TabType,
      label: 'Home Portal',
      icon: Home,
      roles: ['super_admin', 'manager', 'operator', 'driver', 'customer'],
    },
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['super_admin', 'manager', 'operator', 'driver', 'customer'],
    },
    {
      id: 'production' as TabType,
      label: 'Production Log',
      icon: Factory,
      roles: ['super_admin', 'manager', 'operator'],
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} pending` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'operator_hub' as TabType,
      label: 'Operator Workspace',
      icon: FileCheck2,
      roles: ['super_admin', 'manager', 'operator'],
    },
    {
      id: 'inventory' as TabType,
      label: 'Inventory & Stock',
      icon: Boxes,
      roles: ['super_admin', 'manager', 'operator', 'customer'],
      badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    },
    {
      id: 'sales' as TabType,
      label: 'Sales & Orders',
      icon: ShoppingCart,
      roles: ['super_admin', 'manager', 'customer'],
    },
    {
      id: 'debts' as TabType,
      label: 'Credit & Debt Tracker',
      icon: CreditCard,
      roles: ['super_admin', 'manager'],
    },
    {
      id: 'staff_advances' as TabType,
      label: 'Staff Money Collection',
      icon: Wallet,
      roles: ['super_admin', 'manager'],
    },
    {
      id: 'deliveries' as TabType,
      label: 'Deliveries & Logistics',
      icon: Truck,
      roles: ['super_admin', 'manager', 'driver'],
      badge: driverActiveDeliveries > 0 && role === 'driver' ? `${driverActiveDeliveries} active` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'messaging' as TabType,
      label: 'Communication Hub',
      icon: MessageSquare,
      roles: ['super_admin', 'manager', 'operator', 'driver', 'customer'],
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} new` : undefined,
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    },
    {
      id: 'customer_portal' as TabType,
      label: 'Order Water (Store)',
      icon: Store,
      roles: ['customer', 'super_admin', 'manager'],
    },
    {
      id: 'users' as TabType,
      label: 'User Accounts',
      icon: Users,
      roles: ['super_admin', 'manager'],
    },
    {
      id: 'reports' as TabType,
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['super_admin', 'manager'],
    },
    {
      id: 'settings' as TabType,
      label: 'System Settings',
      icon: Settings,
      roles: ['super_admin'],
    },
  ];

  const visibleItems = allNavItems.filter((item) => item.roles.includes(role));

  if (isHome) {
    return null;
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 shadow-lg">
      <div className="space-y-6">
        {/* Role Banner */}
        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Current Portal View</p>
          <p className="text-sm font-bold text-cyan-400 mt-0.5 capitalize flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-cyan-400" />
            {isHome ? 'Home Portal' : `${role.replace('_', ' ')} Portal`}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {isHome && 'Welcome! Sign in or select a workspace to open Main Menu.'}
            {!isHome && role === 'super_admin' && 'Full system control & user admin'}
            {!isHome && role === 'manager' && 'Production approval & sales management'}
            {!isHome && role === 'operator' && 'Daily factory batch entry'}
            {!isHome && role === 'driver' && 'Vehicle load & delivery tracking'}
            {!isHome && role === 'customer' && 'Water ordering & delivery tracking'}
          </p>
        </div>

        {/* Navigation Section */}
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 mb-2">
            Navigation
          </p>

          {isHome ? (
            /* HOME PAGE ONLY SHOWS HOME PORTAL & A SIGN-IN LOCK NOTICE */
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('home')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-600 text-white shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-white" />
                  <span>Home Portal</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-cyan-200" />
              </button>

              <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/50 space-y-2 text-center">
                <p className="text-xs font-bold text-slate-200">Main Menu Access</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Sign in with your staff or admin credentials to unlock full workspace controls.
                </p>
                <button
                  onClick={() => {
                    if (onOpenLoginModal) {
                      onOpenLoginModal();
                    } else {
                      setActiveTab('dashboard');
                    }
                  }}
                  className="w-full mt-1 py-2 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Sign In / Access Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* WHEN LOGGED IN / IN DASHBOARD, MAIN MENU IS FULLY VISIBLE */
            <nav className="space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 mb-2">
                Main Menu
              </p>
              {visibleItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-semibold'
                        : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-200" />}
                    </div>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800 text-center">
        <p className="text-[11px] font-semibold text-slate-400">Kanya Table Water v1.0</p>
        <p className="text-[10px] text-slate-500 mt-0.5">NAFDAC REG NO: 01-8492-TW</p>
      </div>
    </aside>
  );
};
