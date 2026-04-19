import api from '@/lib/axios';
import type {
  Order,
  OrderFilters,
  CreateOrderPayload,
  Customer,
  CreateCustomerPayload,
  Category,
  Product,
  ProductFilters,
  CreateProductPayload,
  Inventory,
  InventoryFilters,
  Supplier,
  CreateSupplierPayload,
  PurchaseOrder,
  CreatePurchaseOrderPayload,
  SalesReport,
  PaginatedResponse,
} from '@/types';

export async function getOrders(
  filters?: OrderFilters
): Promise<PaginatedResponse<Order>> {
  const params = filters ? {
    ...filters,
    type: filters.orderType ?? filters.type,
  } : undefined;
  const { data } = await api.get<PaginatedResponse<Order>>('/sales/orders', { params });
  return data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await api.get<Order>(`/sales/orders/${id}`);
  return data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post<Order>('/sales/orders', payload);
  return data;
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const { data } = await api.patch<Order>(`/sales/orders/${id}/status`, { status });
  return data;
}

export async function getCustomers(phone?: string): Promise<Customer[]> {
  const { data } = await api.get<Customer[]>('/sales/customers', {
    params: phone ? { phone } : undefined,
  });
  if (Array.isArray(data)) return data;
  return [data as unknown as Customer];
}

export async function getCustomer(id: string): Promise<Customer> {
  const { data } = await api.get<Customer>(`/sales/customers/${id}`);
  return data;
}

export async function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  const { data } = await api.post<Customer>('/sales/customers', payload);
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/sales/categories');
  return data;
}

export async function createCategory(payload: { categoryName: string; description?: string }): Promise<Category> {
  const { data } = await api.post<Category>('/sales/categories', payload);
  return data;
}

export async function updateCategory(id: string, payload: { categoryName: string; description?: string }): Promise<Category> {
  const { data } = await api.put<Category>(`/sales/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/sales/categories/${id}`);
}

export async function getProducts(
  filters?: ProductFilters
): Promise<PaginatedResponse<Product>> {
  const { data } = await api.get<PaginatedResponse<Product>>('/sales/products', {
    params: filters,
  });
  return data;
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await api.get<Product>(`/sales/products/${id}`);
  return data;
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const { data } = await api.post<Product>('/sales/products', payload);
  return data;
}

export async function updateProduct(id: string, payload: Partial<CreateProductPayload & { status: string }>): Promise<Product> {
  const { data } = await api.patch<Product>(`/sales/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/sales/products/${id}`);
}

export async function getCustomerOrders(customerId: string): Promise<import('@/types').Order[]> {
  const { data } = await api.get<import('@/types').Order[]>(`/sales/customers/${customerId}/orders`);
  return data;
}

export async function getPromotions(): Promise<Promotion[]> {
  const { data } = await api.get<Promotion[]>('/sales/promotions');
  return data;
}

export async function createPromotion(payload: CreatePromotionPayload): Promise<Promotion> {
  const { data } = await api.post<Promotion>('/sales/promotions', payload);
  return data;
}

export async function updatePromotion(id: string, payload: Partial<CreatePromotionPayload & { active: boolean }>): Promise<Promotion> {
  const { data } = await api.patch<Promotion>(`/sales/promotions/${id}`, payload);
  return data;
}

export async function deletePromotion(id: string): Promise<void> {
  await api.delete(`/sales/promotions/${id}`);
}

export async function getInventory(
  filters?: InventoryFilters
): Promise<PaginatedResponse<Inventory>> {
  const { data } = await api.get<PaginatedResponse<Inventory>>('/sales/inventory', {
    params: filters,
  });
  if (filters?.lowStock) {
    const filtered = data.data.filter(i => i.quantity <= i.minThreshold);
    return { ...data, data: filtered, total: filtered.length };
  }
  if (!filters?.lowStock && filters?.branchId) {
    const filtered = data.data.filter(i => i.branchId === filters.branchId);
    return { ...data, data: filtered, total: filtered.length };
  }
  return data;
}

export async function getSuppliers(): Promise<Supplier[]> {
  const { data } = await api.get<Supplier[]>('/sales/suppliers');
  return data;
}

export async function createSupplier(payload: CreateSupplierPayload): Promise<Supplier> {
  const { data } = await api.post<Supplier>('/sales/suppliers', payload);
  return data;
}

export async function getPurchaseOrders(branchId?: string): Promise<PurchaseOrder[]> {
  const { data } = await api.get<PurchaseOrder[]>('/sales/purchase-orders', {
    params: branchId ? { branchId } : undefined,
  });
  return data;
}

export async function createPurchaseOrder(
  payload: CreatePurchaseOrderPayload
): Promise<PurchaseOrder> {
  const { data } = await api.post<PurchaseOrder>('/sales/purchase-orders', payload);
  return data;
}

export async function receivePurchaseOrder(id: string): Promise<void> {
  await api.post(`/sales/purchase-orders/${id}/receive`);
}

export async function getPurchaseOrderDetails(poId: string): Promise<PurchaseOrderDetail[]> {
  const { data } = await api.get<PurchaseOrderDetail[]>(`/purchase-order-details/po/${poId}`);
  return data;
}

export async function createPurchaseOrderFull(payload: {
  supplierId: string;
  branchId: string;
  note?: string;
  details: { productId: string; quantityOrdered: number }[];
}): Promise<PurchaseOrder> {
  const { data } = await api.post<PurchaseOrder>('/sales/purchase-orders/create', payload);
  return data;
}

export async function getSalesReports(branchId?: string): Promise<SalesReport[]> {
  const { data } = await api.get<SalesReport[]>('/sales/reports', {
    params: branchId ? { branchId } : undefined,
  });
  return data;
}

export async function getSalesDashboard(params?: { branchId?: string; dateFrom?: string; dateTo?: string }): Promise<import('@/types').SalesDashboard> {
  const { data } = await api.get('/sales/reports/dashboard', { params });
  return data;
}

export async function getStockTransfers(branchId?: string): Promise<import('@/types').StockTransfer[]> {
  const { data } = await api.get('/sales/stock-transfers', { params: branchId ? { branchId } : undefined });
  return data;
}

export async function createStockTransfer(payload: {
  fromBranchId: string; toBranchId: string; productId: string;
  quantity: number; note?: string; createdByEmployeeId?: string;
}): Promise<import('@/types').StockTransfer> {
  const { data } = await api.post('/sales/stock-transfers', payload);
  return data;
}

export async function completeStockTransfer(id: string): Promise<import('@/types').StockTransfer> {
  const { data } = await api.patch(`/sales/stock-transfers/${id}/complete`);
  return data;
}

export async function cancelStockTransfer(id: string): Promise<import('@/types').StockTransfer> {
  const { data } = await api.patch(`/sales/stock-transfers/${id}/cancel`);
  return data;
}

export async function getStockAudits(branchId?: string): Promise<import('@/types').StockAudit[]> {
  const { data } = await api.get('/sales/stock-audits', { params: branchId ? { branchId } : undefined });
  return data;
}

export async function createStockAudit(payload: {
  branchId: string; productId: string; actualQuantity: number;
  note?: string; auditedByEmployeeId?: string;
}): Promise<import('@/types').StockAudit> {
  const { data } = await api.post('/sales/stock-audits', payload);
  return data;
}

export async function resolveStockAudit(id: string, resolvedNote: string): Promise<import('@/types').StockAudit> {
  const { data } = await api.patch(`/sales/stock-audits/${id}/resolve`, { resolvedNote });
  return data;
}

export async function uploadProductImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<{ url: string }>('/sales/products/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}
