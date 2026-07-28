import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { HomePageView } from './components/home/HomePageView';
import { ProductionList } from './components/production/ProductionList';
import { OperatorHubView } from './components/operators/OperatorHubView';
import { InventoryList } from './components/inventory/InventoryList';
import { SalesList } from './components/sales/SalesList';
import { DebtsView } from './components/debts/DebtsView';
import { StaffAdvancesView } from './components/advances/StaffAdvancesView';
import { DeliveryList } from './components/deliveries/DeliveryList';
import { MessagingView } from './components/messaging/MessagingView';
import { CustomerPortal } from './components/customers/CustomerPortal';
import { UserManagement } from './components/users/UserManagement';
import { ReportsView } from './components/reports/ReportsView';
import { SystemSettingsView } from './components/settings/SystemSettingsView';

const MainContent: React.FC = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Shared Modals state triggered from Dashboard or sub views
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

  // If role is Customer and user clicks tabs, ensure seamless navigation
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-cyan-200">
      
      {/* Top Navbar Header */}
      <Navbar onLoginSuccess={handleTabChange} />

      {/* Body Area with Sidebar and Main Tab Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 items-start">
        
        {/* Left Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

        {/* Main Content Workspace Panel */}
        <main className="flex-1 min-w-0">
          {activeTab === 'home' && <HomePageView onNavigateTab={handleTabChange} />}

          {activeTab === 'dashboard' && (
            <Dashboard
              setActiveTab={handleTabChange}
              onOpenRecordProduction={() => {
                setActiveTab('production');
                setIsProductionModalOpen(true);
              }}
              onOpenRecordSale={() => {
                setActiveTab('sales');
                setIsSaleModalOpen(true);
              }}
              onOpenAssignDelivery={() => {
                setActiveTab('deliveries');
                setIsDeliveryModalOpen(true);
              }}
            />
          )}

          {activeTab === 'production' && (
            <ProductionList
              isModalOpen={isProductionModalOpen}
              setIsModalOpen={setIsProductionModalOpen}
            />
          )}

          {activeTab === 'operator_hub' && <OperatorHubView />}

          {activeTab === 'inventory' && <InventoryList />}

          {activeTab === 'sales' && (
            <SalesList
              isModalOpen={isSaleModalOpen}
              setIsModalOpen={setIsSaleModalOpen}
            />
          )}

          {activeTab === 'debts' && <DebtsView />}

          {activeTab === 'staff_advances' && <StaffAdvancesView />}

          {activeTab === 'deliveries' && (
            <DeliveryList
              isModalOpen={isDeliveryModalOpen}
              setIsModalOpen={setIsDeliveryModalOpen}
            />
          )}

          {activeTab === 'messaging' && <MessagingView />}

          {activeTab === 'customer_portal' && <CustomerPortal />}

          {activeTab === 'users' && <UserManagement />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'settings' && <SystemSettingsView />}
        </main>

      </div>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
