import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryItem, Product } from '../../types';
import { Modal } from '../common/Modal';
import {
  Boxes,
  AlertTriangle,
  TrendingUp,
  Search,
  Edit2,
  CheckCircle2,
  PackageCheck,
  Truck,
  XCircle,
  Plus,
} from 'lucide-react';

export const InventoryList: React.FC = () => {
  const { currentUser, products, inventory, updateProduct, formatCurrency } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [unitPriceInput, setUnitPriceInput] = useState<number>(0);
  const [minStockInput, setMinStockInput] = useState<number>(0);

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setUnitPriceInput(product.unitPrice);
    setMinStockInput(product.minStockAlert);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        unitPrice: Number(unitPriceInput),
        minStockAlert: Number(minStockInput),
      });
      setEditingProduct(null);
    }
  };

  const filteredInventory = inventory.filter((item) =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEdit = currentUser.role === 'super_admin' || currentUser.role === 'manager';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Warehouse Inventory & Stock Control
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock balance calculated automatically from production logs, completed sales, and driver delivery returns.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search product inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          const isLowStock = item.totalInStock <= item.minStockAlert;
          const stockPercentage = Math.min(
            100,
            Math.round((item.totalInStock / (item.minStockAlert * 3)) * 100)
          );

          return (
            <div
              key={item.productId}
              className={`bg-white rounded-2xl border overflow-hidden shadow-xs transition-all ${
                isLowStock ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              {/* Image & Title Header */}
              <div className="relative h-32 bg-slate-100 overflow-hidden">
                <img
                  src={product?.imageUrl}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-white font-bold text-sm leading-snug">{item.productName}</h3>
                    <p className="text-cyan-200 text-xs">{item.unitDescription}</p>
                  </div>
                </div>

                {isLowStock ? (
                  <span className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> Low Stock
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    In Stock
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                
                {/* Available Stock Display */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Available In Warehouse
                    </span>
                    <p className="text-2xl font-bold text-slate-900">
                      {item.totalInStock.toLocaleString()}{' '}
                      <span className="text-xs font-normal text-slate-500">bags/packs</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Unit Price</span>
                    <p className="text-lg font-bold text-cyan-800">
                      {product ? formatCurrency(product.unitPrice) : '₦0'}
                    </p>
                  </div>
                </div>

                {/* Stock Level Progress */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Stock Level</span>
                    <span>Min Threshold: {item.minStockAlert} bags</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isLowStock ? 'bg-rose-500' : 'bg-cyan-600'
                      }`}
                      style={{ width: `${stockPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Detailed Breakdown Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-medium">
                      Total Produced
                    </span>
                    <span className="font-bold text-slate-800">{item.totalProduced.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-medium">
                      Total Sold
                    </span>
                    <span className="font-bold text-cyan-700">{item.totalSold.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-medium">
                      Total Delivered
                    </span>
                    <span className="font-bold text-emerald-700">{item.totalDelivered.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-medium">
                      Total Damaged
                    </span>
                    <span className="font-bold text-rose-600">-{item.totalDamaged.toLocaleString()}</span>
                  </div>
                </div>

                {/* Card Action Footer */}
                {canEdit && product && (
                  <button
                    onClick={() => handleEditClick(product)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Configure Price & Alert Limits
                  </button>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Inventory Movement Summary Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Unit Description</th>
                <th className="py-3 px-4 text-center">In Stock</th>
                <th className="py-3 px-4 text-center">Produced</th>
                <th className="py-3 px-4 text-center">Sold</th>
                <th className="py-3 px-4 text-center">Delivered</th>
                <th className="py-3 px-4 text-center">Damaged</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                return (
                  <tr key={item.productId} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.productName}</td>
                    <td className="py-3 px-4 text-center text-slate-500">{item.unitDescription}</td>
                    <td className="py-3 px-4 text-center font-bold text-cyan-800 bg-cyan-50/50">
                      {item.totalInStock.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">{item.totalProduced.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">{item.totalSold.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">{item.totalDelivered.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center font-semibold text-rose-600">
                      {item.totalDamaged.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {product ? formatCurrency(product.unitPrice) : '₦0'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <Modal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          title={`Configure ${editingProduct.name}`}
          subtitle="Update wholesale pricing and minimum inventory alert levels"
          maxWidth="md"
        >
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Selling Price (₦ Naira)
              </label>
              <input
                type="number"
                min="0"
                required
                value={unitPriceInput}
                onChange={(e) => setUnitPriceInput(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum Stock Alert Threshold (Bags/Packs)
              </label>
              <input
                type="number"
                min="1"
                required
                value={minStockInput}
                onChange={(e) => setMinStockInput(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                The dashboard will trigger a low stock alert when warehouse inventory falls below this quantity.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
