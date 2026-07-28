import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Product,
  ProductionRecord,
  InventoryItem,
  Sale,
  Delivery,
  DeliveryStatus,
  AuditLog,
  SystemSettings,
  PaymentMethod,
  CustomerDebt,
  DebtPayment,
  StaffAdvance,
  OperatorFundClaim,
  SystemMessage,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_PRODUCTION,
  INITIAL_INVENTORY,
  INITIAL_SALES,
  INITIAL_DELIVERIES,
  INITIAL_AUDIT_LOGS,
  DEFAULT_SYSTEM_SETTINGS,
  INITIAL_DEBTS,
  INITIAL_STAFF_ADVANCES,
  INITIAL_OPERATOR_CLAIMS,
  INITIAL_MESSAGES,
} from '../data/initialData';

interface AppContextType {
  currentUser: User;
  users: User[];
  products: Product[];
  productionRecords: ProductionRecord[];
  inventory: InventoryItem[];
  sales: Sale[];
  deliveries: Delivery[];
  debts: CustomerDebt[];
  staffAdvances: StaffAdvance[];
  operatorClaims: OperatorFundClaim[];
  messages: SystemMessage[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  
  // Actions
  setCurrentUserRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  
  // User Management
  createUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;
  
  // Production Management
  addProductionRecord: (record: {
    productId: string;
    bagsProduced: number;
    bagsDamaged: number;
    bagsTransferredToWarehouse: number;
    productionDate: string;
    notes?: string;
  }) => void;
  approveProductionRecord: (recordId: string) => void;
  rejectProductionRecord: (recordId: string, reason: string) => void;
  
  // Sales Management
  addSale: (saleData: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    state: string;
    items: { productId: string; quantity: number; unitPrice: number }[];
    paymentStatus: 'paid' | 'pending' | 'partially_paid';
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => void;
  
  // Debt & Credit Management (People who owe us / collected products on credit)
  addDebt: (debtData: {
    debtorName: string;
    debtorPhone: string;
    debtorAddress?: string;
    itemsDescription: string;
    totalCreditAmount: number;
    creditDate: string; // YYYY-MM-DD HH:mm
    notes?: string;
  }) => void;
  recordDebtPayment: (paymentData: {
    debtId: string;
    amount: number;
    paidDate: string; // YYYY-MM-DD HH:mm
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => void;

  // Staff Money Collection / Cash Advance Management
  addStaffAdvance: (advanceData: {
    staffId: string;
    amountCollected: number;
    dateCollected: string; // YYYY-MM-DD HH:mm
    purpose: string;
    notes?: string;
  }) => void;

  // Operator Requisition / Fund Claims
  addOperatorClaim: (claimData: {
    amountRequested: number;
    purpose: string;
    notes?: string;
  }) => void;
  updateOperatorClaimStatus: (claimId: string, status: 'approved' | 'disbursed' | 'rejected') => void;

  // Internal System Messaging & Communication
  sendMessage: (msgData: {
    recipientId: string; // 'all' or user.id
    recipientName: string;
    subject: string;
    content: string;
    category?: 'announcement' | 'request' | 'general' | 'alert';
  }) => void;
  markMessageAsRead: (messageId: string) => void;

  // Delivery Management
  assignDelivery: (deliveryData: {
    saleId?: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    state: string;
    driverId: string;
    departureDate?: string;
    departureTime?: string;
    items: { productId: string; quantityAssigned: number }[];
    driverNotes?: string;
  }) => void;
  updateDeliveryByDriver: (
    deliveryId: string,
    updates: {
      status: DeliveryStatus;
      itemsUpdates?: { productId: string; quantityLoaded?: number; quantityDelivered?: number; quantityReturnedOrDamaged?: number }[];
      driverNotes?: string;
      customerSignature?: string;
    }
  ) => void;
  
  // Customer Ordering
  placeCustomerOrder: (orderData: {
    customerName: string;
    phone: string;
    address: string;
    state: string;
    items: { productId: string; quantity: number }[];
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => void;
  
  // Settings & Product Updates
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetToDefaultData: () => void;
  
  // Helper Formatters
  formatCurrency: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'kanya_table_water_db_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initial fallback
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          users: parsed.users || INITIAL_USERS,
          products: parsed.products || INITIAL_PRODUCTS,
          productionRecords: parsed.productionRecords || INITIAL_PRODUCTION,
          inventory: parsed.inventory || INITIAL_INVENTORY,
          sales: parsed.sales || INITIAL_SALES,
          deliveries: parsed.deliveries || INITIAL_DELIVERIES,
          debts: parsed.debts || INITIAL_DEBTS,
          staffAdvances: parsed.staffAdvances || INITIAL_STAFF_ADVANCES,
          operatorClaims: parsed.operatorClaims || INITIAL_OPERATOR_CLAIMS,
          messages: parsed.messages || INITIAL_MESSAGES,
          auditLogs: parsed.auditLogs || INITIAL_AUDIT_LOGS,
          settings: parsed.settings || DEFAULT_SYSTEM_SETTINGS,
          currentUserId: parsed.currentUserId || 'user-1',
        };
      }
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
    }
    return {
      users: INITIAL_USERS,
      products: INITIAL_PRODUCTS,
      productionRecords: INITIAL_PRODUCTION,
      inventory: INITIAL_INVENTORY,
      sales: INITIAL_SALES,
      deliveries: INITIAL_DELIVERIES,
      debts: INITIAL_DEBTS,
      staffAdvances: INITIAL_STAFF_ADVANCES,
      operatorClaims: INITIAL_OPERATOR_CLAIMS,
      messages: INITIAL_MESSAGES,
      auditLogs: INITIAL_AUDIT_LOGS,
      settings: DEFAULT_SYSTEM_SETTINGS,
      currentUserId: 'user-1',
    };
  };

  const initialState = getInitialState();

  const [users, setUsers] = useState<User[]>(initialState.users);
  const [products, setProducts] = useState<Product[]>(initialState.products);
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>(initialState.productionRecords);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialState.inventory);
  const [sales, setSales] = useState<Sale[]>(initialState.sales);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialState.deliveries);
  const [debts, setDebts] = useState<CustomerDebt[]>(initialState.debts);
  const [staffAdvances, setStaffAdvances] = useState<StaffAdvance[]>(initialState.staffAdvances);
  const [operatorClaims, setOperatorClaims] = useState<OperatorFundClaim[]>(initialState.operatorClaims);
  const [messages, setMessages] = useState<SystemMessage[]>(initialState.messages);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialState.auditLogs);
  const [settings, setSettings] = useState<SystemSettings>(initialState.settings);
  const [currentUserId, setCurrentUserId] = useState<string>(initialState.currentUserId);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  // Save to localStorage on change
  useEffect(() => {
    const dataToSave = {
      users,
      products,
      productionRecords,
      inventory,
      sales,
      deliveries,
      debts,
      staffAdvances,
      operatorClaims,
      messages,
      auditLogs,
      settings,
      currentUserId,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [
    users,
    products,
    productionRecords,
    inventory,
    sales,
    deliveries,
    debts,
    staffAdvances,
    operatorClaims,
    messages,
    auditLogs,
    settings,
    currentUserId,
  ]);

  const logAction = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Format currency helper
  const formatCurrency = (amount: number): string => {
    return `${settings.currencySymbol}${amount.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // Switch role by picking a representative user of that role or updating current user role
  const setCurrentUserRole = (role: UserRole) => {
    const existing = users.find((u) => u.role === role && u.active);
    if (existing) {
      setCurrentUserId(existing.id);
      logAction('SWITCH_ROLE', `Switched active profile to ${existing.name} (${role.toUpperCase()})`);
    } else {
      // update current user role directly
      setUsers((prev) =>
        prev.map((u) => (u.id === currentUser.id ? { ...u, role } : u))
      );
      logAction('CHANGE_ROLE', `Changed role to ${role.toUpperCase()}`);
    }
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUserId(found.id);
      logAction('SWITCH_USER', `Switched logged in user to ${found.name} (${found.role.toUpperCase()})`);
    }
  };

  // User CRUD
  const createUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: 'user-' + Date.now(),
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setUsers((prev) => [...prev, newUser]);
    logAction('CREATE_USER', `Created new user ${newUser.name} (${newUser.role.toUpperCase()})`);
  };

  const updateUser = (userId: string, data: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
    );
    logAction('UPDATE_USER', `Updated user profile ID: ${userId}`);
  };

  const deleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    logAction('DELETE_USER', `Deleted user account: ${target?.name || userId}`);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
    );
    logAction('TOGGLE_USER_STATUS', `Toggled active state for user ID: ${userId}`);
  };

  // Production Record Actions
  const addProductionRecord = (data: {
    productId: string;
    bagsProduced: number;
    bagsDamaged: number;
    bagsTransferredToWarehouse: number;
    productionDate: string;
    notes?: string;
  }) => {
    const prod = products.find((p) => p.id === data.productId);
    const dateCode = data.productionDate.replace(/-/g, '');
    const batchNumber = `BATCH-${dateCode}-${Math.floor(10 + Math.random() * 90)}`;
    
    // Auto approve if settings state so, or if logged in as Admin/Manager
    const isAutoApproved = settings.autoApproveProduction || currentUser.role === 'super_admin' || currentUser.role === 'manager';

    const newRecord: ProductionRecord = {
      id: 'prod-rec-' + Date.now(),
      batchNumber,
      productionDate: data.productionDate,
      productId: data.productId,
      productName: prod ? prod.name : 'Water Product',
      bagsProduced: Number(data.bagsProduced),
      bagsDamaged: Number(data.bagsDamaged),
      bagsTransferredToWarehouse: Number(data.bagsTransferredToWarehouse),
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      status: isAutoApproved ? 'approved' : 'pending_approval',
      approvedBy: isAutoApproved ? currentUser.name : undefined,
      approvedDate: isAutoApproved ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
      notes: data.notes,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setProductionRecords((prev) => [newRecord, ...prev]);

    // Update Inventory automatically if approved!
    if (isAutoApproved) {
      updateInventoryOnProduction(data.productId, data.bagsProduced, data.bagsTransferredToWarehouse, data.bagsDamaged);
    }

    logAction(
      'ADD_PRODUCTION',
      `Recorded production ${batchNumber}: ${data.bagsProduced} bags of ${prod?.name}. Status: ${newRecord.status}`
    );
  };

  const updateInventoryOnProduction = (productId: string, bagsProduced: number, bagsTransferred: number, bagsDamaged: number) => {
    setInventory((prev) =>
      prev.map((inv) => {
        if (inv.productId === productId) {
          return {
            ...inv,
            totalProduced: inv.totalProduced + bagsProduced,
            totalInStock: inv.totalInStock + bagsTransferred,
            totalDamaged: inv.totalDamaged + bagsDamaged,
            lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
          };
        }
        return inv;
      })
    );
  };

  const approveProductionRecord = (recordId: string) => {
    const record = productionRecords.find((r) => r.id === recordId);
    if (!record || record.status === 'approved') return;

    setProductionRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status: 'approved',
              approvedBy: currentUser.name,
              approvedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : r
      )
    );

    updateInventoryOnProduction(
      record.productId,
      record.bagsProduced,
      record.bagsTransferredToWarehouse,
      record.bagsDamaged
    );

    logAction('APPROVE_PRODUCTION', `Approved batch ${record.batchNumber} by ${currentUser.name}`);
  };

  const rejectProductionRecord = (recordId: string, reason: string) => {
    setProductionRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status: 'rejected',
              rejectionReason: reason,
            }
          : r
      )
    );
    logAction('REJECT_PRODUCTION', `Rejected production record ID: ${recordId}. Reason: ${reason}`);
  };

  // Add Sale & Automatically Reduce Inventory
  const addSale = (saleData: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    state: string;
    items: { productId: string; quantity: number; unitPrice: number }[];
    paymentStatus: 'paid' | 'pending' | 'partially_paid';
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => {
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const invoiceNo = `INV-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`;

    const saleItems = saleData.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod ? prod.name : 'Water Product',
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.quantity) * Number(item.unitPrice),
      };
    });

    const totalBags = saleItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const totalAmount = saleItems.reduce((acc, curr) => acc + curr.totalPrice, 0);

    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      invoiceNo,
      customerId: saleData.customerId,
      customerName: saleData.customerName,
      customerPhone: saleData.customerPhone,
      customerAddress: saleData.customerAddress,
      state: saleData.state,
      items: saleItems,
      totalBags,
      totalAmount,
      paymentStatus: saleData.paymentStatus,
      paymentMethod: saleData.paymentMethod,
      salesOfficerId: currentUser.id,
      salesOfficerName: currentUser.name,
      date: dateStr,
      notes: saleData.notes,
    };

    setSales((prev) => [newSale, ...prev]);

    // Automatically reduce inventory upon sale!
    setInventory((prev) =>
      prev.map((inv) => {
        const itemSold = saleItems.find((s) => s.productId === inv.productId);
        if (itemSold) {
          return {
            ...inv,
            totalSold: inv.totalSold + itemSold.quantity,
            totalInStock: Math.max(0, inv.totalInStock - itemSold.quantity),
            lastUpdated: dateStr,
          };
        }
        return inv;
      })
    );

    logAction('RECORD_SALE', `Recorded sale ${invoiceNo} for ${saleData.customerName}: ${formatCurrency(totalAmount)} (${totalBags} bags/packs)`);
  };

  // Debt / Credit Sales Tracker
  const addDebt = (debtData: {
    debtorName: string;
    debtorPhone: string;
    debtorAddress?: string;
    itemsDescription: string;
    totalCreditAmount: number;
    creditDate: string;
    notes?: string;
  }) => {
    const amount = Number(debtData.totalCreditAmount);
    const newDebt: CustomerDebt = {
      id: 'debt-' + Date.now(),
      debtorName: debtData.debtorName,
      debtorPhone: debtData.debtorPhone,
      debtorAddress: debtData.debtorAddress,
      itemsDescription: debtData.itemsDescription,
      totalCreditAmount: amount,
      totalPaidAmount: 0,
      balanceOwed: amount,
      creditDate: debtData.creditDate || new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'unpaid',
      recordedBy: currentUser.name,
      payments: [],
      notes: debtData.notes,
    };

    setDebts((prev) => [newDebt, ...prev]);
    logAction('RECORD_DEBT', `Recorded credit sale for ${debtData.debtorName}: ${formatCurrency(amount)}`);
  };

  const recordDebtPayment = (paymentData: {
    debtId: string;
    amount: number;
    paidDate: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => {
    const payAmount = Number(paymentData.amount);
    const dateStr = paymentData.paidDate || new Date().toISOString().replace('T', ' ').substring(0, 16);

    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === paymentData.debtId) {
          const newTotalPaid = d.totalPaidAmount + payAmount;
          const newBalance = Math.max(0, d.totalCreditAmount - newTotalPaid);
          let newStatus: 'unpaid' | 'partially_paid' | 'fully_paid' = 'partially_paid';
          if (newBalance <= 0) {
            newStatus = 'fully_paid';
          } else if (newTotalPaid === 0) {
            newStatus = 'unpaid';
          }

          const newPayment: DebtPayment = {
            id: 'pay-' + Date.now(),
            amount: payAmount,
            paidDate: dateStr,
            paymentMethod: paymentData.paymentMethod,
            recordedBy: currentUser.name,
            notes: paymentData.notes,
          };

          return {
            ...d,
            totalPaidAmount: newTotalPaid,
            balanceOwed: newBalance,
            status: newStatus,
            lastPaymentDate: dateStr,
            payments: [newPayment, ...d.payments],
          };
        }
        return d;
      })
    );

    logAction('RECORD_DEBT_PAYMENT', `Recorded payment of ${formatCurrency(payAmount)} for debt ID: ${paymentData.debtId}`);
  };

  // Staff Money Collection / Advances
  const addStaffAdvance = (data: {
    staffId: string;
    amountCollected: number;
    dateCollected: string;
    purpose: string;
    notes?: string;
  }) => {
    const targetStaff = users.find((u) => u.id === data.staffId);
    if (!targetStaff) return;

    const dateObj = new Date(data.dateCollected || Date.now());
    const yearMonth = dateObj.toISOString().substring(0, 7); // e.g., "2026-07"

    // Count how many times this staff collected money this month
    const existingTimes = staffAdvances.filter(
      (sa) => sa.staffId === data.staffId && sa.dateCollected.startsWith(yearMonth)
    ).length;

    const newAdvance: StaffAdvance = {
      id: 'adv-' + Date.now(),
      staffId: data.staffId,
      staffName: targetStaff.name,
      staffRole: targetStaff.role,
      amountCollected: Number(data.amountCollected),
      dateCollected: data.dateCollected || new Date().toISOString().replace('T', ' ').substring(0, 16),
      timesCollectedThisMonth: existingTimes + 1,
      purpose: data.purpose,
      recordedBy: currentUser.name,
      status: 'approved',
      notes: data.notes,
    };

    setStaffAdvances((prev) => [newAdvance, ...prev]);
    logAction(
      'RECORD_STAFF_ADVANCE',
      `Recorded staff advance of ${formatCurrency(Number(data.amountCollected))} for ${targetStaff.name} (${existingTimes + 1}th time this month)`
    );
  };

  // Operator Requisition Claims
  const addOperatorClaim = (data: { amountRequested: number; purpose: string; notes?: string }) => {
    const newClaim: OperatorFundClaim = {
      id: 'claim-' + Date.now(),
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      amountRequested: Number(data.amountRequested),
      purpose: data.purpose,
      requestDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending',
      notes: data.notes,
    };

    setOperatorClaims((prev) => [newClaim, ...prev]);
    logAction('SUBMIT_OPERATOR_CLAIM', `Operator ${currentUser.name} requested funds: ${formatCurrency(Number(data.amountRequested))} for "${data.purpose}"`);
  };

  const updateOperatorClaimStatus = (claimId: string, status: 'approved' | 'disbursed' | 'rejected') => {
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setOperatorClaims((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status,
              approvedBy: currentUser.name,
              approvedDate: dateStr,
            }
          : c
      )
    );
    logAction('UPDATE_OPERATOR_CLAIM', `Updated operator claim ${claimId} status to ${status.toUpperCase()}`);
  };

  // System Communication Messaging
  const sendMessage = (data: {
    recipientId: string;
    recipientName: string;
    subject: string;
    content: string;
    category?: 'announcement' | 'request' | 'general' | 'alert';
  }) => {
    const newMsg: SystemMessage = {
      id: 'msg-' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipientId: data.recipientId,
      recipientName: data.recipientName,
      subject: data.subject,
      content: data.content,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      category: data.category || 'general',
    };

    setMessages((prev) => [newMsg, ...prev]);
    logAction('SEND_SYSTEM_MESSAGE', `Sent message "${data.subject}" to ${data.recipientName}`);
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m))
    );
  };

  // Delivery Management
  const assignDelivery = (data: {
    saleId?: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    state: string;
    driverId: string;
    departureDate?: string;
    departureTime?: string;
    items: { productId: string; quantityAssigned: number }[];
    driverNotes?: string;
  }) => {
    const driver = users.find((u) => u.id === data.driverId);
    const trackingNo = `DEL-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`;
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const deliveryItems = data.items.map((i) => {
      const prod = products.find((p) => p.id === i.productId);
      return {
        productId: i.productId,
        productName: prod ? prod.name : 'Water Product',
        quantityAssigned: Number(i.quantityAssigned),
      };
    });

    const totalBags = deliveryItems.reduce((sum, item) => sum + item.quantityAssigned, 0);

    const newDelivery: Delivery = {
      id: 'del-' + Date.now(),
      trackingNo,
      saleId: data.saleId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      deliveryAddress: data.deliveryAddress,
      state: data.state,
      driverId: data.driverId,
      driverName: driver ? driver.name : 'Assigned Driver',
      driverPhone: driver ? driver.phone : '+234 800 000 0000',
      vehicleNo: driver?.vehicleNo || 'KNY-TRK-01',
      items: deliveryItems,
      totalBags,
      status: 'assigned',
      assignedDate: dateStr,
      departureDate: data.departureDate || new Date().toISOString().substring(0, 10),
      departureTime: data.departureTime || new Date().toTimeString().substring(0, 5),
      driverNotes: data.driverNotes,
    };

    setDeliveries((prev) => [newDelivery, ...prev]);
    logAction('ASSIGN_DELIVERY', `Assigned delivery ${trackingNo} to driver ${driver?.name} at ${newDelivery.departureTime} for ${data.customerName}`);
  };

  // Driver updates delivery progress
  const updateDeliveryByDriver = (
    deliveryId: string,
    updates: {
      status: DeliveryStatus;
      itemsUpdates?: { productId: string; quantityLoaded?: number; quantityDelivered?: number; quantityReturnedOrDamaged?: number }[];
      driverNotes?: string;
      customerSignature?: string;
    }
  ) => {
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setDeliveries((prev) =>
      prev.map((del) => {
        if (del.id === deliveryId) {
          const updatedItems = del.items.map((item) => {
            const itemUpd = updates.itemsUpdates?.find((u) => u.productId === item.productId);
            if (itemUpd) {
              return {
                ...item,
                quantityLoaded: itemUpd.quantityLoaded !== undefined ? Number(itemUpd.quantityLoaded) : item.quantityLoaded,
                quantityDelivered: itemUpd.quantityDelivered !== undefined ? Number(itemUpd.quantityDelivered) : item.quantityDelivered,
                quantityReturnedOrDamaged:
                  itemUpd.quantityReturnedOrDamaged !== undefined
                    ? Number(itemUpd.quantityReturnedOrDamaged)
                    : item.quantityReturnedOrDamaged,
              };
            }
            return item;
          });

          let dispatchedDate = del.dispatchedDate;
          if (updates.status === 'in_transit' || updates.status === 'loaded') {
            dispatchedDate = dispatchedDate || dateStr;
          }

          let deliveredDate = del.deliveredDate;
          if (updates.status === 'delivered' || updates.status === 'partially_delivered') {
            deliveredDate = dateStr;
          }

          return {
            ...del,
            status: updates.status,
            items: updatedItems,
            dispatchedDate,
            deliveredDate,
            driverNotes: updates.driverNotes || del.driverNotes,
            customerSignature: updates.customerSignature || del.customerSignature,
          };
        }
        return del;
      })
    );

    // If delivered or partially delivered, update inventory delivered count and damaged count
    if (updates.status === 'delivered' || updates.status === 'partially_delivered') {
      const del = deliveries.find((d) => d.id === deliveryId);
      if (del) {
        updates.itemsUpdates?.forEach((upd) => {
          setInventory((prevInv) =>
            prevInv.map((inv) => {
              if (inv.productId === upd.productId) {
                return {
                  ...inv,
                  totalDelivered: inv.totalDelivered + (upd.quantityDelivered || 0),
                  totalDamaged: inv.totalDamaged + (upd.quantityReturnedOrDamaged || 0),
                  lastUpdated: dateStr,
                };
              }
              return inv;
            })
          );
        });
      }
    }

    logAction('UPDATE_DELIVERY', `Driver updated delivery ID ${deliveryId} status to ${updates.status.toUpperCase()}`);
  };

  // Place Customer Order
  const placeCustomerOrder = (orderData: {
    customerName: string;
    phone: string;
    address: string;
    state: string;
    items: { productId: string; quantity: number }[];
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => {
    // 1. Add as a Sale with pending / paid status
    const orderItems = orderData.items.map((i) => {
      const prod = products.find((p) => p.id === i.productId);
      const unitPrice = prod ? prod.unitPrice : 350;
      return {
        productId: i.productId,
        quantity: i.quantity,
        unitPrice,
      };
    });

    addSale({
      customerId: currentUser.id,
      customerName: orderData.customerName,
      customerPhone: orderData.phone,
      customerAddress: orderData.address,
      state: orderData.state,
      items: orderItems,
      paymentStatus: orderData.paymentMethod === 'bank_transfer' ? 'paid' : 'pending',
      paymentMethod: orderData.paymentMethod,
      notes: `Online Customer Order. ${orderData.notes || ''}`,
    });
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
    // update inventory min stock alert if applicable
    if (updates.minStockAlert !== undefined) {
      setInventory((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, minStockAlert: updates.minStockAlert! } : i))
      );
    }
    logAction('UPDATE_PRODUCT', `Updated product details for ID: ${productId}`);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAction('UPDATE_SETTINGS', 'Updated company system settings');
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUsers(INITIAL_USERS);
    setProducts(INITIAL_PRODUCTS);
    setProductionRecords(INITIAL_PRODUCTION);
    setInventory(INITIAL_INVENTORY);
    setSales(INITIAL_SALES);
    setDeliveries(INITIAL_DELIVERIES);
    setDebts(INITIAL_DEBTS);
    setStaffAdvances(INITIAL_STAFF_ADVANCES);
    setOperatorClaims(INITIAL_OPERATOR_CLAIMS);
    setMessages(INITIAL_MESSAGES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSettings(DEFAULT_SYSTEM_SETTINGS);
    setCurrentUserId('user-1');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        products,
        productionRecords,
        inventory,
        sales,
        deliveries,
        debts,
        staffAdvances,
        operatorClaims,
        messages,
        auditLogs,
        settings,
        setCurrentUserRole,
        switchUser,
        createUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        addProductionRecord,
        approveProductionRecord,
        rejectProductionRecord,
        addSale,
        addDebt,
        recordDebtPayment,
        addStaffAdvance,
        addOperatorClaim,
        updateOperatorClaimStatus,
        sendMessage,
        markMessageAsRead,
        assignDelivery,
        updateDeliveryByDriver,
        placeCustomerOrder,
        updateProduct,
        updateSettings,
        resetToDefaultData,
        formatCurrency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
