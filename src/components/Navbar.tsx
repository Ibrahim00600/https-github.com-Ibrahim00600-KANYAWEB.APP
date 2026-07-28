import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { RoleBadge } from './RoleBadge';
import { TabType } from './Sidebar';
import { LoginModal } from './auth/LoginModal';
import kanyaLogo from '../assets/images/kanya_water_logo_1785244963793.jpg';
import {
  Droplets,
  Bell,
  RefreshCw,
  UserCheck,
  ChevronDown,
  ShieldCheck,
  Wrench,
  Truck,
  ShoppingBag,
  RotateCcw,
  LogIn,
  User,
} from 'lucide-react';

interface NavbarProps {
  onLoginSuccess?: (targetTab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginSuccess }) => {
  const {
    currentUser,
    setCurrentUserRole,
    users,
    switchUser,
    productionRecords,
    inventory,
    resetToDefaultData,
    settings,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const pendingApprovalsCount = productionRecords.filter((r) => r.status === 'pending_approval').length;
  const lowStockCount = inventory.filter((i) => i.totalInStock <= i.minStockAlert).length;
  const totalAlerts = pendingApprovalsCount + lowStockCount;

  const roles: { role: UserRole; name: string; description: string; icon: React.ElementType }[] = [
    { role: 'super_admin', name: 'Super Admin', description: 'Full system control & user management', icon: ShieldCheck },
    { role: 'manager', name: 'Manager', description: 'Approve production, sales & assign drivers', icon: UserCheck },
    { role: 'operator', name: 'Operator (Factory)', description: 'Record daily batch production & damage', icon: Wrench },
    { role: 'driver', name: 'Driver (Logistics)', description: 'View assigned loads & delivery status', icon: Truck },
    { role: 'customer', name: 'Customer', description: 'Browse water products & place order', icon: ShoppingBag },
  ];

  const handleLoginRedirect = (targetTab: TabType) => {
    if (onLoginSuccess) {
      onLoginSuccess(targetTab);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Company Brand Logo */}
            <button
              onClick={() => onLoginSuccess?.('home')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <img
                src={kanyaLogo}
                alt="Kanya Table Water Logo"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-cover shadow-md ring-2 ring-cyan-500/20 group-hover:scale-105 transition-transform"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 tracking-tight text-lg leading-none group-hover:text-cyan-700 transition-colors">
                    Kanya Table Water
                  </span>
                  <span className="text-xs bg-cyan-100 text-cyan-800 font-semibold px-2 py-0.5 rounded-full border border-cyan-200">
                    NG 🇳🇬
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate max-w-xs">
                  Abuja, Lugbe Light Gold Phase 4
                </p>
              </div>
            </button>

            {/* CENTER LOGIN BUTTON */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <LogIn className="w-4 h-4" />
                <span>Account Login</span>
                <span className="hidden md:inline bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  {currentUser.role.replace('_', ' ').toUpperCase()}
                </span>
              </button>
            </div>

            {/* Quick Role Switcher Bar */}
            <div className="hidden xl:flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2">
                Roles:
              </span>
              {roles.map((r) => {
                const isActive = currentUser.role === r.role;
                const IconComp = r.icon;
                return (
                  <button
                    key={r.role}
                    onClick={() => {
                      setCurrentUserRole(r.role);
                      if (onLoginSuccess) {
                        if (r.role === 'operator') onLoginSuccess('operator_hub');
                        else if (r.role === 'driver') onLoginSuccess('deliveries');
                        else if (r.role === 'customer') onLoginSuccess('customer_portal');
                        else onLoginSuccess('dashboard');
                      }
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-cyan-800 shadow-xs border border-slate-200 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                    title={r.description}
                  >
                    <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                    {r.name}
                  </button>
                );
              })}
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-3">
              
              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {totalAlerts > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                      {totalAlerts}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotificationMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-sm font-semibold text-slate-900">System Alerts</h4>
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {totalAlerts} New
                      </span>
                    </div>
                    <div className="mt-3 space-y-2 max-h-64 overflow-y-auto text-xs">
                      {pendingApprovalsCount > 0 && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                          <p className="font-semibold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            {pendingApprovalsCount} Pending Production Approvals
                          </p>
                          <p className="text-[11px] text-amber-700 mt-0.5">
                            Factory operators submitted new batch records awaiting manager sign-off.
                          </p>
                        </div>
                      )}
                      {lowStockCount > 0 && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
                          <p className="font-semibold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            {lowStockCount} Low Stock Alert(s)
                          </p>
                          <p className="text-[11px] text-rose-700 mt-0.5">
                            Some water products are below minimum alert inventory thresholds.
                          </p>
                        </div>
                      )}
                      {totalAlerts === 0 && (
                        <p className="text-center py-4 text-slate-400 italic">No pending alerts or notifications.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown / Role Switcher for Mobile */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-2 p-1.5 pl-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/80 cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-cyan-500/30"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {currentUser.name}
                    </p>
                    <div className="mt-0.5">
                      <RoleBadge role={currentUser.role} showIcon={false} />
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* User Dropdown Menu */}
                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 bg-slate-50 rounded-xl mb-2">
                      <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                      <p className="text-[11px] text-cyan-700 font-medium mt-1">📞 {currentUser.phone}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        setIsLoginModalOpen(true);
                      }}
                      className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2 bg-cyan-700 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-cyan-800 transition-colors"
                    >
                      <LogIn className="w-4 h-4" /> Open Login Portal
                    </button>

                    <p className="text-[10px] uppercase font-semibold text-slate-400 px-2 my-1">
                      Quick Role Switch:
                    </p>
                    <div className="space-y-1">
                      {roles.map((r) => {
                        const Icon = r.icon;
                        return (
                          <button
                            key={r.role}
                            onClick={() => {
                              setCurrentUserRole(r.role);
                              setShowRoleMenu(false);
                              if (onLoginSuccess) {
                                if (r.role === 'operator') onLoginSuccess('operator_hub');
                                else if (r.role === 'driver') onLoginSuccess('deliveries');
                                else if (r.role === 'customer') onLoginSuccess('customer_portal');
                                else onLoginSuccess('dashboard');
                              }
                            }}
                            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left cursor-pointer transition-colors ${
                              currentUser.role === r.role
                                ? 'bg-cyan-50 text-cyan-900 font-bold'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <Icon className="w-4 h-4 text-cyan-600" />
                            <div>
                              <div>{r.name}</div>
                              <div className="text-[10px] text-slate-400 font-normal">{r.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 pt-2 mt-2">
                      <button
                        onClick={() => {
                          resetToDefaultData();
                          setShowRoleMenu(false);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Demo System Data
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* LOGIN MODAL */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginRedirect}
      />
    </>
  );
};

