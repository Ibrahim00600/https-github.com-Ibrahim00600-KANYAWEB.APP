import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import {
  Factory,
  Plus,
  FileCheck2,
  Printer,
  DollarSign,
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Package,
  Layers,
  FileText,
} from 'lucide-react';

export const OperatorHubView: React.FC = () => {
  const {
    currentUser,
    products,
    productionRecords,
    operatorClaims,
    addProductionRecord,
    addOperatorClaim,
    updateOperatorClaimStatus,
    formatCurrency,
  } = useApp();

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<'upload' | 'weekly_report' | 'claims'>('upload');

  // Daily Upload Form State
  const [uploadProductId, setUploadProductId] = useState(products[0]?.id || '');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().substring(0, 10));
  const [uploadBagsProduced, setUploadBagsProduced] = useState<number | ''>(500);
  const [uploadBagsDamaged, setUploadBagsDamaged] = useState<number | ''>(5);
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState(false);

  // Weekly Report Generator State
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().substring(0, 10);
  });
  const [weeklyReportView, setWeeklyReportView] = useState(false);

  // Supply / Fund Claim Form State
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimAmount, setClaimAmount] = useState<number | ''>(15000);
  const [claimCategory, setClaimCategory] = useState<'materials' | 'maintenance' | 'allowance' | 'emergency'>('materials');
  const [claimDescription, setClaimDescription] = useState('Purchase of 5 rolls of Nylon Sealing Film for Sachet Machine');

  // Handle Daily Upload
  const handleDailyUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadProductId || !uploadBagsProduced) return;

    addProductionRecord({
      productId: uploadProductId,
      bagsProduced: Number(uploadBagsProduced),
      bagsDamaged: Number(uploadBagsDamaged) || 0,
      bagsTransferredToWarehouse: Math.max(0, Number(uploadBagsProduced) - (Number(uploadBagsDamaged) || 0)),
      productionDate: uploadDate,
      notes: uploadNotes,
    });

    setUploadSuccessMsg(true);
    setTimeout(() => setUploadSuccessMsg(false), 4000);
    setUploadNotes('');
  };

  // Handle Supply Claim
  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimAmount || !claimDescription) return;

    addOperatorClaim({
      operatorName: currentUser.name,
      amount: Number(claimAmount),
      claimDate: new Date().toISOString().substring(0, 10),
      category: claimCategory,
      description: claimDescription,
    });

    setIsClaimModalOpen(false);
    setClaimDescription('');
  };

  // Calculations for Weekly Report
  const weekStart = new Date(selectedWeekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekEndStr = weekEnd.toISOString().substring(0, 10);

  const weekRecords = productionRecords.filter((r) => {
    return r.productionDate >= selectedWeekStart && r.productionDate <= weekEndStr;
  });

  const isOperator = currentUser.role === 'operator';
  const myRecords = isOperator ? weekRecords.filter((r) => r.operatorId === currentUser.id) : weekRecords;

  const totalProducedWeek = myRecords.reduce((sum, r) => sum + r.bagsProduced, 0);
  const totalDamagedWeek = myRecords.reduce((sum, r) => sum + r.bagsDamaged, 0);
  const totalTransferredWeek = myRecords.reduce((sum, r) => sum + r.bagsTransferredToWarehouse, 0);
  const damageRate = totalProducedWeek > 0 ? ((totalDamagedWeek / totalProducedWeek) * 100).toFixed(1) : '0';

  const canManageClaims = currentUser.role === 'super_admin' || currentUser.role === 'manager';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Factory className="w-6 h-6 text-cyan-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Factory Operator Workspace & Weekly Reports
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Upload daily production counts, generate automated weekly shift reports, and request factory supply funds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsClaimModalOpen(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Request Supply / Funds
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Plus className="w-4 h-4" /> Upload Daily Production
        </button>

        <button
          onClick={() => setActiveTab('weekly_report')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'weekly_report' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-4 h-4" /> Weekly Production Report Generator
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'claims' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Supply & Materials Claims
          {operatorClaims.filter((c) => c.status === 'pending').length > 0 && (
            <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {operatorClaims.filter((c) => c.status === 'pending').length} pending
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: DAILY UPLOAD FORM */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Upload Daily Water Production Run</h2>
            <p className="text-xs text-slate-500 mb-6">
              Enter the total water bags produced today. The log will be submitted for manager approval.
            </p>

            {uploadSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Production run recorded successfully and submitted to Manager for sign-off!
              </div>
            )}

            <form onSubmit={handleDailyUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Production Date</label>
                <input
                  type="date"
                  required
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Water Line / Product</label>
                <select
                  value={uploadProductId}
                  onChange={(e) => setUploadProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.unitDescription})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bags/Packs Produced Today</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={uploadBagsProduced}
                    onChange={(e) => setUploadBagsProduced(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-cyan-900 text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Damaged / Burst Bags</label>
                  <input
                    type="number"
                    min="0"
                    value={uploadBagsDamaged}
                    onChange={(e) => setUploadBagsDamaged(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-rose-600 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Operator Machine & Shift Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. UV sterilization check normal, TDS reading 45 ppm, line operated smoothly..."
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                Upload Daily Production Batch
              </button>
            </form>
          </div>

          {/* Quick Summary Side Panel */}
          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-md space-y-4">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Operator Shift Status</h3>
            
            <div className="p-3 bg-slate-800 rounded-xl space-y-1 text-xs">
              <span className="text-slate-400">Operator Name:</span>
              <p className="font-bold text-white text-sm">{currentUser.name}</p>
            </div>

            <div className="p-3 bg-slate-800 rounded-xl space-y-1 text-xs">
              <span className="text-slate-400">Total Runs Uploaded by You:</span>
              <p className="font-bold text-emerald-400 text-xl">
                {productionRecords.filter((r) => r.operatorId === currentUser.id).length} Batches
              </p>
            </div>

            <div className="p-3 bg-slate-800 rounded-xl space-y-1 text-xs">
              <span className="text-slate-400">Total Bags Produced by You:</span>
              <p className="font-bold text-cyan-400 text-2xl">
                {productionRecords
                  .filter((r) => r.operatorId === currentUser.id)
                  .reduce((sum, r) => sum + r.bagsProduced, 0)
                  .toLocaleString()}{' '}
                bags
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEEKLY REPORT GENERATOR */}
      {activeTab === 'weekly_report' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Generate Weekly Production Shift Report</h2>
              <p className="text-xs text-slate-500">Select week start date to compile production logs, damage rate, and warehouse transfers.</p>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Week Start Date</label>
                <input
                  type="date"
                  value={selectedWeekStart}
                  onChange={(e) => setSelectedWeekStart(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <button
                onClick={() => setWeeklyReportView(true)}
                className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0 mt-3"
              >
                Compile Report
              </button>
            </div>
          </div>

          {/* Report Paper View */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md max-w-4xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">KANYA TABLE WATER NIGERIA</h1>
                <p className="text-xs font-bold text-cyan-700">WEEKLY FACTORY PRODUCTION REPORT</p>
                <p className="text-xs text-slate-500 mt-1">Abuja, Lugbe Light Gold Phase 4 • NAFDAC REG NO: 01-8492-TW</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold text-slate-900">Report Date: {new Date().toISOString().substring(0, 10)}</p>
                <p className="text-slate-500">Week: {selectedWeekStart} to {weekEndStr}</p>
                <p className="text-slate-700 font-semibold mt-1">Generated by: {currentUser.name}</p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Total Weekly Production</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{totalProducedWeek.toLocaleString()} Bags</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Warehouse Transfers</p>
                <p className="text-xl font-bold text-emerald-700 mt-0.5">{totalTransferredWeek.toLocaleString()} Bags</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Damaged / Rejected</p>
                <p className="text-xl font-bold text-rose-600 mt-0.5">{totalDamagedWeek.toLocaleString()} Bags</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Loss Percentage</p>
                <p className="text-xl font-bold text-slate-800 mt-0.5">{damageRate}%</p>
              </div>
            </div>

            {/* Product breakdown table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Production Breakdown by Water Line</h3>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 font-bold text-slate-700 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Product Description</th>
                    <th className="p-3 text-center">Bags Produced</th>
                    <th className="p-3 text-center">Damaged</th>
                    <th className="p-3 text-center">Net Warehouse Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((p) => {
                    const prodRecords = myRecords.filter((r) => r.productId === p.id);
                    const prodProduced = prodRecords.reduce((sum, r) => sum + r.bagsProduced, 0);
                    const prodDamaged = prodRecords.reduce((sum, r) => sum + r.bagsDamaged, 0);
                    const prodTransferred = prodRecords.reduce((sum, r) => sum + r.bagsTransferredToWarehouse, 0);

                    return (
                      <tr key={p.id}>
                        <td className="p-3 font-semibold text-slate-900">{p.name}</td>
                        <td className="p-3 text-center font-bold text-slate-800">{prodProduced.toLocaleString()}</td>
                        <td className="p-3 text-center font-semibold text-rose-600">{prodDamaged}</td>
                        <td className="p-3 text-center font-bold text-emerald-700">{prodTransferred.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Print action */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Weekly Report
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: OPERATOR FUND & SUPPLY CLAIMS */}
      {activeTab === 'claims' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Operator Supply & Fund Requisitions</h2>
              <p className="text-xs text-slate-500">Request funds for factory materials, machine spare parts, sealing film, or maintenance.</p>
            </div>
            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Supply Claim
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Operator Name</th>
                  <th className="py-3.5 px-4">Claim Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Amount Requested</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operatorClaims.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                      No operator supply claims recorded.
                    </td>
                  </tr>
                ) : (
                  operatorClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{claim.operatorName}</td>
                      <td className="py-3.5 px-4 text-slate-500">{claim.claimDate}</td>
                      <td className="py-3.5 px-4 font-semibold capitalize text-purple-700">{claim.category}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{claim.description}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
                        {formatCurrency(claim.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            claim.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : claim.status === 'rejected'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <span className="capitalize">{claim.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {claim.status === 'pending' && canManageClaims ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => updateOperatorClaimStatus(claim.id, 'approved')}
                              className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateOperatorClaimStatus(claim.id, 'rejected')}
                              className="px-2.5 py-1 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            {claim.reviewedBy ? `Reviewed by ${claim.reviewedBy}` : 'Submitted'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Supply Claim Modal */}
      <Modal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        title="Request Factory Supplies or Funds"
        subtitle="Submit requisition to Manager for approval"
        maxWidth="md"
      >
        <form onSubmit={handleClaimSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Requisition Category</label>
            <select
              value={claimCategory}
              onChange={(e) => setClaimCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
            >
              <option value="materials">Factory Raw Materials (Nylon rolls, bottle preforms)</option>
              <option value="maintenance">Machine Servicing & Spare Parts</option>
              <option value="allowance">Operator Shift Allowance</option>
              <option value="emergency">Emergency Operational Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Needed (₦)</label>
            <input
              type="number"
              min="500"
              required
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-emerald-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose / Item Description</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. 5 rolls of nylon sachet film and replacement heating wire for line 2..."
              value={claimDescription}
              onChange={(e) => setClaimDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsClaimModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Submit Requisition
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
