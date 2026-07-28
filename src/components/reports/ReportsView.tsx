import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Printer,
  Download,
  Calendar,
  TrendingUp,
  Factory,
  Boxes,
  ShoppingCart,
  Truck,
  Award,
  DollarSign,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export const ReportsView: React.FC = () => {
  const {
    productionRecords,
    inventory,
    sales,
    deliveries,
    users,
    formatCurrency,
    settings,
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<
    'production' | 'sales' | 'inventory' | 'deliveries' | 'drivers' | 'revenue'
  >('production');

  const [dateFilter, setDateFilter] = useState('2026-07-28');

  // Calculations for Driver Performance
  const drivers = users.filter((u) => u.role === 'driver');
  const driverPerformanceData = drivers.map((driver) => {
    const driverDels = deliveries.filter((d) => d.driverId === driver.id);
    const completedCount = driverDels.filter((d) => d.status === 'delivered').length;
    const totalAssignedBags = driverDels.reduce((sum, d) => sum + d.totalBags, 0);
    const totalDamagedInTransit = driverDels.reduce((sum, d) => {
      return (
        sum +
        d.items.reduce((iSum, item) => iSum + (item.quantityReturnedOrDamaged || 0), 0)
      );
    }, 0);

    return {
      name: driver.name,
      totalDispatches: driverDels.length,
      completed: completedCount,
      totalBagsHandled: totalAssignedBags,
      damagedInTransit: totalDamagedInTransit,
      successRate: driverDels.length > 0 ? Math.round((completedCount / driverDels.length) * 100) : 100,
    };
  });

  // Calculations for Monthly Revenue
  const monthlyRevenueData = [
    { month: 'Feb 2026', Revenue: 2150000, BagsSold: 6100 },
    { month: 'Mar 2026', Revenue: 2480000, BagsSold: 7050 },
    { month: 'Apr 2026', Revenue: 2900000, BagsSold: 8200 },
    { month: 'May 2026', Revenue: 3100000, BagsSold: 8800 },
    { month: 'Jun 2026', Revenue: 3450000, BagsSold: 9800 },
    { month: 'Jul 2026 (MTD)', Revenue: 3890000, BagsSold: 11050 },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Company Analytics & Operational Reports
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate printable management reports for factory production, sales revenue, inventory audit, and driver fleet performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Report Summary
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        {[
          { id: 'production', label: 'Daily Production', icon: Factory },
          { id: 'sales', label: 'Daily Sales', icon: ShoppingCart },
          { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
          { id: 'deliveries', label: 'Delivery Dispatches', icon: Truck },
          { id: 'drivers', label: 'Driver Performance', icon: Award },
          { id: 'revenue', label: 'Monthly Revenue', icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-700 text-white shadow-md shadow-cyan-700/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Report Content Container */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6" id="printable-report">
        
        {/* Printable Header Branding */}
        <div className="pb-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
              KANYA TABLE WATER NIGERIA • OFFICIAL REPORT
            </h2>
            <p className="text-xs text-slate-500">
              Report Category: <span className="font-bold text-cyan-800 uppercase">{activeReportTab.replace('_', ' ')} REPORT</span> • Date: {dateFilter}
            </p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>{settings.companyName}</p>
            <p>{settings.nafdacNo}</p>
          </div>
        </div>

        {/* TAB 1: PRODUCTION REPORT */}
        {activeReportTab === 'production' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl">
                <p className="text-xs text-cyan-800 font-medium">Total Batches Produced</p>
                <p className="text-2xl font-bold text-cyan-950 mt-1">{productionRecords.length}</p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <p className="text-xs text-emerald-800 font-medium">Total Bags Transferred to Stock</p>
                <p className="text-2xl font-bold text-emerald-950 mt-1">
                  {productionRecords
                    .reduce((sum, r) => sum + r.bagsTransferredToWarehouse, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                <p className="text-xs text-rose-800 font-medium">Total Factory Damaged Bags</p>
                <p className="text-2xl font-bold text-rose-950 mt-1">
                  {productionRecords.reduce((sum, r) => sum + r.bagsDamaged, 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-600">
                  <tr>
                    <th className="p-3">Batch Number</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Product</th>
                    <th className="p-3 text-center">Produced</th>
                    <th className="p-3 text-center">Damaged</th>
                    <th className="p-3 text-center">Transferred</th>
                    <th className="p-3">Operator</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productionRecords.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3 font-mono font-bold text-slate-900">{r.batchNumber}</td>
                      <td className="p-3">{r.productionDate}</td>
                      <td className="p-3 font-medium">{r.productName}</td>
                      <td className="p-3 text-center font-bold">{r.bagsProduced}</td>
                      <td className="p-3 text-center text-rose-600 font-semibold">{r.bagsDamaged}</td>
                      <td className="p-3 text-center text-emerald-700 font-bold">
                        {r.bagsTransferredToWarehouse}
                      </td>
                      <td className="p-3">{r.operatorName}</td>
                      <td className="p-3 font-semibold capitalize">{r.status.replace('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SALES REPORT */}
        {activeReportTab === 'sales' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <p className="text-xs text-emerald-800 font-medium">Total Sales Revenue</p>
                <p className="text-2xl font-bold text-emerald-950 mt-1">
                  {formatCurrency(sales.reduce((sum, s) => sum + s.totalAmount, 0))}
                </p>
              </div>
              <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl">
                <p className="text-xs text-cyan-800 font-medium">Total Bags/Packs Sold</p>
                <p className="text-2xl font-bold text-cyan-950 mt-1">
                  {sales.reduce((sum, s) => sum + s.totalBags, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                <p className="text-xs text-purple-800 font-medium">Invoices Issued</p>
                <p className="text-2xl font-bold text-purple-950 mt-1">{sales.length}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-600">
                  <tr>
                    <th className="p-3">Invoice #</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3 text-center">Total Bags</th>
                    <th className="p-3 text-right">Amount (₦)</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td className="p-3 font-mono font-bold text-slate-900">{s.invoiceNo}</td>
                      <td className="p-3">{s.date}</td>
                      <td className="p-3 font-medium">{s.customerName}</td>
                      <td className="p-3 text-center font-bold">{s.totalBags}</td>
                      <td className="p-3 text-right font-bold text-emerald-800">
                        {formatCurrency(s.totalAmount)}
                      </td>
                      <td className="p-3 capitalize font-semibold">{s.paymentStatus} ({s.paymentMethod.replace('_', ' ')})</td>
                      <td className="p-3">{s.salesOfficerName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY REPORT */}
        {activeReportTab === 'inventory' && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-600">
                  <tr>
                    <th className="p-3">Water Product Line</th>
                    <th className="p-3 text-center">Unit</th>
                    <th className="p-3 text-center">Warehouse Stock</th>
                    <th className="p-3 text-center">Total Produced</th>
                    <th className="p-3 text-center">Total Sold</th>
                    <th className="p-3 text-center">Total Delivered</th>
                    <th className="p-3 text-center">Total Damaged</th>
                    <th className="p-3 text-right">Unit Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.map((inv) => (
                    <tr key={inv.productId}>
                      <td className="p-3 font-bold text-slate-900">{inv.productName}</td>
                      <td className="p-3 text-center text-slate-500">{inv.unitDescription}</td>
                      <td className="p-3 text-center font-bold text-cyan-800 bg-cyan-50">
                        {inv.totalInStock.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">{inv.totalProduced.toLocaleString()}</td>
                      <td className="p-3 text-center">{inv.totalSold.toLocaleString()}</td>
                      <td className="p-3 text-center">{inv.totalDelivered.toLocaleString()}</td>
                      <td className="p-3 text-center text-rose-600 font-bold">
                        {inv.totalDamaged.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-bold">
                        {formatCurrency(
                          sales.find((s) => s.items.some((i) => i.productId === inv.productId))
                            ?.items[0]?.unitPrice || 350
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DELIVERIES REPORT */}
        {activeReportTab === 'deliveries' && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-600">
                  <tr>
                    <th className="p-3">Waybill #</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Driver</th>
                    <th className="p-3 text-center">Total Bags</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Assigned Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deliveries.map((d) => (
                    <tr key={d.id}>
                      <td className="p-3 font-mono font-bold text-slate-900">{d.trackingNo}</td>
                      <td className="p-3 font-medium">{d.customerName}</td>
                      <td className="p-3">{d.driverName} ({d.vehicleNo})</td>
                      <td className="p-3 text-center font-bold">{d.totalBags}</td>
                      <td className="p-3 font-bold capitalize">{d.status.replace('_', ' ')}</td>
                      <td className="p-3">{d.assignedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: DRIVER PERFORMANCE REPORT */}
        {activeReportTab === 'drivers' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900">Driver Fleet Efficiency Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {driverPerformanceData.map((d, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{d.name}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                      {d.successRate}% Success
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-600 pt-2 border-t border-slate-200">
                    <p className="flex justify-between">
                      <span>Total Dispatches:</span>
                      <span className="font-bold text-slate-900">{d.totalDispatches}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Completed Deliveries:</span>
                      <span className="font-bold text-emerald-700">{d.completed}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Total Bags Handled:</span>
                      <span className="font-bold text-slate-900">{d.totalBagsHandled}</span>
                    </p>
                    <p className="flex justify-between text-rose-600">
                      <span>Transit Losses / Punctures:</span>
                      <span className="font-bold">-{d.damagedInTransit} bags</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: MONTHLY REVENUE */}
        {activeReportTab === 'revenue' && (
          <div className="space-y-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Revenue" stroke="#0284c7" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-600">
                  <tr>
                    <th className="p-3">Month</th>
                    <th className="p-3 text-center">Bags Sold</th>
                    <th className="p-3 text-right">Revenue (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyRevenueData.map((m, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-bold text-slate-900">{m.month}</td>
                      <td className="p-3 text-center font-medium">{m.BagsSold.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-emerald-800">
                        {formatCurrency(m.Revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
