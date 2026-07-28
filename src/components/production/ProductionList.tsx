import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductionRecord, ProductionStatus } from '../../types';
import { Modal } from '../common/Modal';
import {
  Factory,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  AlertCircle,
  Calendar,
  FileText,
} from 'lucide-react';

interface ProductionListProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const ProductionList: React.FC<ProductionListProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const {
    currentUser,
    products,
    productionRecords,
    addProductionRecord,
    approveProductionRecord,
    rejectProductionRecord,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [productionDate, setProductionDate] = useState(new Date().toISOString().substring(0, 10));
  const [bagsProduced, setBagsProduced] = useState<number | ''>(500);
  const [bagsDamaged, setBagsDamaged] = useState<number | ''>(5);
  const [notes, setNotes] = useState('');
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const bagsTransferred = Math.max(0, (Number(bagsProduced) || 0) - (Number(bagsDamaged) || 0));

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !bagsProduced) return;

    addProductionRecord({
      productId: selectedProductId,
      bagsProduced: Number(bagsProduced),
      bagsDamaged: Number(bagsDamaged) || 0,
      bagsTransferredToWarehouse: bagsTransferred,
      productionDate,
      notes,
    });

    setIsModalOpen(false);
    setNotes('');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectionModalId && rejectionReason) {
      rejectProductionRecord(rejectionModalId, rejectionReason);
      setRejectionModalId(null);
      setRejectionReason('');
    }
  };

  const filteredRecords = productionRecords.filter((r) => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch =
      r.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.operatorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const canApprove = currentUser.role === 'super_admin' || currentUser.role === 'manager';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Factory className="w-6 h-6 text-cyan-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Factory Production Log</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Record daily water batch runs, track damaged bags, and approve transfers to main warehouse inventory.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Record New Production
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search batch # or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Batches' },
            { id: 'pending_approval', label: 'Pending Approval' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterStatus(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                filterStatus === pill.id
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Batch Number</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Product Type</th>
                <th className="py-3.5 px-4 text-center">Produced</th>
                <th className="py-3.5 px-4 text-center">Damaged</th>
                <th className="py-3.5 px-4 text-center">Warehouse Transfer</th>
                <th className="py-3.5 px-4">Operator</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                    No production records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        {record.batchNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {record.productionDate}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {record.productName}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                        {record.bagsProduced.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-rose-600">
                        {record.bagsDamaged > 0 ? `-${record.bagsDamaged}` : '0'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                        {record.bagsTransferredToWarehouse.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {record.operatorName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            record.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : record.status === 'pending_approval'
                              ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {record.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {record.status === 'pending_approval' && <Clock className="w-3.5 h-3.5" />}
                          {record.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                          <span className="capitalize">{record.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {record.status === 'pending_approval' && canApprove ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => approveProductionRecord(record.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectionModalId(record.id)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            {record.approvedBy ? `Approved by ${record.approvedBy}` : record.rejectionReason ? `Reason: ${record.rejectionReason}` : 'Logged'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record New Production Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Daily Water Production"
        subtitle="Factory Staff (Operator) Daily Production Batch Entry"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Production Date
            </label>
            <input
              type="date"
              required
              value={productionDate}
              onChange={(e) => setProductionDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Product Type
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Number of Bags Produced
              </label>
              <input
                type="number"
                min="1"
                required
                value={bagsProduced}
                onChange={(e) => setBagsProduced(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Damaged / Rejected Bags
              </label>
              <input
                type="number"
                min="0"
                value={bagsDamaged}
                onChange={(e) => setBagsDamaged(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none text-rose-600 font-bold"
              />
            </div>
          </div>

          {/* Calculated warehouse transfer */}
          <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-cyan-900">Bags Transferred to Warehouse:</span>
            <span className="text-lg font-bold text-cyan-950">{bagsTransferred.toLocaleString()} Bags</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Production Notes / Shift Calibration
            </label>
            <textarea
              rows={3}
              placeholder="e.g., UV filter replaced, line B operating smoothly at 1,200 bags/hr..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Submit Production Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectionModalId}
        onClose={() => setRejectionModalId(null)}
        title="Reject Production Batch"
        maxWidth="md"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Please enter a reason for rejecting this production batch entry. The operator will be notified.
          </p>
          <textarea
            required
            rows={3}
            placeholder="e.g. Quality test failed: Total Dissolved Solids (TDS) out of standard specs..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectionModalId(null)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
