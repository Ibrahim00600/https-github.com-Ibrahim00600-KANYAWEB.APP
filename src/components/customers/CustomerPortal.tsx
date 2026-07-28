import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, PaymentMethod, Sale, Delivery } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';
import { Modal } from '../common/Modal';
import {
  ShoppingBag,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Phone,
  User,
  Package,
  Droplets,
  CreditCard,
  Building,
  RotateCcw,
} from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const {
    currentUser,
    updateUser,
    products,
    inventory,
    sales,
    deliveries,
    placeCustomerOrder,
    formatCurrency,
  } = useApp();

  const [cart, setCart] = useState<{ [productId: string]: number }>({
    'prod-sachet-50cl': 50,
  });

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<Sale | null>(null);

  // Profile Form
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone);
  const [profileAddress, setProfileAddress] = useState(currentUser.address || '');
  const [profileState, setProfileState] = useState(currentUser.state || 'Abuja FCT');

  // Checkout Form
  const [checkoutName, setCheckoutName] = useState(currentUser.name);
  const [checkoutPhone, setCheckoutPhone] = useState(currentUser.phone);
  const [checkoutAddress, setCheckoutAddress] = useState(currentUser.address || 'Abuja, Lugbe Light Gold Phase 4');
  const [checkoutState, setCheckoutState] = useState(currentUser.state || 'Abuja FCT');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [orderNotes, setOrderNotes] = useState('');

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: next };
    });
  };

  const cartEntries = Object.entries(cart);
  const totalCartItemsCount = cartEntries.reduce((sum, [_, qty]) => sum + Number(qty), 0);

  const totalCartAmount = cartEntries.reduce((sum, [pId, qty]) => {
    const prod = products.find((p) => p.id === pId);
    return sum + (prod ? prod.unitPrice * Number(qty) : 0);
  }, 0);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartEntries.length === 0) return;

    const items = cartEntries.map(([productId, quantity]) => ({ productId, quantity }));

    placeCustomerOrder({
      customerName: checkoutName,
      phone: checkoutPhone,
      address: checkoutAddress,
      state: checkoutState,
      items,
      paymentMethod,
      notes: orderNotes,
    });

    setCart({});
    setIsCheckoutOpen(false);
    alert('🎉 Order Placed Successfully! Kanya Water logistics team will dispatch your water shipment shortly.');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.id, {
      name: profileName,
      phone: profilePhone,
      address: profileAddress,
      state: profileState,
    });
    setIsProfileOpen(false);
  };

  // Customer's orders
  const customerSales = sales.filter((s) => s.customerId === currentUser.id || s.customerName.includes(currentUser.name));
  const activeDelivery = deliveries.find((d) => d.customerName.includes(currentUser.name) && d.status !== 'delivered');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-blue-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-semibold mb-2">
            <Droplets className="w-3.5 h-3.5" /> Official Kanya Water Customer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Order Pure, Hygienic Kanya Water Online 💦
          </h1>
          <p className="text-cyan-100 text-xs sm:text-sm mt-1 max-w-xl">
            Factory-fresh sachet water bags, premium 75cl bottle packs, and 19L dispenser refills delivered straight to your home or shop.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <User className="w-4 h-4 text-cyan-400" /> Edit Profile
          </button>
          
          {totalCartItemsCount > 0 && (
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer animate-pulse"
            >
              <ShoppingCart className="w-4 h-4" /> Checkout ({totalCartItemsCount} bags)
            </button>
          )}
        </div>
      </div>

      {/* Live Active Order Tracking Banner */}
      {activeDelivery && (
        <div className="bg-white p-6 rounded-2xl border border-cyan-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-600 tracking-wider">
                Live Shipment Tracking
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Waybill #{activeDelivery.trackingNo}
              </h3>
            </div>
            <span className="px-3 py-1 bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold rounded-full capitalize">
              {activeDelivery.status.replace('_', ' ')}
            </span>
          </div>

          {/* Visual Step Tracker */}
          <div className="grid grid-cols-4 gap-2 my-6 text-center text-xs">
            {[
              { label: 'Order Received', done: true },
              { label: 'Loaded on Vehicle', done: activeDelivery.status !== 'assigned' },
              { label: 'In Transit', done: activeDelivery.status === 'in_transit' || activeDelivery.status === 'delivered' },
              { label: 'Delivered', done: activeDelivery.status === 'delivered' },
            ].map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${
                    step.done ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <p className={`text-[11px] font-semibold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Vehicle & Driver</span>
              <span className="font-bold text-slate-900">{activeDelivery.driverName} ({activeDelivery.vehicleNo})</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Driver Phone</span>
              <span className="font-bold text-cyan-800">📞 {activeDelivery.driverPhone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Delivery Address</span>
              <span className="font-medium text-slate-700">{activeDelivery.deliveryAddress}</span>
            </div>
          </div>
        </div>
      )}

      {/* Water Products Storefront Catalog */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-cyan-600" /> Kanya Water Product Catalog
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const inv = inventory.find((i) => i.productId === product.id);
            const qtyInCart = cart[product.id] || 0;
            const inStock = inv ? inv.totalInStock > 0 : true;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-cyan-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Product Image */}
                  <div className="relative h-40 bg-slate-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full border border-slate-700">
                      {formatCurrency(product.unitPrice)}
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{product.name}</h3>
                    <p className="text-xs text-cyan-700 font-medium mt-0.5">{product.unitDescription}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Certified pure water under NAFDAC regulations. Free doorstep delivery for bulk orders.
                    </p>
                  </div>
                </div>

                {/* Add to Cart Actions */}
                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    {qtyInCart > 0 ? (
                      <div className="flex items-center gap-3 bg-cyan-50 p-1.5 rounded-xl border border-cyan-200 w-full justify-between">
                        <button
                          onClick={() => handleUpdateQuantity(product.id, -10)}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-cyan-950">
                          {qtyInCart} bags in order
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(product.id, 10)}
                          className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold hover:bg-cyan-700 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpdateQuantity(product.id, 50)}
                        className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add 50 Bags to Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Order History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">My Order History</h3>
        
        {customerSales.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">No previous water orders found.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {customerSales.map((sale) => (
              <div key={sale.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 font-mono">{sale.invoiceNo}</p>
                  <p className="text-slate-500 text-[11px]">{sale.date} • {sale.totalBags} bags/packs</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-cyan-800 text-sm">{formatCurrency(sale.totalAmount)}</p>
                  <button
                    onClick={() => setSelectedOrderReceipt(sale)}
                    className="text-xs text-blue-600 hover:underline mt-0.5 inline-block cursor-pointer font-medium"
                  >
                    View Invoice Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Checkout Kanya Water Order"
        subtitle="Confirm delivery location & payment method in Nigeria"
        maxWidth="lg"
      >
        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
          
          {/* Itemized Order Summary */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-900 block uppercase text-[10px]">Order Items</span>
            {cartEntries.map(([pId, qty]) => {
              const prod = products.find((p) => p.id === pId);
              return (
                <div key={pId} className="flex justify-between font-medium text-slate-800">
                  <span>{prod?.name} ({qty} bags)</span>
                  <span className="font-bold">{formatCurrency((prod?.unitPrice || 0) * Number(qty))}</span>
                </div>
              );
            })}
            <div className="border-t border-slate-300 pt-2 flex justify-between font-bold text-sm text-cyan-900">
              <span>Total Payable:</span>
              <span>{formatCurrency(totalCartAmount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Shop Name</label>
              <input
                type="text"
                required
                value={checkoutName}
                onChange={(e) => setCheckoutName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={checkoutPhone}
                onChange={(e) => setCheckoutPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Address</label>
            <input
              type="text"
              required
              value={checkoutAddress}
              onChange={(e) => setCheckoutAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
            >
              <option value="bank_transfer">First Bank Transfer (Instant)</option>
              <option value="cash">Pay Cash on Doorstep Delivery</option>
              <option value="pos">Pay via Driver POS Terminal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Order / Delivery Instructions</label>
            <textarea
              rows={2}
              placeholder="e.g. Call before delivery, deliver behind the main plaza..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Place Order Now
            </button>
          </div>

        </form>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="Update Profile Information"
        maxWidth="md"
      >
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              required
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
            <input
              type="text"
              value={profileAddress}
              onChange={(e) => setProfileAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsProfileOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Receipt Modal */}
      {selectedOrderReceipt && (
        <ReceiptModal
          isOpen={!!selectedOrderReceipt}
          onClose={() => setSelectedOrderReceipt(null)}
          sale={selectedOrderReceipt}
        />
      )}

    </div>
  );
};
