import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Delivery, DeliveryStatus } from '../../types';
import { Modal } from '../common/Modal';
import { ReceiptModal } from '../common/ReceiptModal';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  Phone,
  Printer,
  PackageCheck,
  Edit2,
  FileCheck2,
} from 'lucide-react';

interface DeliveryListProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const DeliveryList: React.FC<DeliveryListProps> = ({ isModalOpen, setIsModalOpen }) => {
  const {
    currentUser,
    users,
    products,
    sales,
    deliveries,
    assignDelivery,
    updateDeliveryByDriver,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedWaybill, setSelectedWaybill] = useState<Delivery | null>(null);

  // Driver Update Modal State
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [driverStatusInput, setDriverStatusInput] = useState<DeliveryStatus>('in_transit');
  const [driverNotesInput, setDriverNotesInput] = useState('');
  const [customerSigInput, setCustomerSigInput] = useState('');

  // Item quantities tracking for driver modal
  const [driverItemUpdates, setDriverItemUpdates] = useState<
    { productId: string; quantityLoaded: number; quantityDelivered: number; quantityReturnedOrDamaged: number }[]
  >([]);

  // Assign Delivery Form State (for Manager/Admin)
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedState, setSelectedState] = useState('Kano State');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().substring(0, 10));
  const [departureTime, setDepartureTime] = useState(
    new Date().toTimeString().substring(0, 5) // e.g. "08:30"
  );
  const [assignItems, setAssignItems] = useState<{ productId: string; quantityAssigned: number }[]>([
    { productId: products[0]?.id || '', quantityAssigned: 100 },
  ]);
  const [assignNotes, setAssignNotes] = useState('');

  const driversList = users.filter((u) => u.role === 'driver' && u.active);

  const handleSelectSale = (saleId: string) => {
    setSelectedSaleId(saleId);
    const sale = sales.find((s) => s.id === saleId);
    if (sale) {
      setCustomerName(sale.customerName);
      setCustomerPhone(sale.customerPhone);
      setDeliveryAddress(sale.customerAddress);
      setSelectedState(sale.state);
      setAssignItems(
        sale.items.map((i) => ({ productId: i.productId, quantityAssigned: i.quantity }))
      );
    }
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !selectedDriverId) return;

    assignDelivery({
      saleId: selectedSaleId || undefined,
      customerName,
      customerPhone: customerPhone || '+234 800 000 0000',
      deliveryAddress: deliveryAddress || 'Sabon Gari Market, Kano',
      state: selectedState,
      driverId: selectedDriverId,
      departureDate,
      departureTime,
      items: assignItems,
      driverNotes: assignNotes,
    });

    setIsModalOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setAssignNotes('');
  };

  const handleOpenDriverModal = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setDriverStatusInput(delivery.status);
    setDriverNotesInput(delivery.driverNotes || '');
    setCustomerSigInput(delivery.customerSignature || '');
    setDriverItemUpdates(
      delivery.items.map((item) => ({
        productId: item.productId,
        quantityLoaded: item.quantityLoaded ?? item.quantityAssigned,
        quantityDelivered: item.quantityDelivered ?? item.quantityAssigned,
        quantityReturnedOrDamaged: item.quantityReturnedOrDamaged ?? 0,
      }))
    );
  };

  const handleDriverUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDelivery) {
      updateDeliveryByDriver(editingDelivery.id, {
        status: driverStatusInput,
        itemsUpdates: driverItemUpdates,
        driverNotes: driverNotesInput,
        customerSignature: customerSigInput,
      });
      setEditingDelivery(null);
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const isDriverView = currentUser.role === 'driver';
    const belongsToDriver = isDriverView ? d.driverId === currentUser.id : true;
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    const matchesSearch =
      d.trackingNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.driverName.toLowerCase().includes(searchTerm.toLowerCase());

    return belongsToDriver && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Logistics & Delivery Fleet
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Assign water shipments to drivers, record loaded quantities, and verify delivered water bags upon customer receipt.
          </p>
        </div>

        {(currentUser.role === 'manager' || currentUser.role === 'super_admin') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Assign New Delivery
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search tracking #, customer or driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Dispatches' },
            { id: 'assigned', label: 'Assigned' },
            { id: 'in_transit', label: 'In Transit' },
            { id: 'delivered', label: 'Delivered' },
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

      {/* Deliveries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tracking Waybill #</th>
                <th className="py-3.5 px-4">Customer & Destination</th>
                <th className="py-3.5 px-4">Assigned Driver & Vehicle</th>
                <th className="py-3.5 px-4 text-center">Assigned Bags</th>
                <th className="py-3.5 px-4 text-center">Delivered Bags</th>
                <th className="py-3.5 px-4 text-center">Transit Loss</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    No delivery dispatches found.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery) => {
                  const totalDeliveredCount = delivery.items.reduce(
                    (sum, item) => sum + (item.quantityDelivered ?? 0),
                    0
                  );
                  const totalDamagedCount = delivery.items.reduce(
                    (sum, item) => sum + (item.quantityReturnedOrDamaged ?? 0),
                    0
                  );

                  return (
                    <tr key={delivery.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        {delivery.trackingNo}
                        <p className="text-[10px] text-slate-400 font-normal">{delivery.assignedDate}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{delivery.customerName}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {delivery.deliveryAddress}, {delivery.state}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{delivery.driverName}</p>
                        <p className="text-[11px] text-blue-700 font-medium">{delivery.vehicleNo}</p>
                        {(delivery.departureDate || delivery.departureTime) && (
                          <p className="text-[10px] text-cyan-700 font-semibold flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> Carriage: {delivery.departureDate || ''} at {delivery.departureTime || 'N/A'}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                        {delivery.totalBags.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                        {delivery.status === 'delivered' || delivery.status === 'partially_delivered'
                          ? totalDeliveredCount.toLocaleString()
                          : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-rose-600">
                        {totalDamagedCount > 0 ? `-${totalDamagedCount}` : '0'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            delivery.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : delivery.status === 'in_transit' || delivery.status === 'loaded'
                              ? 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <span className="capitalize">{delivery.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDriverModal(delivery)}
                            className="px-2.5 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Log Progress
                          </button>
                          <button
                            onClick={() => setSelectedWaybill(delivery)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs cursor-pointer"
                            title="Print Waybill"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign New Delivery Modal (For Manager/Admin) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign Delivery to Driver"
        subtitle="Select customer invoice and assign to vehicle driver"
        maxWidth="xl"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Link Existing Customer Sale Invoice (Optional)
            </label>
            <select
              value={selectedSaleId}
              onChange={(e) => handleSelectSale(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Manual Entry / Custom Delivery --</option>
              {sales.map((s) => (
                <option key={s.id} value={s.id}>
                  Invoice #{s.invoiceNo} - {s.customerName} ({s.totalBags} bags)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Destination Address</label>
            <input
              type="text"
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Driver & Vehicle</label>
            <select
              required
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
            >
              <option value="">-- Choose Driver --</option>
              {driversList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.vehicleNo}) - 📞 {d.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Carriage / Departure Date
              </label>
              <input
                type="date"
                required
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Departure Time (Carrying Water)
              </label>
              <input
                type="time"
                required
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-cyan-800"
              />
            </div>
          </div>

          {/* Items Summary */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
            <span className="font-bold text-blue-900 block">Water Shipment Items:</span>
            {assignItems.map((item, idx) => {
              const prod = products.find((p) => p.id === item.productId);
              return (
                <div key={idx} className="flex justify-between text-blue-950 font-medium">
                  <span>{prod?.name}</span>
                  <span className="font-bold">{item.quantityAssigned} bags/packs</span>
                </div>
              );
            })}
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
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Dispatch Delivery
            </button>
          </div>

        </form>
      </Modal>

      {/* Driver Log Progress Modal */}
      {editingDelivery && (
        <Modal
          isOpen={!!editingDelivery}
          onClose={() => setEditingDelivery(null)}
          title={`Update Delivery Waybill #${editingDelivery.trackingNo}`}
          subtitle={`Driver: ${editingDelivery.driverName} • Vehicle: ${editingDelivery.vehicleNo}`}
          maxWidth="lg"
        >
          <form onSubmit={handleDriverUpdateSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Update Delivery Status
              </label>
              <select
                value={driverStatusInput}
                onChange={(e) => setDriverStatusInput(e.target.value as DeliveryStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
              >
                <option value="assigned">Assigned (Awaiting Vehicle Loading)</option>
                <option value="loaded">Loaded onto Vehicle</option>
                <option value="in_transit">In Transit (Dispatched on Road)</option>
                <option value="delivered">Delivered Successfully (Full Receipt)</option>
                <option value="partially_delivered">Partially Delivered (Transit Damage/Shortage)</option>
                <option value="failed">Failed / Returned</option>
              </select>
            </div>

            {/* Item quantities log by driver */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Record Water Bag Quantities
              </label>
              {driverItemUpdates.map((itemUpd, idx) => {
                const prod = products.find((p) => p.id === itemUpd.productId);
                return (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <p className="font-bold text-slate-900 text-xs">{prod?.name}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-500 block">Loaded on Vehicle</label>
                        <input
                          type="number"
                          value={itemUpd.quantityLoaded}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setDriverItemUpdates((prev) =>
                              prev.map((i, iIdx) => (iIdx === idx ? { ...i, quantityLoaded: val } : i))
                            );
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Delivered to Customer</label>
                        <input
                          type="number"
                          value={itemUpd.quantityDelivered}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setDriverItemUpdates((prev) =>
                              prev.map((i, iIdx) => (iIdx === idx ? { ...i, quantityDelivered: val } : i))
                            );
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold text-emerald-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Transit Damage / Return</label>
                        <input
                          type="number"
                          value={itemUpd.quantityReturnedOrDamaged}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setDriverItemUpdates((prev) =>
                              prev.map((i, iIdx) => (iIdx === idx ? { ...i, quantityReturnedOrDamaged: val } : i))
                            );
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold text-rose-600"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Driver Route / Delivery Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Traffic along Zoo road, offloaded at customer store..."
                value={driverNotesInput}
                onChange={(e) => setDriverNotesInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Signature / Received By Confirmation
              </label>
              <input
                type="text"
                placeholder="e.g., Fatima A. (Manager - Arewa Mart)"
                value={customerSigInput}
                onChange={(e) => setCustomerSigInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingDelivery(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Save Delivery Log
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* Waybill Modal */}
      {selectedWaybill && (
        <ReceiptModal
          isOpen={!!selectedWaybill}
          onClose={() => setSelectedWaybill(null)}
          delivery={selectedWaybill}
        />
      )}

    </div>
  );
};
