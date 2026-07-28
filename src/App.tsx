import React, { useState, useEffect } from 'react';
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
import { auth, onAuthStateChanged, FirebaseUser } from './lib/firebase';

const MainContent: React.FC = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Shared Modals state triggered from Dashboard or sub views
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Redirect unauthenticated users to the Home screen if attempting to access dashboard tabs
  useEffect(() => {
    if (!isAuthLoading && !authUser && activeTab !== 'home') {
      setActiveTab('home');
    }
  }, [authUser, activeTab, isAuthLoading]);

  // Tab change handler strictly enforcing auth gate
  const handleTabChange = (tab: TabType) => {
    if (!authUser && tab !== 'home') {
      setActiveTab('home');
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-cyan-200">
      
      {/* Top Navbar Header */}
      <Navbar onLoginSuccess={handleTabChange} />

      {/* Body Area with Sidebar and Main Tab Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 items-start">
        
        {/* Left Navigation Sidebar - Strictly gated behind Firebase auth check */}
        {authUser && <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />}

        {/* Main Content Workspace Panel */}
        <main className="flex-1 min-w-0">
          {(activeTab === 'home' || !authUser) && (
            <HomePageView onNavigateTab={handleTabChange} />
          )}

          {authUser && activeTab === 'dashboard' && (
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

          {authUser && activeTab === 'production' && (
            <ProductionList
              isModalOpen={isProductionModalOpen}
              setIsModalOpen={setIsProductionModalOpen}
            />
          )}

          {authUser && activeTab === 'operator_hub' && <OperatorHubView />}

          {authUser && activeTab === 'inventory' && <InventoryList />}

          {authUser && activeTab === 'sales' && (
            <SalesList
              isModalOpen={isSaleModalOpen}
              setIsModalOpen={setIsSaleModalOpen}
            />
          )}

          {authUser && activeTab === 'debts' && <DebtsView />}

          {authUser && activeTab === 'staff_advances' && <StaffAdvancesView />}

          {authUser && activeTab === 'deliveries' && (
            <DeliveryList
              isModalOpen={isDeliveryModalOpen}
              setIsModalOpen={setIsDeliveryModalOpen}
            />
          )}

          {authUser && activeTab === 'messaging' && <MessagingView />}

          {authUser && activeTab === 'customer_portal' && <CustomerPortal />}

          {authUser && activeTab === 'users' && <UserManagement />}

          {authUser && activeTab === 'reports' && <ReportsView />}

          {authUser && activeTab === 'settings' && <SystemSettingsView />}
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
