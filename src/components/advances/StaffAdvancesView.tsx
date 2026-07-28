import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StaffAdvance } from '../../types';
import { Modal } from '../common/Modal';
import {
  Wallet,
  Plus,
  Search,
  User,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  FileText,
  BadgeAlert,
} from 'lucide-react';

export const StaffAdvancesView: React.FC = () => {
  const { currentUser, users, staffAdvances, addStaffAdvance, formatCurrency } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState<number | ''>(5000);
  const [advanceDate, setAdvanceDate] = useState(new Date().toISOString().substring(0, 10));
  const [advanceTime, setAdvanceTime] = useState(new Date().toTimeString().substring(0, 5));
  const [purpose, setPurpose] = useState('Staff Salary Advance / Daily Allowance');
  const [notes, setNotes] = useState('');

  // Eligible Staff members (Operators, Drivers, Managers, etc.)
  const eligibleStaff = users.filter((u) => u.role !== 'customer');

  // Helper to compute how many times a staff member collected money in a given month (e.g. "2026-07")
  const currentMonthStr = new Date().toISOString().substring(0, 7); // e.g. "2026-07"

  const getStaffMonthlyCount = (staffName: string, monthPrefix: string = currentMonthStr) => {
    return staffAdvances.filter(
      (sa) => sa.staffName === staffName && sa.advanceDate.startsWith(monthPrefix)
    ).length;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId || !advanceAmount) return;

    const staffUser = users.find((u) => u.id === selectedStaffId);
    if (!staffUser) return;

    const fullDateTime = `${advanceDate} ${advanceTime}`;

    addStaffAdvance({
      staffId: staffUser.id,
      staffName: staffUser.name,
      staffRole: staffUser.role,
      amount: Number(advanceAmount),
      advanceDate: fullDateTime,
      purpose,
      notes,
    });

    setIsModalOpen(false);
    setSelectedStaffId('');
    setPurpose('Staff Salary Advance / Daily Allowance');
    setNotes('');
  };

  const filteredAdvances = staffAdvances.filter((a) => {
    const matchesStaff = selectedStaffFilter === 'all' || a.staffId === selectedStaffFilter;
    const matchesSearch =
      a.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.staffRole.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStaff && matchesSearch;
  });

  const thisMonthAdvances = staffAdvances.filter((a) => a.advanceDate.startsWith(currentMonthStr));
  const totalAmountThisMonth = thisMonthAdvances.reduce((sum, a) => sum + a.amount, 0);

  const canManage = currentUser.role === 'super_admin' || currentUser.role === 'manager';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Staff Money Collection & Cash Advances
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Record money collected by staff members (Operators, Drivers, Staff), date and time of collection, and track monthly frequency of collections per staff.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Record Staff Money Collection
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Disbursed This Month ({currentMonthStr})
          </p>
          <p className="text-2xl font-bold text-purple-700 mt-2">{formatCurrency(totalAmountThisMonth)}</p>
          <p className="text-xs text-slate-500 mt-1">{thisMonthAdvances.length} collections recorded this month</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Staff Recipients</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {new Set(thisMonthAdvances.map((a) => a.staffId)).size} Staff Members
          </p>
          <p className="text-xs text-slate-500 mt-1">Collected money during current cycle</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lifetime Total Advances</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {formatCurrency(staffAdvances.reduce((s, a) => s + a.amount, 0))}
          </p>
          <p className="text-xs text-slate-500 mt-1">{staffAdvances.length} total entries on record</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search staff name or purpose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 font-semibold whitespace-nowrap">Filter Staff:</label>
          <select
            value={selectedStaffFilter}
            onChange={(e) => setSelectedStaffFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
          >
            <option value="all">All Staff Members</option>
            {eligibleStaff.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Staff Name & Role</th>
                <th className="py-3.5 px-4">Date & Time Collected</th>
                <th className="py-3.5 px-4 text-center">Monthly Frequency Counter</th>
                <th className="py-3.5 px-4 text-right">Amount Collected</th>
                <th className="py-3.5 px-4">Purpose / Reason</th>
                <th className="py-3.5 px-4">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdvances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    No staff money collection records found.
                  </td>
                </tr>
              ) : (
                filteredAdvances.map((adv) => {
                  const monthlyFreq = adv.monthlyFrequencyCount || getStaffMonthlyCount(adv.staffName, adv.advanceDate.substring(0, 7));

                  return (
                    <tr key={adv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {adv.staffName}
                        <p className="text-[11px] text-purple-700 font-semibold capitalize mt-0.5">
                          {adv.staffRole.replace('_', ' ')}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1 font-sans font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {adv.advanceDate}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                            monthlyFreq > 3
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : monthlyFreq > 1
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}
                        >
                          <BadgeAlert className="w-3.5 h-3.5" />
                          {monthlyFreq} {monthlyFreq === 1 ? 'time' : 'times'} this month
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
                        {formatCurrency(adv.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {adv.purpose}
                        {adv.notes && <p className="text-[10px] text-slate-400 italic mt-0.5">{adv.notes}</p>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {adv.recordedBy}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Staff Money Collection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Staff Money Collection / Advance"
        subtitle="Log cash collected by a staff member and track monthly collection count"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Staff Member
            </label>
            <select
              required
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Choose Staff Member --</option>
              {eligibleStaff.map((u) => {
                const countThisMonth = getStaffMonthlyCount(u.name);
                return (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.replace('_', ' ')}) — Collected {countThisMonth} times this month
                  </option>
                );
              })}
            </select>
          </div>

          {selectedStaffId && (() => {
            const chosenUser = users.find((u) => u.id === selectedStaffId);
            const count = chosenUser ? getStaffMonthlyCount(chosenUser.name) : 0;
            return (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs flex justify-between items-center text-purple-950 font-medium">
                <span>Monthly Collection Frequency for <strong>{chosenUser?.name}</strong>:</span>
                <span className="font-bold text-purple-900 bg-purple-200 px-2.5 py-1 rounded-lg">
                  {count + 1}th collection this month
                </span>
              </div>
            );
          })()}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount Collected (₦)
            </label>
            <input
              type="number"
              min="100"
              required
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Collection Date
              </label>
              <input
                type="date"
                required
                value={advanceDate}
                onChange={(e) => setAdvanceDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Collection Time
              </label>
              <input
                type="time"
                required
                value={advanceTime}
                onChange={(e) => setAdvanceTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Purpose / Category
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Daily shift allowance, fuel money, advance on salary"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Additional Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Authorized by Manager Usman for urgent personal errand"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Record Money Collection
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};
