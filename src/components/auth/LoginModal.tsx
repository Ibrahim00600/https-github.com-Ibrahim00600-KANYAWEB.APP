import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { TabType } from '../Sidebar';
import {
  LogIn,
  ShieldCheck,
  UserCheck,
  Wrench,
  Truck,
  ShoppingBag,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (targetTab: TabType) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { users, switchUser } = useApp();

  const [inputCredential, setInputCredential] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('user-1');
  const [loginMode, setLoginMode] = useState<'quick' | 'credentials'>('quick');
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ name: string; role: string; redirectTab: string } | null>(null);

  // Default redirect tab mapping for each user role
  const getRoleDefaultTab = (role: string): { tab: TabType; label: string } => {
    switch (role) {
      case 'super_admin':
        return { tab: 'dashboard', label: 'Executive Admin Dashboard' };
      case 'manager':
        return { tab: 'dashboard', label: 'Manager Operations Dashboard' };
      case 'operator':
        return { tab: 'operator_hub', label: 'Factory Operator Workspace' };
      case 'driver':
        return { tab: 'deliveries', label: 'Logistics & Driver Waybill Portal' };
      case 'customer':
        return { tab: 'customer_portal', label: 'Customer Water Store & Orders' };
      default:
        return { tab: 'dashboard', label: 'Overview Dashboard' };
    }
  };

  const handleQuickLogin = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    switchUser(targetUser.id);
    const redirect = getRoleDefaultTab(targetUser.role);

    setSuccessInfo({
      name: targetUser.name,
      role: targetUser.role.replace('_', ' ').toUpperCase(),
      redirectTab: redirect.label,
    });

    setTimeout(() => {
      setSuccessInfo(null);
      onClose();
      onLoginSuccess(redirect.tab);
    }, 1200);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!inputCredential) {
      setErrorMsg('Please enter your Email or Phone number.');
      return;
    }

    const cleanInput = inputCredential.trim().toLowerCase();

    // Match by email or phone or name substring
    const matchedUser = users.find(
      (u) =>
        u.email.toLowerCase() === cleanInput ||
        u.phone.replaceAll(' ', '').includes(cleanInput.replaceAll(' ', '')) ||
        u.name.toLowerCase().includes(cleanInput)
    );

    if (!matchedUser) {
      setErrorMsg('No user account found matching those credentials. Please try quick role login.');
      return;
    }

    // Authenticate user
    switchUser(matchedUser.id);
    const redirect = getRoleDefaultTab(matchedUser.role);

    setSuccessInfo({
      name: matchedUser.name,
      role: matchedUser.role.replace('_', ' ').toUpperCase(),
      redirectTab: redirect.label,
    });

    setTimeout(() => {
      setSuccessInfo(null);
      setInputCredential('');
      setInputPassword('');
      onClose();
      onLoginSuccess(redirect.tab);
    }, 1200);
  };

  const roleIcons = {
    super_admin: ShieldCheck,
    manager: UserCheck,
    operator: Wrench,
    driver: Truck,
    customer: ShoppingBag,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Staff & Customer Authentication Portal"
      subtitle="Sign in with your credentials to access your role-specific dashboard"
      maxWidth="lg"
    >
      {successInfo ? (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-in zoom-in-95 duration-300">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-emerald-950">Authentication Successful!</h3>
          <p className="text-xs text-emerald-800 font-semibold">
            Logged in as <strong>{successInfo.name}</strong> ({successInfo.role})
          </p>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" /> Redirecting to {successInfo.redirectTab}...
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* Login Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setLoginMode('quick')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                loginMode === 'quick' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Role Account Switcher
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('credentials')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                loginMode === 'credentials' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In with Credentials
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              {errorMsg}
            </div>
          )}

          {/* MODE 1: QUICK ROLE / PRE-CONFIGURED LOGIN */}
          {loginMode === 'quick' && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Select staff or customer profile to direct to dashboard:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {users.map((u) => {
                  const IconComp = roleIcons[u.role] || UserIcon;
                  const roleLabel = u.role.replace('_', ' ').toUpperCase();
                  const targetView = getRoleDefaultTab(u.role).label;

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u.id)}
                      className="p-3.5 bg-slate-50 hover:bg-cyan-50/80 border border-slate-200 hover:border-cyan-300 rounded-2xl text-left transition-all cursor-pointer group flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 group-hover:border-cyan-300 flex items-center justify-center text-cyan-600 shrink-0 shadow-xs">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 text-xs truncate group-hover:text-cyan-900">
                            {u.name}
                          </span>
                          <span className="text-[9px] bg-cyan-100 text-cyan-800 font-bold px-1.5 py-0.5 rounded uppercase">
                            {roleLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{u.email}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate mt-1">
                          Directs to: <strong className="text-slate-700">{targetView}</strong>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 2: FORM CREDENTIALS LOGIN */}
          {loginMode === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address or Phone Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. salisu.kanya@kanyawater.ng or +234 803 111 2233"
                    value={inputCredential}
                    onChange={(e) => setInputCredential(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password / Security PIN
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password or PIN (Demo: 1234)"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">💡 Sample Credentials for Testing:</span>
                <p>• Admin Email: <code className="bg-slate-200 px-1 rounded text-slate-900 font-mono">salisu.kanya@kanyawater.ng</code></p>
                <p>• Manager Email: <code className="bg-slate-200 px-1 rounded text-slate-900 font-mono">aminu.bello@kanyawater.ng</code></p>
                <p>• Operator Email: <code className="bg-slate-200 px-1 rounded text-slate-900 font-mono">usman.garba@kanyawater.ng</code></p>
                <p>• Driver Email: <code className="bg-slate-200 px-1 rounded text-slate-900 font-mono">kabiru.driver@kanyawater.ng</code></p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer hover:from-cyan-700 hover:to-blue-700 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Sign In & Direct to Dashboard
                </button>
              </div>
            </form>
          )}

        </div>
      )}
    </Modal>
  );
};
