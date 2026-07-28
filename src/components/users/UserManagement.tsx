import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { RoleBadge } from '../RoleBadge';
import { Modal } from '../common/Modal';
import { db, collection, onSnapshot } from '../../lib/firebase';
import { AuthLog } from '../../services/authLogger';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Truck,
  Phone,
  Mail,
  ShieldCheck,
  Activity,
  KeyRound,
  Clock,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const {
    currentUser,
    users,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    switchUser,
  } = useApp();

  const [viewMode, setViewMode] = useState<'users' | 'auth_logs'>('users');
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Subscribe to real-time Firestore auth_logs for Super Admin login progress monitoring
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'auth_logs'), (snapshot) => {
        const fetchedLogs: AuthLog[] = [];
        snapshot.forEach((docSnap) => {
          fetchedLogs.push({ id: docSnap.id, ...docSnap.data() } as AuthLog);
        });
        // Sort descending by timestamp
        fetchedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAuthLogs(fetchedLogs);
      }, (err) => {
        console.warn('Firestore auth_logs listener notice:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Auth logs snapshot subscription error:', e);
    }
  }, []);

  // Add User Form State
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<UserRole>('operator');
  const [phoneInput, setPhoneInput] = useState('+234 ');
  const [addressInput, setAddressInput] = useState('');
  const [vehicleNoInput, setVehicleNoInput] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !emailInput) return;

    createUser({
      name: nameInput,
      email: emailInput,
      role: roleInput,
      phone: phoneInput || '+234 800 000 0000',
      address: addressInput || 'Abuja, Lugbe Light Gold Phase 4',
      state: 'FCT Abuja',
      active: true,
      vehicleNo: roleInput === 'driver' ? vehicleNoInput || 'KNY-555-KN' : undefined,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 99999)}?auto=format&fit=crop&w=150&q=80`,
    });

    setIsAddUserOpen(false);
    setNameInput('');
    setEmailInput('');
    setPhoneInput('+234 ');
    setAddressInput('');
    setVehicleNoInput('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        role: editingUser.role,
        address: editingUser.address,
        vehicleNo: editingUser.role === 'driver' ? editingUser.vehicleNo : undefined,
      });
      setEditingUser(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);

    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              User Accounts & Auth Monitoring
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Super Admin control center to manage company accounts and monitor user authentication progress in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'users'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Directory ({users.length})
            </button>
            <button
              onClick={() => setViewMode('auth_logs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'auth_logs'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-purple-600" /> Auth Audit Logs
              <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {authLogs.length}
              </span>
            </button>
          </div>

          <button
            onClick={() => setIsAddUserOpen(true)}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {viewMode === 'auth_logs' ? (
        /* AUTH LOGS AUDIT MONITOR */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Activity className="w-4 h-4 text-purple-600" />
              <span>Real-Time Firestore Authentication Logs & Login Progress</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Automatically logging login attempts, signups, password resets, and logouts.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Event Type</th>
                    <th className="py-3.5 px-4">User Details</th>
                    <th className="py-3.5 px-4">Assigned Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {authLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        No authentication logs recorded in Firestore yet. User login activity will stream here in real-time.
                      </td>
                    </tr>
                  ) : (
                    authLogs.map((log) => {
                      const isSuccess = log.status === 'success';
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              {log.eventType === 'login_success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                              {log.eventType === 'login_failure' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                              {log.eventType === 'signup' && <UserPlus className="w-3.5 h-3.5 text-blue-600" />}
                              {log.eventType === 'password_reset_requested' && <KeyRound className="w-3.5 h-3.5 text-amber-600" />}
                              {log.eventType === 'logout' && <RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
                              {log.eventType.replaceAll('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{log.userName || log.userEmail || 'Anonymous User'}</p>
                            <p className="text-[11px] text-slate-500">{log.userEmail || 'N/A'}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <RoleBadge role={(log.userRole as UserRole) || 'customer'} />
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              isSuccess
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-xs">
                            {log.details || 'Standard authentication event'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* USERS DIRECTORY VIEW */
        <>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Users' },
            { id: 'manager', label: 'Managers' },
            { id: 'operator', label: 'Operators' },
            { id: 'driver', label: 'Drivers' },
            { id: 'customer', label: 'Customers' },
            { id: 'super_admin', label: 'Admins' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterRole(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                filterRole === pill.id
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Phone / Vehicle</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Quick Login</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-900">{user.phone}</p>
                    {user.vehicleNo && (
                      <p className="text-[11px] text-purple-700 font-semibold">{user.vehicleNo}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    {user.address || 'Kano State'}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer ${
                        user.active
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {user.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => switchUser(user.id)}
                      className="px-2.5 py-1 bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                    >
                      Login As
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
                              deleteUser(user.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Create New User Account"
        subtitle="Specify role permissions for Manager, Operator, Driver, or Customer"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Bello Usman"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="bello@kanyawater.ng"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value="super_admin">Super Admin</option>
                <option value="manager">Manager</option>
                <option value="operator">Operator (Factory Staff)</option>
                <option value="driver">Driver (Logistics)</option>
                <option value="customer">Customer / Distributor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {roleInput === 'driver' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vehicle Registration Number & Model
              </label>
              <input
                type="text"
                placeholder="e.g. KNY-990-KN (Isuzu 3-Ton Truck)"
                value={vehicleNoInput}
                onChange={(e) => setVehicleNoInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-purple-900"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
            <input
              type="text"
              placeholder="Sharada Industrial Layout, Kano"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Edit User Account: ${editingUser.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value="super_admin">Super Admin</option>
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
                value={editingUser.phone}
                onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            {editingUser.role === 'driver' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle No</label>
                <input
                  type="text"
                  value={editingUser.vehicleNo || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, vehicleNo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
