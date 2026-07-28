import React, { useState } from 'react';
import { TabType } from '../Sidebar';
import { LoginModal } from '../auth/LoginModal';
import kanyaLogo from '../../assets/images/kanya_water_logo_1785244963793.jpg';
import kanyaBg from '../../assets/images/kanya_water_bg_1785244979366.jpg';
import {
  LogIn,
  ShieldCheck,
  Wrench,
  Truck,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

interface HomePageViewProps {
  onNavigateTab: (tab: TabType) => void;
}

export const HomePageView: React.FC<HomePageViewProps> = ({ onNavigateTab }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginSuccess = (targetTab: TabType) => {
    onNavigateTab(targetTab);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in duration-300">
      
      {/* HERO BANNER WITH BACKGROUND IMAGE AND CENTERED LOGIN */}
      <div className="relative rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-lg text-center space-y-6 overflow-hidden min-h-[320px] flex flex-col justify-center items-center">
        
        {/* Background Image with Glass Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={kanyaBg}
            alt="Kanya Table Water Product Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-[0.45] saturate-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-900/40"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 space-y-6 max-w-2xl mx-auto text-white">
          
          {/* Brand Logo & Name */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <img
              src={kanyaLogo}
              alt="Kanya Water Logo"
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-2xl ring-4 ring-white/30 transform hover:scale-105 transition-transform"
            />
          </div>

          {/* PROMINENT RE-DESIGNED SIGN IN BUTTON */}
          <div className="pt-2 flex flex-col items-center gap-4">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="group relative px-9 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white rounded-2xl text-base sm:text-lg font-black shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-400/60 transition-all duration-300 cursor-pointer flex items-center gap-3 transform hover:-translate-y-1 active:translate-y-0 border border-white/20"
            >
              <div className="p-1.5 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                <LogIn className="w-5 h-5 text-white" />
              </div>
              <span className="tracking-wide">Sign In / Access Portal</span>
              <ArrowRight className="w-5 h-5 text-cyan-200 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* NAFDAC REG NO & LOCATION BADGE MOVED BELOW SIGN IN BUTTON */}
            <div className="pt-2">
              <span className="text-[11px] font-extrabold text-cyan-200 bg-slate-900/80 border border-cyan-400/40 px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md inline-block">
                NAFDAC REG NO: 01-8492-TW • Abuja, Lugbe Light Gold Phase 4
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* CLEAN PORTAL ACCESS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <button
          onClick={() => onNavigateTab('dashboard')}
          className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition-all cursor-pointer group space-y-3 shadow-2xs hover:shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-cyan-800">Executive Dashboard</h3>
            <p className="text-xs text-slate-500 mt-1">Overview of revenue, stock, and staff operations.</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('operator_hub')}
          className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition-all cursor-pointer group space-y-3 shadow-2xs hover:shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800">Operator Workspace</h3>
            <p className="text-xs text-slate-500 mt-1">Log daily production runs and factory claims.</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('deliveries')}
          className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition-all cursor-pointer group space-y-3 shadow-2xs hover:shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-800">Driver Logistics</h3>
            <p className="text-xs text-slate-500 mt-1">Manage waybills, loading, and deliveries.</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('customer_portal')}
          className="p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition-all cursor-pointer group space-y-3 shadow-2xs hover:shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-800">Customer Store</h3>
            <p className="text-xs text-slate-500 mt-1">Order sachet water packs & dispenser bottles.</p>
          </div>
        </button>

      </div>

      {/* LOGIN MODAL */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
};

