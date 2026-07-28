import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerDebt, PaymentMethod } from '../../types';
import { Modal } from '../common/Modal';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  User,
  History,
  FileText,
} from 'lucide-react';

export const DebtsView: React.FC = () => {
  const { currentUser, debts, addDebt, recordDebtPayment, formatCurrency } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal State for New Credit Record
  const [isNewDebtModalOpen, setIsNewDebtModalOpen] = useState(false);
  const [debtorName, setDebtorName] = useState('');
  const [debtorPhone, setDebtorPhone] = useState('');
  const [debtorAddress, setDebtorAddress] = useState('');
  const [itemsDescription, setItemsDescription] = useState('200 Bags of Sachet Water (50cl)');
  const [totalCreditAmount, setTotalCreditAmount] = useState<number | ''>(70000);
  const [creditDate, setCreditDate] = useState(new Date().toISOString().substring(0, 10));
  const [creditTime, setCreditTime] = useState(new Date().toTimeString().substring(0, 5));
  const [creditNotes, setCreditNotes] = useState('');

  // Modal State for Recording Payment
  const [payingDebt, setPayingDebt] = useState<CustomerDebt | null>(null);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [payDate, setPayDate] = useState(new Date().toISOString().substring(0, 10));
  const [payTime, setPayTime] = useState(new Date().toTimeString().substring(0, 5));
  const [payNotes, setPayNotes] = useState('');

  // Payment History Detail View
  const [historyDebt, setHistoryDebt] = useState<CustomerDebt | null>(null);

  const handleAddDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtorName || !totalCreditAmount) return;

    const fullDateTime = `${creditDate} ${creditTime}`;

    addDebt({
      debtorName,
      debtorPhone,
      debtorAddress,
      itemsDescription,
      totalCreditAmount: Number(totalCreditAmount),
      creditDate: fullDateTime,
      notes: creditNotes,
    });

    setIsNewDebtModalOpen(false);
    setDebtorName('');
    setDebtorPhone('');
    setDebtorAddress('');
    setCreditNotes('');
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payingDebt && payAmount) {
      const fullDateTime = `${payDate} ${payTime}`;
      recordDebtPayment({
        debtId: payingDebt.id,
        amount: Number(payAmount),
        paidDate: fullDateTime,
        paymentMethod: payMethod,
        notes: payNotes,
      });

      setPayingDebt(null);
      setPayAmount('');
      setPayNotes('');
    }
  };

  const filteredDebts = debts.filter((d) => {
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    const matchesSearch =
      d.debtorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.debtorPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.itemsDescription.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const totalOutstanding = debts.reduce((sum, d) => sum + d.balanceOwed, 0);
  const totalCollected = debts.reduce((sum, d) => sum + d.totalPaidAmount, 0);
  const totalCreditIssued = debts.reduce((sum, d) => sum + d.totalCreditAmount, 0);

  const canManage = currentUser.role === 'super_admin' || currentUser.role === 'manager';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Customer Debt & Credit Sales Tracker
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track customer credit balances, record date and time products were taken on credit, and log payment receipts with timestamps.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsNewDebtModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Record New Credit / Debt
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Outstanding Debt</p>
          <p className="text-2xl font-bold text-rose-600 mt-2">{formatCurrency(totalOutstanding)}</p>
          <p className="text-xs text-slate-500 mt-1">Money owed by customers on credit</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Debts Recovered</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(totalCollected)}</p>
          <p className="text-xs text-slate-500 mt-1">Payments collected & verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Credit Extended</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(totalCreditIssued)}</p>
          <p className="text-xs text-slate-500 mt-1">Cumulative credit water sales</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search debtor name, phone, items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Debtors' },
            { id: 'unpaid', label: 'Unpaid' },
            { id: 'partially_paid', label: 'Partially Paid' },
            { id: 'fully_paid', label: 'Fully Paid' },
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

      {/* Debtors List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Debtor / Customer</th>
                <th className="py-3.5 px-4">Water Items Taken</th>
                <th className="py-3.5 px-4">Credit Date & Time</th>
                <th className="py-3.5 px-4 text-right">Total Credit</th>
                <th className="py-3.5 px-4 text-right">Paid Amount</th>
                <th className="py-3.5 px-4 text-right">Balance Owed</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDebts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    No customer debt records found.
                  </td>
                </tr>
              ) : (
                filteredDebts.map((debt) => (
                  <tr key={debt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {debt.debtorName}
                      <p className="text-[11px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {debt.debtorPhone}
                      </p>
                      {debt.debtorAddress && (
                        <p className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {debt.debtorAddress}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {debt.itemsDescription}
                      {debt.notes && <p className="text-[10px] text-slate-400 italic mt-0.5">{debt.notes}</p>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {debt.creditDate}
                      <p className="text-[10px] text-slate-400 font-sans">Recorded by: {debt.recordedBy}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(debt.totalCreditAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                      {formatCurrency(debt.totalPaidAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                      {formatCurrency(debt.balanceOwed)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          debt.status === 'fully_paid'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : debt.status === 'partially_paid'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {debt.status === 'fully_paid' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        <span className="capitalize">{debt.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {debt.status !== 'fully_paid' && canManage && (
                          <button
                            onClick={() => {
                              setPayingDebt(debt);
                              setPayAmount(debt.balanceOwed);
                            }}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Record Payment
                          </button>
                        )}
                        <button
                          onClick={() => setHistoryDebt(debt)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs cursor-pointer flex items-center gap-1"
                          title="Payment History & Timestamps"
                        >
                          <History className="w-3.5 h-3.5 text-slate-500" /> History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record New Credit / Debt Modal */}
      <Modal
        isOpen={isNewDebtModalOpen}
        onClose={() => setIsNewDebtModalOpen(false)}
        title="Record New Customer Credit / Debt"
        subtitle="Log products taken on credit with debtor details, date and time"
        maxWidth="lg"
      >
        <form onSubmit={handleAddDebtSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Debtor / Customer Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Alhaji Ibrahim Karkasara"
                value={debtorName}
                onChange={(e) => setDebtorName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g., +234 803 111 2222"
                value={debtorPhone}
                onChange={(e) => setDebtorPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Debtor Address / Shop Location
            </label>
            <input
              type="text"
              placeholder="e.g., Shop 12, Lugbe Phase 4 Market, Abuja"
              value={debtorAddress}
              onChange={(e) => setDebtorAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Water Products Collected on Credit
            </label>
            <input
              type="text"
              required
              placeholder="e.g., 200 Bags Sachet Water + 20 Packs 75cl Bottles"
              value={itemsDescription}
              onChange={(e) => setItemsDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Credit Amount (₦)
            </label>
            <input
              type="number"
              min="100"
              required
              value={totalCreditAmount}
              onChange={(e) => setTotalCreditAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-rose-600 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Credit Date
              </label>
              <input
                type="date"
                required
                value={creditDate}
                onChange={(e) => setCreditDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Credit Time
              </label>
              <input
                type="time"
                required
                value={creditTime}
                onChange={(e) => setCreditTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Terms & Additional Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Promised to settle by Friday 5:00 PM..."
              value={creditNotes}
              onChange={(e) => setCreditNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewDebtModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Save Credit Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      {payingDebt && (
        <Modal
          isOpen={!!payingDebt}
          onClose={() => setPayingDebt(null)}
          title={`Record Debt Payment for ${payingDebt.debtorName}`}
          subtitle={`Current Remaining Balance: ${formatCurrency(payingDebt.balanceOwed)}`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
            
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs flex justify-between items-center">
              <div>
                <p className="font-bold text-rose-900">Credit Items: {payingDebt.itemsDescription}</p>
                <p className="text-rose-700">Taken on: {payingDebt.creditDate}</p>
              </div>
              <span className="text-lg font-bold text-rose-950">{formatCurrency(payingDebt.balanceOwed)}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount Paid Now (₦)
              </label>
              <input
                type="number"
                min="1"
                max={payingDebt.balanceOwed}
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              >
                <option value="cash">Cash Payment</option>
                <option value="bank_transfer">Bank Instant Transfer</option>
                <option value="pos">POS Terminal</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Time
                </label>
                <input
                  type="time"
                  required
                  value={payTime}
                  onChange={(e) => setPayTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-emerald-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Receipt Notes / Reference
              </label>
              <input
                type="text"
                placeholder="e.g. Received cash at main manager office by 2:15 PM"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayingDebt(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Confirm Payment Receipt
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* History Modal */}
      {historyDebt && (
        <Modal
          isOpen={!!historyDebt}
          onClose={() => setHistoryDebt(null)}
          title={`Payment Logs for ${historyDebt.debtorName}`}
          subtitle={`Credit Date: ${historyDebt.creditDate} • Total Credit: ${formatCurrency(historyDebt.totalCreditAmount)}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">Remaining Balance: {formatCurrency(historyDebt.balanceOwed)}</p>
                <p className="text-slate-500">Status: <span className="capitalize font-bold text-slate-800">{historyDebt.status.replace('_', ' ')}</span></p>
              </div>
              <span className="text-emerald-700 font-bold">Total Paid: {formatCurrency(historyDebt.totalPaidAmount)}</span>
            </div>

            <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Payment Installment Logs:</p>

            {historyDebt.payments.length === 0 ? (
              <p className="text-slate-400 italic text-center py-4">No payments recorded yet for this credit record.</p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {historyDebt.payments.map((p) => (
                  <div key={p.id} className="p-3 bg-white flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{formatCurrency(p.amount)} <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase font-bold">{p.paymentMethod}</span></p>
                      <p className="text-[11px] text-slate-500">Paid on Date & Time: <span className="font-bold text-slate-800">{p.paidDate}</span></p>
                      {p.notes && <p className="text-[10px] text-slate-400 italic">{p.notes}</p>}
                    </div>
                    <span className="text-[10px] text-slate-400">Recorded by {p.recordedBy}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setHistoryDebt(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs cursor-pointer"
              >
                Close Logs
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
