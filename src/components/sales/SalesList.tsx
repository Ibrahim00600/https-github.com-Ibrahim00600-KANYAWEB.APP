import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale, PaymentStatus, PaymentMethod } from '../../types';
import { Modal } from '../common/Modal';
import { ReceiptModal } from '../common/ReceiptModal';
import {
  ShoppingCart,
  Plus,
  Search,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  User,
  Trash2,
  FileText,
} from 'lucide-react';

interface SalesListProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const NIGERIAN_STATES = [
  'Abuja FCT',
  'Kano State',
  'Kaduna State',
  'Lagos State',
  'Rivers State',
  'Oyo State',
  'Enugu State',
  'Delta State',
  'Sokoto State',
  'Borno State',
  'Plateau State',
  'Katsina State',
  'Jigawa State',
  'Bauchi State',
];

export const SalesList: React.FC<SalesListProps> = ({ isModalOpen, setIsModalOpen }) => {
  const {
    currentUser,
    users,
    products,
    sales,
    addSale,
    formatCurrency,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);

  // Form State for New Sale
  const [customerType, setCustomerType] = useState<'existing' | 'walkin'>('walkin');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedState, setSelectedState] = useState('Abuja FCT');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [notes, setNotes] = useState('');

  // Cart items inside sale form
  const [cartItems, setCartItems] = useState<
    { productId: string; quantity: number; unitPrice: number }[]
  >([
    { productId: products[0]?.id || '', quantity: 100, unitPrice: products[0]?.unitPrice || 350 },
  ]);

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const found = users.find((u) => u.id === customerId);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
      setCustomerAddress(found.address || '');
      setSelectedState(found.state || 'Kano State');
    }
  };

  const handleAddCartRow = () => {
    setCartItems((prev) => [
      ...prev,
      { productId: products[0]?.id || '', quantity: 50, unitPrice: products[0]?.unitPrice || 350 },
    ]);
  };

  const handleRemoveCartRow = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const unitPrice = prod ? prod.unitPrice : 350;
    setCartItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, productId, unitPrice } : item))
    );
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, quantity) } : item))
    );
  };

  const totalSaleAmount = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );
  const totalBagsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || cartItems.length === 0) return;

    addSale({
      customerId: customerType === 'existing' ? selectedCustomerId : undefined,
      customerName,
      customerPhone: customerPhone || '+234 800 000 0000',
      customerAddress: customerAddress || 'Central Market, Kano',
      state: selectedState,
      items: cartItems,
      paymentStatus,
      paymentMethod,
      notes,
    });

    setIsModalOpen(false);
    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setNotes('');
  };

  const filteredSales = sales.filter((s) => {
    const matchesPayment = filterPayment === 'all' || s.paymentStatus === filterPayment;
    const matchesSearch =
      s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.salesOfficerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPayment && matchesSearch;
  });

  const existingCustomers = users.filter((u) => u.role === 'customer');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Sales & Distributor Orders
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Record customer orders, track payments in ₦ Naira, and automatically deduct sold quantities from main warehouse inventory.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Record New Sale
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search invoice # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Invoices' },
            { id: 'paid', label: 'Paid' },
            { id: 'partially_paid', label: 'Partially Paid' },
            { id: 'pending', label: 'Pending Payment' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterPayment(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                filterPayment === pill.id
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4 text-center">Bags</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Sales Officer</th>
                <th className="py-3.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                    No sales records found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {sale.invoiceNo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {sale.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{sale.customerName}</p>
                      <p className="text-[11px] text-slate-500">{sale.customerPhone} • {sale.state}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {sale.totalBags.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-800 text-sm">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          sale.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : sale.paymentStatus === 'partially_paid'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <span className="capitalize">{sale.paymentStatus.replace('_', ' ')}</span>
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5 capitalize">
                        {sale.paymentMethod.replace('_', ' ')}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {sale.salesOfficerName}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedSaleForReceipt(sale)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" /> Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record New Sale Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Water Sale"
        subtitle="Automatic warehouse stock deduction will trigger upon saving"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaleSubmit} className="space-y-4">
          
          {/* Customer Selection Tabs */}
          <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="custType"
                checked={customerType === 'walkin'}
                onChange={() => setCustomerType('walkin')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              Walk-in / New Customer
            </label>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="radio"
                name="custType"
                checked={customerType === 'existing'}
                onChange={() => setCustomerType('existing')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              Select Registered Customer/Distributor
            </label>
          </div>

          {customerType === 'existing' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Customer Account
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleSelectCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Choose Registered Customer --</option>
                {existingCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - {c.state}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Customer Details Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Arewa Mart / Alhaji Ibrahim"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                placeholder="+234 803 123 4567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              >
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery / Business Address</label>
            <input
              type="text"
              placeholder="e.g., Shop 12, Sabon Gari Market, Kano"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Cart Items Table */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Water Products & Quantities
              </label>
              <button
                type="button"
                onClick={handleAddCartRow}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Product Line
              </button>
            </div>

            {cartItems.map((cartRow, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex-1">
                  <select
                    value={cartRow.productId}
                    onChange={(e) => handleProductChange(idx, e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatCurrency(p.unitPrice)}/bag)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    required
                    value={cartRow.quantity}
                    onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-center"
                    placeholder="Qty"
                  />
                </div>

                <div className="w-28 text-right font-bold text-slate-900 text-xs">
                  {formatCurrency(cartRow.quantity * cartRow.unitPrice)}
                </div>

                {cartItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCartRow(idx)}
                    className="p-1 text-rose-500 hover:text-rose-700 rounded cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Payment & Totals Footer */}
          <div className="grid grid-cols-2 gap-4 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              >
                <option value="bank_transfer">Bank Transfer (Instant)</option>
                <option value="cash">Cash Payment</option>
                <option value="pos">POS Terminal</option>
                <option value="credit">Credit / Pay Later</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
              >
                <option value="paid">Paid Full</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="pending">Pending Payment</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div>
              <p className="text-xs text-slate-500">
                Total Bags: <span className="font-bold text-slate-900">{totalBagsCount} bags</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Grand Total Amount:</span>
              <p className="text-xl font-bold text-emerald-800">{formatCurrency(totalSaleAmount)}</p>
            </div>
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
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Confirm Sale & Deduct Inventory
            </button>
          </div>

        </form>
      </Modal>

      {/* Invoice Modal */}
      {selectedSaleForReceipt && (
        <ReceiptModal
          isOpen={!!selectedSaleForReceipt}
          onClose={() => setSelectedSaleForReceipt(null)}
          sale={selectedSaleForReceipt}
        />
      )}

    </div>
  );
};
