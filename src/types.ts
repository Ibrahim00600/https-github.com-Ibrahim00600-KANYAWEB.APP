export type UserRole = 'super_admin' | 'manager' | 'operator' | 'driver' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address?: string;
  state?: string;
  active: boolean;
  avatar?: string;
  vehicleNo?: string; // For Drivers
  createdAt: string;
}

export type ProductType = 
  | 'sachet_50cl'       // 50cl Sachet Water (Bag of 20)
  | 'bottle_75cl'       // 75cl Premium Bottle Water (Pack of 12)
  | 'bottle_50cl'       // 50cl Standard Bottle Water (Pack of 12)
  | 'dispenser_19l'     // 19L Dispenser Refill
  | 'bottle_1_5l';      // 1.5L Big Bottle Water (Pack of 6)

export interface Product {
  id: string;
  type: ProductType;
  name: string;
  unitDescription: string; // e.g. "Bag of 20 sachets", "Pack of 12 bottles"
  unitPrice: number;       // in ₦ (Naira)
  costPrice: number;       // in ₦
  minStockAlert: number;   // Threshold for low stock warning
  imageUrl: string;
}

export type ProductionStatus = 'pending_approval' | 'approved' | 'rejected';

export interface ProductionRecord {
  id: string;
  batchNumber: string;
  productionDate: string;  // YYYY-MM-DD
  productId: string;
  productName: string;
  bagsProduced: number;
  bagsDamaged: number;
  bagsTransferredToWarehouse: number;
  operatorId: string;
  operatorName: string;
  status: ProductionStatus;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
}

export interface InventoryItem {
  productId: string;
  productName: string;
  productType: ProductType;
  unitDescription: string;
  totalProduced: number;
  totalInStock: number;
  totalSold: number;
  totalDelivered: number;
  totalDamaged: number;
  minStockAlert: number;
  lastUpdated: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'partially_paid';
export type PaymentMethod = 'bank_transfer' | 'cash' | 'pos' | 'credit';

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number; // bags or packs
  unitPrice: number; // ₦
  totalPrice: number; // ₦
}

export interface Sale {
  id: string;
  invoiceNo: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  state: string;
  items: SaleItem[];
  totalBags: number;
  totalAmount: number; // ₦
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  salesOfficerId: string;
  salesOfficerName: string;
  date: string; // YYYY-MM-DD HH:mm
  notes?: string;
}

export type DeliveryStatus = 
  | 'assigned' 
  | 'loaded' 
  | 'in_transit' 
  | 'delivered' 
  | 'partially_delivered' 
  | 'failed';

export interface Delivery {
  id: string;
  trackingNo: string;
  saleId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  state: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehicleNo: string;
  items: {
    productId: string;
    productName: string;
    quantityAssigned: number;
    quantityLoaded?: number;
    quantityDelivered?: number;
    quantityReturnedOrDamaged?: number;
  }[];
  totalBags: number;
  status: DeliveryStatus;
  assignedDate: string;
  departureDate?: string;
  departureTime?: string; // e.g., "08:30 AM" or "14:15"
  dispatchedDate?: string;
  deliveredDate?: string;
  driverNotes?: string;
  customerSignature?: string;
}

export interface DebtPayment {
  id: string;
  amount: number;
  paidDate: string; // YYYY-MM-DD HH:mm
  paymentMethod: PaymentMethod;
  recordedBy: string;
  notes?: string;
}

export interface CustomerDebt {
  id: string;
  debtorName: string;
  debtorPhone: string;
  debtorAddress?: string;
  itemsDescription: string;
  totalCreditAmount: number;
  totalPaidAmount: number;
  balanceOwed: number;
  creditDate: string; // YYYY-MM-DD HH:mm
  status: 'unpaid' | 'partially_paid' | 'fully_paid';
  recordedBy: string;
  lastPaymentDate?: string;
  payments: DebtPayment[];
  notes?: string;
}

export interface StaffAdvance {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: UserRole;
  amountCollected: number;
  dateCollected: string; // YYYY-MM-DD HH:mm
  timesCollectedThisMonth: number;
  purpose: string;
  recordedBy: string;
  status: 'approved' | 'repaid' | 'deducted';
  notes?: string;
}

export interface OperatorFundClaim {
  id: string;
  operatorId: string;
  operatorName: string;
  amountRequested: number;
  purpose: string;
  requestDate: string; // YYYY-MM-DD HH:mm
  status: 'pending' | 'approved' | 'disbursed' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
}

export interface SystemMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string; // 'all' or specific user ID
  recipientName: string;
  subject: string;
  content: string;
  timestamp: string; // YYYY-MM-DD HH:mm
  isRead: boolean;
  category: 'announcement' | 'request' | 'general' | 'alert';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface SystemSettings {
  companyName: string;
  tagline: string;
  address: string;
  state: string;
  phone: string;
  email: string;
  currencySymbol: string;
  currencyCode: string;
  nafdacNo: string;
  vatPercentage: number;
  autoApproveProduction: boolean;
  lowStockThresholdGlobal: number;
}
