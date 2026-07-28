import React from 'react';
import { useApp } from '../../context/AppContext';
import { TabType } from '../Sidebar';
import {
  Factory,
  Boxes,
  ShoppingCart,
  Truck,
  AlertTriangle,
  TrendingUp,
  Activity,
  Plus,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Droplets,
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardProps {
  setActiveTab: (tab: TabType) => void;
  onOpenRecordProduction: () => void;
  onOpenRecordSale: () => void;
  onOpenAssignDelivery: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  onOpenRecordProduction,
  onOpenRecordSale,
  onOpenAssignDelivery,
}) => {
  const {
    currentUser,
    productionRecords,
    inventory,
    sales,
    deliveries,
    auditLogs,
    formatCurrency,
  } = useApp();

  const todayStr = new Date().toISOString().substring(0, 10);

  // Calculated Metrics
  const todayProductionRecords = productionRecords.filter(
    (r) => r.productionDate === todayStr && r.status === 'approved'
  );
  const totalBagsProducedToday = todayProductionRecords.reduce((acc, r) => acc + r.bagsProduced, 0);

  const totalBagsInStock = inventory.reduce((acc, item) => acc + item.totalInStock, 0);
  const totalBagsSold = inventory.reduce((acc, item) => acc + item.totalSold, 0);
  const totalBagsDelivered = inventory.reduce((acc, item) => acc + item.totalDelivered, 0);
  const totalDamagedBags = inventory.reduce((acc, item) => acc + item.totalDamaged, 0);

  const todaySalesRecords = sales.filter((s) => s.date.startsWith(todayStr));
  const todaySalesCount = todaySalesRecords.length;
  const todayRevenue = todaySalesRecords.reduce((acc, s) => acc + s.totalAmount, 0);

  const pendingProductionApprovals = productionRecords.filter((r) => r.status === 'pending_approval');
  const pendingDeliveries = deliveries.filter((d) => d.status === 'assigned' || d.status === 'in_transit');
  const completedDeliveries = deliveries.filter((d) => d.status === 'delivered');

  const lowStockItems = inventory.filter((item) => item.totalInStock <= item.minStockAlert);

  // Chart 1: Inventory Stock breakdown by Product
  const pieChartData = inventory.map((item) => ({
    name: item.productName.split('(')[0].trim(),
    value: item.totalInStock,
  }));

  const COLORS = ['#0284c7', '#0d9488', '#8b5cf6', '#f59e0b', '#ec4899'];

  // Chart 2: Daily Production & Sales Trend (Last 5 days sample)
  const trendData = [
    { day: 'Jul 24', Production: 1800, Sales: 1600, Damaged: 25 },
    { day: 'Jul 25', Production: 2100, Sales: 1950, Damaged: 30 },
    { day: 'Jul 26', Production: 1950, Sales: 1800, Damaged: 18 },
    { day: 'Jul 27', Production: 2400, Sales: 2200, Damaged: 40 },
    { day: 'Jul 28 (Today)', Production: totalBagsProducedToday || 1650, Sales: 535, Damaged: 23 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Welcome & Role Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Kanya Water Operations Dashboard
            </h1>
            <span className="bg-cyan-100 text-cyan-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-cyan-200">
              Live
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back, <span className="font-semibold text-slate-800">{currentUser.name}</span>. Here is the real-time operational overview for Kanya Table Water.
          </p>
        </div>

        {/* Quick Actions according to role */}
        <div className="flex flex-wrap items-center gap-2">
          {(currentUser.role === 'operator' || currentUser.role === 'manager' || currentUser.role === 'super_admin') && (
            <button
              onClick={onOpenRecordProduction}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Record Production
            </button>
          )}

          {(currentUser.role === 'manager' || currentUser.role === 'super_admin') && (
            <>
              <button
                onClick={onOpenRecordSale}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" /> New Sale
              </button>
              <button
                onClick={onOpenAssignDelivery}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Truck className="w-4 h-4" /> Assign Delivery
              </button>
            </>
          )}

          {currentUser.role === 'customer' && (
            <button
              onClick={() => setActiveTab('customer_portal')}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" /> Place Water Order
            </button>
          )}
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-900 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-sm text-rose-950">
              Low Inventory Warning ({lowStockItems.length} Product Lines)
            </p>
            <p className="mt-0.5 text-rose-800">
              Stock for{' '}
              {lowStockItems.map((item) => `${item.productName} (${item.totalInStock} remaining)`).join(', ')}{' '}
              is running below minimum safety threshold.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-3 py-1 bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
          >
            View Inventory
          </button>
        </div>
      )}

      {/* Pending Approvals Warning for Managers */}
      {pendingProductionApprovals.length > 0 && (currentUser.role === 'manager' || currentUser.role === 'super_admin') && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-amber-900 shadow-xs">
          <div className="flex items-center gap-3 text-xs">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-sm text-amber-950">
                {pendingProductionApprovals.length} Pending Production Sign-offs
              </p>
              <p className="text-amber-800">Factory operators submitted production logs requiring manager sign-off.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('production')}
            className="px-3 py-1 bg-amber-600 text-white hover:bg-amber-700 text-xs font-semibold rounded-lg cursor-pointer shrink-0"
          >
            Review Batches
          </button>
        </div>
      )}

      {/* Main KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Production */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today's Production
            </span>
            <div className="p-2 bg-cyan-100 text-cyan-800 rounded-xl">
              <Factory className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {totalBagsProducedToday.toLocaleString()} <span className="text-xs font-normal text-slate-500">bags/packs</span>
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Approved Factory Batches
            </p>
          </div>
        </div>

        {/* Total Bags In Stock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Warehouse Stock
            </span>
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {totalBagsInStock.toLocaleString()} <span className="text-xs font-normal text-slate-500">available</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Across all 5 product lines
            </p>
          </div>
        </div>

        {/* Today's Sales & Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today's Revenue
            </span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-800">
              {formatCurrency(todayRevenue)}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {todaySalesCount} sales recorded today
            </p>
          </div>
        </div>

        {/* Completed Deliveries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Deliveries Done
            </span>
            <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {completedDeliveries.length} <span className="text-xs font-normal text-slate-500">dispatches</span>
            </div>
            <p className="text-xs text-cyan-600 font-medium mt-1">
              {pendingDeliveries.length} currently in transit
            </p>
          </div>
        </div>

      </div>

      {/* Secondary Metrics Bar: Total Produced, Total Sold, Total Delivered, Damaged */}
      <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl shadow-md grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-800">
        <div className="px-2 pt-2 md:pt-0">
          <p className="text-[11px] uppercase font-bold text-slate-400">Total Bags Produced</p>
          <p className="text-xl font-bold text-white mt-1">
            {inventory.reduce((a, b) => a + b.totalProduced, 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Cumulative lifetime</p>
        </div>
        <div className="px-2 pt-2 md:pt-0">
          <p className="text-[11px] uppercase font-bold text-slate-400">Total Bags Sold</p>
          <p className="text-xl font-bold text-cyan-400 mt-1">
            {totalBagsSold.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Stock automatically reduced</p>
        </div>
        <div className="px-2 pt-2 md:pt-0">
          <p className="text-[11px] uppercase font-bold text-slate-400">Total Bags Delivered</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">
            {totalBagsDelivered.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Verified customer sign-offs</p>
        </div>
        <div className="px-2 pt-2 md:pt-0">
          <p className="text-[11px] uppercase font-bold text-slate-400">Total Damaged / Rejected</p>
          <p className="text-xl font-bold text-rose-400 mt-1">
            {totalDamagedBags.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Factory & transit losses</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Production vs Sales Trend</h3>
              <p className="text-xs text-slate-500">Comparing volume produced vs sales dispatched (Bags/Packs)</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
              Last 5 Days
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Production" fill="#0284c7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Sales" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Damaged" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Breakdown Donut Chart (1 column) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Current Stock by Product</h3>
            <p className="text-xs text-slate-500">Distribution of available water bags in warehouse</p>
          </div>
          <div className="h-52 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 text-xs">
            {pieChartData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></span>
                  {item.name}
                </span>
                <span className="font-bold text-slate-900">{item.value} bags</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Activities Feed */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-600" />
            <h3 className="text-base font-bold text-slate-900">Recent Operational Activities</h3>
          </div>
          <span className="text-xs text-slate-400">Live audit log</span>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="py-3 flex items-start gap-3 text-xs">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 font-bold">
                {log.userName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{log.userName}</span>
                  <span className="text-[11px] text-slate-400">{log.timestamp}</span>
                </div>
                <p className="text-slate-600 mt-0.5">{log.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
