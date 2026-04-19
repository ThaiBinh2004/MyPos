export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';

export interface Category {
  categoryId: string;
  categoryName: string;
  description?: string;
}
export type OrderType = 'online' | 'offline';
export type PaymentMethod = 'cash' | 'transfer' | 'card';
export type ProductStatus = 'active' | 'inactive';
export type PurchaseOrderStatus = 'pending' | 'partial' | 'completed' | 'cancelled';
export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Customer {
  customerId: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  loyaltyPoints: number;
  customerRank: string;
  createdAt: string;
}

export interface Product {
  productId: string;
  sku: string;
  productName: string;
  price: number;
  sizeInfo?: string;
  color?: string;
  imageUrl?: string;
  categoryId: string;
  categoryName: string;
  status: ProductStatus;
}

export interface OrderDetail {
  detailId: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  branchId: string;
  branchName: string;
  employeeId: string;
  employeeName: string;
  orderType: OrderType;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  loyaltyPointsUsed: number;
  paymentMethod: PaymentMethod;
  shippingAddress?: string;
  note?: string;
  status: OrderStatus;
  createdAt: string;
  details?: OrderDetail[];
}

export interface Inventory {
  inventoryId: string;
  productId: string;
  productName: string;
  branchId: string;
  branchName?: string;
  quantity: number;
  minThreshold: number;
  updatedAt: string;
}

export interface Supplier {
  supplierId: string;
  supplierName: string;
  contact: string;
  phoneNumber: string;
  address: string;
  email?: string;
}

export interface PurchaseOrderDetail {
  detailId: string;
  poId: string;
  productId: string;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  note?: string;
}

export interface PurchaseOrder {
  poId: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName?: string;
  date: string;
  status: PurchaseOrderStatus;
  note?: string;
  details?: PurchaseOrderDetail[];
}

export interface SalesReport {
  reportId: string;
  branchId: string;
  branchName: string;
  periodType: PeriodType;
  fromDate: string;
  toDate: string;
  totalRevenue: number;
  totalOrders: number;
  generatedAt: string;
}

export interface OrderFilters {
  branchId?: string;
  employeeId?: string;
  customerId?: string;
  status?: string;
  orderType?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  page?: number;
  pageSize?: number;
}

export interface InventoryFilters {
  branchId?: string;
  productId?: string;
  lowStock?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateOrderPayload {
  customerId?: string;
  employeeId: string;
  branchId: string;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  shippingAddress?: string;
  shippingFee?: number;
  loyaltyPointsUsed?: number;
  note?: string;
  details: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface CreateProductPayload {
  sku: string;
  productName: string;
  price: number;
  sizeInfo?: string;
  color?: string;
  imageUrl?: string;
  categoryId: string;
}

export interface CreateSupplierPayload {
  supplierName: string;
  contact: string;
  phoneNumber: string;
  address: string;
  email?: string;
}

export interface CreatePurchaseOrderPayload {
  supplierId: string;
  branchId: string;
  details: Array<{
    productId: string;
    quantityOrdered: number;
  }>;
  note?: string;
}

export interface CreateCustomerPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
}

export interface Promotion {
  promotionId: string;
  name: string;
  code?: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
  description?: string;
  createdAt: string;
}

export interface StockTransfer {
  transferId: string;
  fromBranchId: string;
  fromBranchName: string;
  toBranchId: string;
  toBranchName: string;
  productId: string;
  productName: string;
  quantity: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  note: string;
  createdAt: string;
}

export interface StockAudit {
  auditId: string;
  branchId: string;
  branchName: string;
  productId: string;
  productName: string;
  systemQuantity: number;
  actualQuantity: number;
  difference: number;
  status: 'PENDING' | 'RESOLVED';
  note: string;
  resolvedNote: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface SalesDashboard {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  onlineOrders: number;
  offlineOrders: number;
  onlineRevenue: number;
  offlineRevenue: number;
  revenueByBranch: Array<{ name: string; revenue: number }>;
  revenueByDate: Array<{ date: string; revenue: number }>;
  dateFrom: string;
  dateTo: string;
}

export interface CreatePromotionPayload {
  name: string;
  code?: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
  description?: string;
}
