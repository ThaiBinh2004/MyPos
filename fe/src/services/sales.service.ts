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
  const { data } = await api.get<PaginatedResponse<Order>>('/sales/orders', {
    params: filters,
  });
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

export async function getCustomers(search?: string): Promise<Customer[]> {
  const { data } = await api.get<Customer[]>('/sales/customers', {
    params: search ? { search } : undefined,
  });
  return data;
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

export async function getInventory(
  filters?: InventoryFilters
): Promise<PaginatedResponse<Inventory>> {
  const { data } = await api.get<PaginatedResponse<Inventory>>('/sales/inventory', {
    params: filters,
  });
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

export async function getSalesReports(branchId?: string): Promise<SalesReport[]> {
  const { data } = await api.get<SalesReport[]>('/sales/reports', {
    params: branchId ? { branchId } : undefined,
  });
  return data;
}
