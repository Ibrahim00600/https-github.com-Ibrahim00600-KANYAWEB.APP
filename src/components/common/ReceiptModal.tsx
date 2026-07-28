import React, { useRef } from 'react';
import { Modal } from './Modal';
import { Sale, Delivery } from '../../types';
import { useApp } from '../../context/AppContext';
import { Printer, Download, CheckCircle, Droplets, MapPin, Phone, FileText } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale?: Sale;
  delivery?: Delivery;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  sale,
  delivery,
}) => {
  const { settings, formatCurrency } = useApp();
  const printRef = useRef<HTMLDivElement>(null);

  if (!sale && !delivery) return null;

  const handlePrint = () => {
    window.print();
  };

  const title = sale ? `Invoice #${sale.invoiceNo}` : `Waybill #${delivery?.trackingNo}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="2xl">
      <div className="space-y-6">
        {/* Printable Area */}
        <div
          ref={printRef}
          className="p-6 border border-slate-200 rounded-xl bg-white shadow-xs text-slate-800 font-sans"
          id="printable-receipt"
        >
          {/* Header Branding */}
          <div className="flex items-start justify-between pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-md">
                <Droplets className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {settings.companyName}
                </h2>
                <p className="text-xs text-cyan-700 font-medium">{settings.tagline}</p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> {settings.address}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> {settings.phone}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-semibold rounded-md">
                {sale ? 'OFFICIAL INVOICE' : 'DELIVERY WAYBILL'}
              </span>
              <p className="text-sm font-bold text-slate-900 mt-2">
                {sale ? sale.invoiceNo : delivery?.trackingNo}
              </p>
              <p className="text-xs text-slate-500">{sale ? sale.date : delivery?.assignedDate}</p>
              <p className="text-[11px] text-slate-400 mt-1">{settings.nafdacNo}</p>
            </div>
          </div>

          {/* Customer & Info Grid */}
          <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-100">
            <div>
              <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                CUSTOMER DETAILS
              </p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {sale ? sale.customerName : delivery?.customerName}
              </p>
              <p className="text-slate-600">{sale ? sale.customerPhone : delivery?.customerPhone}</p>
              <p className="text-slate-600">{sale ? sale.customerAddress : delivery?.deliveryAddress}</p>
              <p className="text-slate-600 font-medium">{sale ? sale.state : delivery?.state}</p>
            </div>

            <div className="text-right">
              {sale ? (
                <>
                  <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    PAYMENT INFORMATION
                  </p>
                  <p className="font-medium text-slate-800 mt-0.5">
                    Method:{' '}
                    <span className="capitalize font-semibold text-slate-900">
                      {sale.paymentMethod.replace('_', ' ')}
                    </span>
                  </p>
                  <p className="mt-1">
                    Status:{' '}
                    <span
                      className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded ${
                        sale.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sale.paymentStatus === 'partially_paid'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {sale.paymentStatus.toUpperCase().replace('_', ' ')}
                    </span>
                  </p>
                  <p className="text-slate-500 text-[11px] mt-1">Issued By: {sale.salesOfficerName}</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    DRIVER & VEHICLE
                  </p>
                  <p className="font-bold text-slate-900 mt-0.5">{delivery?.driverName}</p>
                  <p className="text-slate-600">{delivery?.driverPhone}</p>
                  <p className="text-slate-600 font-medium">{delivery?.vehicleNo}</p>
                  <p className="mt-1 text-slate-500 text-[11px]">
                    Delivery Status: <span className="font-bold uppercase text-slate-800">{delivery?.status.replace('_', ' ')}</span>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Table Items */}
          <div className="my-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                  <th className="py-2 px-3 rounded-l">Item Description</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  {sale && <th className="py-2 px-3 text-right">Unit Price</th>}
                  {sale && <th className="py-2 px-3 text-right rounded-r">Total</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale
                  ? sale.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium text-slate-900">{item.productName}</td>
                        <td className="py-2 px-3 text-center font-bold">{item.quantity}</td>
                        <td className="py-2 px-3 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          {formatCurrency(item.totalPrice)}
                        </td>
                      </tr>
                    ))
                  : delivery?.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium text-slate-900">{item.productName}</td>
                        <td className="py-2 px-3 text-center font-bold">{item.quantityAssigned} Bags/Packs</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Notes */}
          <div className="pt-4 border-t border-slate-200 flex items-end justify-between">
            <div className="text-xs text-slate-500 max-w-xs">
              {(sale?.notes || delivery?.driverNotes) && (
                <p className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700 text-[11px]">
                  <span className="font-semibold block text-slate-900">Notes:</span>
                  {sale?.notes || delivery?.driverNotes}
                </p>
              )}
              <p className="mt-2 text-[10px] text-slate-400">
                Thank you for choosing Kanya Table Water. Pure, Hygienic & Healthy.
              </p>
            </div>

            {sale && (
              <div className="text-right space-y-1">
                <div className="flex justify-between gap-6 text-xs text-slate-600">
                  <span>Total Items:</span>
                  <span className="font-semibold">{sale.totalBags} bags/packs</span>
                </div>
                <div className="flex justify-between gap-6 text-base font-bold text-slate-900 border-t border-slate-200 pt-1">
                  <span>Grand Total:</span>
                  <span className="text-cyan-800">{formatCurrency(sale.totalAmount)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Signatures */}
          <div className="mt-8 pt-6 border-t border-dashed border-slate-300 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
            <div>
              <div className="h-8 border-b border-slate-400 w-3/4 mx-auto mb-1 flex items-end justify-center font-mono text-[11px] italic text-slate-700">
                {sale ? sale.salesOfficerName : delivery?.driverName}
              </div>
              <p className="font-medium text-slate-700">Authorized Signature</p>
            </div>
            <div>
              <div className="h-8 border-b border-slate-400 w-3/4 mx-auto mb-1 flex items-end justify-center font-mono text-[11px] italic text-slate-700">
                {delivery?.customerSignature || 'Customer Representative'}
              </div>
              <p className="font-medium text-slate-700">Customer Receiver Signature</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-cyan-700 text-white hover:bg-cyan-800 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>
    </Modal>
  );
};
