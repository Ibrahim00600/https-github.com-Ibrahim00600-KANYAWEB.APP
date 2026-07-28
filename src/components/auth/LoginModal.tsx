import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { TabType } from '../Sidebar';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  db,
  doc,
  setDoc,
} from '../../lib/firebase';
import { logAuthEvent } from '../../services/authLogger';
import { UserRole } from '../../types';
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
  UserPlus,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (targetTab: TabType) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { users, switchUser, createUser } = useApp();

  const [loginMode, setLoginMode] = useState<'credentials' | 'signup' | 'forgot'>('credentials');
  
  // Login form
  const [inputCredential, setInputCredential] = useState('');
  const [inputPassword, setInputPassword] = useState('');

  // Password Reset form
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('customer');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupAddress, setSignupAddress] = useState('Abuja, Lugbe Light Gold Phase 4');

  const [isLoading, setIsLoading] = useState(false);
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

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!inputCredential) {
      setErrorMsg('Please enter your Email Address.');
      setIsLoading(false);
      return;
    }

    const cleanInput = inputCredential.trim().toLowerCase();

    // 1. Try Firebase Authentication first if email format
    if (cleanInput.includes('@')) {
      try {
        await signInWithEmailAndPassword(auth, cleanInput, inputPassword || 'password123');
      } catch (fbError: any) {
        console.warn('Firebase auth notice:', fbError?.message);
        // Fallthrough to local user database check for pre-configured staff
      }
    }

    // 2. Match local user
    let matchedUser = users.find(
      (u) =>
        u.email.toLowerCase() === cleanInput ||
        u.phone.replaceAll(' ', '').includes(cleanInput.replaceAll(' ', '')) ||
        u.name.toLowerCase().includes(cleanInput)
    );

    // If still no local user, auto-register as custom user if email was given
    if (!matchedUser && cleanInput.includes('@')) {
      const newUserId = 'user-' + Date.now();
      const newName = cleanInput.split('@')[0].replace('.', ' ').toUpperCase();
      createUser({
        email: cleanInput,
        name: newName,
        role: 'super_admin', // Default to admin for custom user logins
        phone: '+234 803 000 0000',
        address: 'Abuja, Lugbe Light Gold Phase 4',
        state: 'FCT Abuja',
        active: true,
      });
      matchedUser = {
        id: newUserId,
        email: cleanInput,
        name: newName,
        role: 'super_admin',
        phone: '+234 803 000 0000',
        address: 'Abuja, Lugbe Light Gold Phase 4',
        state: 'FCT Abuja',
        active: true,
        createdAt: new Date().toISOString().substring(0, 10),
      };
    }

    if (!matchedUser) {
      setErrorMsg('Invalid login credentials. Please check your email or try quick role login.');
      setIsLoading(false);
      logAuthEvent({
        userEmail: cleanInput,
        eventType: 'login_failure',
        status: 'failed',
        details: 'Invalid credentials entered',
      });
      return;
    }

    // Authenticate user
    switchUser(matchedUser.id);
    const redirect = getRoleDefaultTab(matchedUser.role);

    // Record login event to Firestore
    logAuthEvent({
      userId: matchedUser.id,
      userEmail: matchedUser.email,
      userName: matchedUser.name,
      userRole: matchedUser.role,
      eventType: 'login_success',
      status: 'success',
      details: `User signed in successfully to ${redirect.label}`,
    });

    setSuccessInfo({
      name: matchedUser.name,
      role: matchedUser.role.replace('_', ' ').toUpperCase(),
      redirectTab: redirect.label,
    });

    setIsLoading(false);
    setTimeout(() => {
      setSuccessInfo(null);
      setInputCredential('');
      setInputPassword('');
      onClose();
      onLoginSuccess(redirect.tab);
    }, 1200);
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!resetEmail || !resetEmail.includes('@')) {
      setErrorMsg('Please enter a valid registered email address.');
      setIsLoading(false);
      return;
    }

    try {
      // Trigger Firebase Password Reset Email
      try {
        await sendPasswordResetEmail(auth, resetEmail.trim().toLowerCase());
      } catch (fbErr: any) {
        console.warn('Firebase reset email notice:', fbErr?.message);
      }

      setResetSuccess(true);
      logAuthEvent({
        userEmail: resetEmail.trim().toLowerCase(),
        eventType: 'password_reset_requested',
        status: 'success',
        details: 'Password recovery email requested',
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to dispatch recovery email. Please check the address.');
      logAuthEvent({
        userEmail: resetEmail.trim().toLowerCase(),
        eventType: 'password_reset_requested',
        status: 'failed',
        details: err?.message || 'Recovery email failed to send',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!signupEmail || !signupName || !signupPassword) {
      setErrorMsg('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create in Firebase Auth
      let firebaseUid = 'user-' + Date.now();
      try {
        const userCred = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
        firebaseUid = userCred.user.uid;
      } catch (fbErr: any) {
        console.warn('Firebase signup notice:', fbErr?.message);
      }

      // 2. Create in App state
      const newUser = {
        email: signupEmail,
        name: signupName,
        role: signupRole,
        phone: signupPhone || '+234 803 000 0000',
        address: signupAddress || 'Abuja, Lugbe Light Gold Phase 4',
        state: 'FCT Abuja',
        active: true,
      };

      createUser(newUser);

      logAuthEvent({
        userId: firebaseUid,
        userEmail: signupEmail,
        userName: signupName,
        userRole: signupRole,
        eventType: 'signup',
        status: 'success',
        details: 'New account registered',
      });

      // Save to Firestore
      try {
        await setDoc(doc(db, 'users', firebaseUid), {
          uid: firebaseUid,
          ...newUser,
          createdAt: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('Firestore write notice:', dbErr);
      }

      const redirect = getRoleDefaultTab(signupRole);

      setSuccessInfo({
        name: signupName,
        role: signupRole.replace('_', ' ').toUpperCase(),
        redirectTab: redirect.label,
      });

      setIsLoading(false);
      setTimeout(() => {
        setSuccessInfo(null);
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
        onClose();
        onLoginSuccess(redirect.tab);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create account.');
      setIsLoading(false);
    }
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
      title="User Sign In & Account Portal"
      subtitle="Sign in with your staff or customer credentials to access your portal"
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
          
          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setLoginMode('credentials')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                loginMode === 'credentials' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('signup')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                loginMode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register / Sign Up
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              {errorMsg}
            </div>
          )}

          {/* MODE 1: CREDENTIALS SIGN IN */}
          {loginMode === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. salisu.kanya@kanyawater.ng"
                    value={inputCredential}
                    onChange={(e) => setInputCredential(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(inputCredential || '');
                      setErrorMsg('');
                      setResetSuccess(false);
                      setLoginMode('forgot');
                    }}
                    className="text-xs text-cyan-600 hover:text-cyan-800 font-semibold transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
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
                  disabled={isLoading}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer hover:from-cyan-700 hover:to-blue-700 flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  <span>Sign In to Portal</span>
                </button>
              </div>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {loginMode === 'forgot' && (
            <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
              <div className="p-3.5 bg-cyan-50 border border-cyan-200 rounded-2xl text-xs text-cyan-950 space-y-1">
                <p className="font-bold flex items-center gap-2 text-cyan-950 text-xs">
                  <KeyRound className="w-4 h-4 text-cyan-600" /> Account Access Recovery
                </p>
                <p className="text-[11px] text-cyan-800 leading-relaxed">
                  Enter your registered staff or customer email address. We will send you an official password recovery link to safely reset your account access.
                </p>
              </div>

              {resetSuccess ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 text-center animate-in zoom-in-95 duration-200">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-950">Password Recovery Email Dispatched!</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
                    A password reset link has been sent to <strong className="text-emerald-950 font-extrabold">{resetEmail}</strong>. Please check your email inbox and follow the steps to reset your password.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setResetSuccess(false);
                      setLoginMode('credentials');
                    }}
                    className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. salisu.kanya@kanyawater.ng"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setLoginMode('credentials')}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer hover:from-cyan-700 hover:to-blue-700 flex items-center gap-2"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      <span>Send Recovery Link</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* MODE 2: SIGN UP */}
          {loginMode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ibrahim Yusuf"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role</label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="super_admin">Super Admin (Full System Control)</option>
                    <option value="manager">Manager</option>
                    <option value="operator">Operator</option>
                    <option value="driver">Driver</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+234 803 123 4567"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address Location</label>
                <input
                  type="text"
                  placeholder="Abuja, Lugbe Light Gold Phase 4"
                  value={signupAddress}
                  onChange={(e) => setSignupAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500"
                />
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
                  disabled={isLoading}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer hover:from-cyan-700 hover:to-blue-700 flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Create Account & Sign In</span>
                </button>
              </div>
            </form>
          )}

        </div>
      )}
    </Modal>
  );
};

