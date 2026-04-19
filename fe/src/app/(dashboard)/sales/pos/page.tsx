"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProducts, getCustomers, createCustomer, createOrder, getPromotions } from "@/services/sales.service";
import type { Product, Customer, CreateOrderPayload, Promotion } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import {
  Search, Plus, Minus, Trash2, UserSearch, UserPlus,
  Banknote, Receipt, ShoppingCart, CheckCircle, Gift, Tag
} from "lucide-react";

interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

const LOYALTY_RATE = 1000; // 1 điểm = 1,000 VND
const POINTS_PER_100K = 1; // mỗi 100,000 VND được 1 điểm

export default function PosPage() {
  const { user } = useAuth();

  // Product search & cart
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  // Customer
  const [phoneSearch, setPhoneSearch] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");

  // Promo code
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [promoError, setPromoError] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">("CASH");
  const [note, setNote] = useState("");

  // Size/color picker
  const [pickerProduct, setPickerProduct] = useState<Product | null>(null);
  const [pickedSize, setPickedSize] = useState("");
  const [pickedColor, setPickedColor] = useState("");

  // Bill modal
  const [billOrder, setBillOrder] = useState<null | {
    orderId: string;
    items: CartItem[];
    customer: Customer | null;
    subtotal: number;
    loyaltyDiscount: number;
    promoDiscount: number;
    promoCode?: string;
    total: number;
    paymentMethod: string;
    note: string;
  }>(null);
  const billRef = useRef<HTMLDivElement>(null);

  const { data: productsData } = useQuery({
    queryKey: ["products", search],
    queryFn: () => getProducts({ search, pageSize: 50 }),
    staleTime: 30_000,
  });
  const { data: promotions = [] } = useQuery({
    queryKey: ["promotions"],
    queryFn: getPromotions,
    staleTime: 60_000,
  });
  const products = productsData?.data ?? [];

  const searchCustomerQuery = useQuery({
    queryKey: ["customer-phone", phoneSearch],
    queryFn: () => getCustomers(phoneSearch),
    enabled: false,
  });

  const createCustomerMut = useMutation({
    mutationFn: createCustomer,
    onSuccess: (c) => { setCustomer(c); setShowNewCustomer(false); setNewCustName(""); setNewCustPhone(""); },
  });

  const createOrderMut = useMutation({
    mutationFn: (payload: CreateOrderPayload & { loyaltyPointsUsed?: number; note?: string }) =>
      createOrder(payload),
    onSuccess: (order) => {
      setBillOrder({
        orderId: order.orderId,
        items: [...cart],
        customer,
        subtotal,
        loyaltyDiscount: loyaltyPointsToUse * LOYALTY_RATE,
        promoDiscount,
        promoCode: appliedPromo?.code,
        total,
        paymentMethod,
        note,
      });
      setCart([]);
      setCustomer(null);
      setLoyaltyPointsToUse(0);
      setPhoneSearch("");
      setNote("");
      setPromoCode("");
      setAppliedPromo(null);
      setPromoError("");
    },
  });

  // Cart helpers
  const openPicker = (product: Product) => {
    const sizes = product.sizeInfo ? product.sizeInfo.split("/").map(s => s.trim()).filter(Boolean) : [];
    if (sizes.length <= 1 && !product.color) {
      addToCartDirect(product, sizes[0] ?? "", product.color ?? "");
    } else {
      setPickerProduct(product);
      setPickedSize(sizes[0] ?? "");
      setPickedColor(product.color ?? "");
    }
  };

  const addToCartDirect = (product: Product, size: string, color: string) => {
    setCart(prev => {
      const key = `${product.productId}-${size}-${color}`;
      const existing = prev.find(i => `${i.product.productId}-${i.selectedSize}-${i.selectedColor}` === key);
      if (existing) return prev.map(i =>
        `${i.product.productId}-${i.selectedSize}-${i.selectedColor}` === key ? { ...i, quantity: i.quantity + 1 } : i
      );
      return [...prev, { product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
  };

  const confirmPicker = () => {
    if (!pickerProduct) return;
    addToCartDirect(pickerProduct, pickedSize, pickedColor);
    setPickerProduct(null);
  };

  const updateQty = (key: string, delta: number) => {
    setCart(prev => prev
      .map(i => cartKey(i) === key ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0)
    );
  };

  const removeFromCart = (key: string) => setCart(prev => prev.filter(i => cartKey(i) !== key));

  const cartKey = (i: CartItem) => `${i.product.productId}-${i.selectedSize}-${i.selectedColor}`;

  // Promo helpers
  const promoIsActive = (p: Promotion) => {
    const now = Date.now();
    if (p.startDate && new Date(p.startDate).getTime() > now) return false;
    if (p.endDate && new Date(p.endDate).getTime() < now) return false;
    return true;
  };
  const calcPromoDiscount = (p: Promotion, sub: number) => {
    if (sub < p.minOrderAmount) return 0;
    if (p.discountType === 'PERCENT') {
      const d = Math.floor(sub * p.discountValue / 100);
      return p.maxDiscountAmount ? Math.min(d, p.maxDiscountAmount) : d;
    }
    return p.discountValue;
  };
  const applyPromoCode = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    const found = promotions.find(p => p.code?.toUpperCase() === code);
    if (!found) { setPromoError("Mã không tồn tại"); return; }
    if (!promoIsActive(found)) { setPromoError("Mã đã hết hạn"); return; }
    if (subtotal < found.minOrderAmount) {
      setPromoError(`Đơn tối thiểu ${formatCurrency(found.minOrderAmount)}`);
      return;
    }
    setAppliedPromo(found);
    setPromoError("");
  };

  // Totals
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const maxPoints = customer ? Math.min(customer.loyaltyPoints, Math.floor(subtotal / LOYALTY_RATE)) : 0;
  const promoDiscount = appliedPromo ? calcPromoDiscount(appliedPromo, subtotal) : 0;
  const discount = loyaltyPointsToUse * LOYALTY_RATE + promoDiscount;
  const total = Math.max(0, subtotal - discount);

  const handleSearchCustomer = async () => {
    if (!phoneSearch.trim()) return;
    const result = await searchCustomerQuery.refetch();
    if (result.data) {
      const list = Array.isArray(result.data) ? result.data : [result.data];
      if (list.length > 0) setCustomer(list[0]);
      else { setCustomer(null); setShowNewCustomer(true); setNewCustPhone(phoneSearch); }
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0 || !user?.employeeId || !user?.branchId) return;
    createOrderMut.mutate({
      employeeId: user.employeeId,
      branchId: user.branchId,
      customerId: customer?.customerId ?? "",
      orderType: "offline",
      paymentMethod: paymentMethod.toLowerCase() as "cash" | "transfer" | "card",
      shippingAddress: "",
      details: cart.map(i => ({ productId: i.product.productId, quantity: i.quantity, unitPrice: i.product.price })),
      loyaltyPointsUsed: loyaltyPointsToUse,
      note,
    } as CreateOrderPayload);
  };

  const handlePrint = () => {
    if (!billRef.current) return;
    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) return;
    win.document.write(`
      <html><head><title>Hoá đơn ${billOrder?.orderId}</title>
      <style>
        body { font-family: monospace; font-size: 12px; margin: 0; padding: 16px; }
        .center { text-align: center; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; }
        hr { border-top: 1px dashed #000; margin: 8px 0; }
        .bold { font-weight: bold; }
        .big { font-size: 16px; }
      </style>
      </head><body>${billRef.current.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="flex h-[calc(100vh-64px)] gap-0 bg-gray-50">
      {/* Left: Product Panel */}
      <div className="flex flex-col w-[58%] border-r border-gray-200 bg-white">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Tìm sản phẩm theo tên hoặc SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-3 gap-2 content-start">
          {products.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400 text-sm">Không tìm thấy sản phẩm</div>
          )}
          {products.map(p => (
            <button
              key={p.productId}
              onClick={() => openPicker(p)}
              className="flex flex-col items-start p-3 rounded-xl border border-gray-100 bg-white hover:border-indigo-300 hover:shadow-sm transition-all text-left group"
            >
              {p.imageUrl
                ? <img src={p.imageUrl} alt={p.productName} className="w-full h-24 object-cover rounded-lg mb-2" />
                : <div className="w-full h-24 bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-gray-300 text-2xl">👗</div>
              }
              <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight">{p.productName}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{p.sku}{p.sizeInfo ? ` · ${p.sizeInfo}` : ""}{p.color ? ` · ${p.color}` : ""}</p>
              <p className="text-sm font-bold text-indigo-600 mt-1">{formatCurrency(p.price)}</p>
              <div className="mt-1.5 w-full flex justify-end">
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">+ Thêm</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="flex flex-col w-[42%] bg-white">
        {/* Customer */}
        <div className="px-4 py-3 border-b border-gray-100">
          {customer ? (
            <div className="flex items-center justify-between rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-indigo-800">{customer.fullName}</p>
                <p className="text-xs text-indigo-500">{customer.phoneNumber} · {customer.customerRank}</p>
                <p className="text-xs text-indigo-500 flex items-center gap-1"><Gift size={10} />{customer.loyaltyPoints} điểm tích lũy</p>
              </div>
              <button onClick={() => { setCustomer(null); setLoyaltyPointsToUse(0); }} className="text-xs text-gray-400 hover:text-red-500">✕</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  className="w-full pl-3 pr-4 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="SĐT thành viên..."
                  value={phoneSearch}
                  onChange={e => setPhoneSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearchCustomer()}
                />
              </div>
              <Button size="sm" variant="ghost" onClick={handleSearchCustomer}><UserSearch size={14} /></Button>
              <Button size="sm" variant="ghost" onClick={() => setShowNewCustomer(true)}><UserPlus size={14} /></Button>
            </div>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5">
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
              <ShoppingCart size={36} />
              <p className="text-sm">Chưa có sản phẩm</p>
            </div>
          )}
          {cart.map(item => (
            <div key={cartKey(item)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{item.product.productName}</p>
                <p className="text-[10px] text-gray-400">
                  {[item.selectedSize, item.selectedColor].filter(Boolean).join(" · ")}
                </p>
                <p className="text-xs text-indigo-600 font-semibold">{formatCurrency(item.product.price)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(cartKey(item), -1)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                  <Minus size={10} />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                <button onClick={() => updateQty(cartKey(item), 1)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                  <Plus size={10} />
                </button>
              </div>
              <p className="text-xs font-bold text-gray-700 w-20 text-right">{formatCurrency(item.product.price * item.quantity)}</p>
              <button onClick={() => removeFromCart(cartKey(item))} className="text-gray-300 hover:text-red-400">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Loyalty points */}
        {customer && customer.loyaltyPoints > 0 && subtotal > 0 && (
          <div className="px-4 py-2 border-t border-gray-100">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs text-gray-600 flex items-center gap-1">
                <Gift size={12} className="text-amber-500" /> Dùng điểm ({customer.loyaltyPoints} điểm)
              </label>
              <div className="flex items-center gap-1">
                <button onClick={() => setLoyaltyPointsToUse(Math.max(0, loyaltyPointsToUse - 1))} className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-xs">-</button>
                <span className="w-8 text-center text-xs font-bold">{loyaltyPointsToUse}</span>
                <button onClick={() => setLoyaltyPointsToUse(Math.min(maxPoints, loyaltyPointsToUse + 1))} className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-xs">+</button>
                <button onClick={() => setLoyaltyPointsToUse(maxPoints)} className="text-[10px] text-indigo-500 hover:underline ml-1">Tối đa</button>
              </div>
            </div>
            {loyaltyPointsToUse > 0 && (
              <p className="text-[10px] text-amber-600 mt-0.5">Giảm {formatCurrency(discount)}</p>
            )}
          </div>
        )}

        {/* Promo code */}
        <div className="px-4 py-2 border-t border-gray-100">
          {appliedPromo ? (
            <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-3 py-1.5">
              <div className="flex items-center gap-1.5">
                <Tag size={12} className="text-green-600" />
                <span className="text-xs font-semibold text-green-700">{appliedPromo.code}</span>
                <span className="text-xs text-green-600">— Giảm {formatCurrency(promoDiscount)}</span>
              </div>
              <button onClick={() => { setAppliedPromo(null); setPromoCode(""); }} className="text-gray-400 hover:text-red-400 text-xs">✕</button>
            </div>
          ) : (
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <Tag size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300 uppercase placeholder:normal-case"
                  placeholder="Nhập mã khuyến mãi..."
                  value={promoCode}
                  onChange={e => { setPromoCode(e.target.value); setPromoError(""); }}
                  onKeyDown={e => e.key === "Enter" && applyPromoCode()}
                />
              </div>
              <button onClick={applyPromoCode}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium">
                Áp dụng
              </button>
            </div>
          )}
          {promoError && <p className="text-[10px] text-red-500 mt-0.5">{promoError}</p>}
        </div>

        {/* Totals */}
        <div className="px-4 py-2 border-t border-gray-100 space-y-1 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Tạm tính</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {loyaltyPointsToUse > 0 && (
            <div className="flex justify-between text-amber-600">
              <span>Giảm (điểm)</span>
              <span>- {formatCurrency(loyaltyPointsToUse * LOYALTY_RATE)}</span>
            </div>
          )}
          {promoDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm (KM {appliedPromo?.code})</span>
              <span>- {formatCurrency(promoDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-1 mt-1">
            <span>Tổng cộng</span>
            <span className="text-indigo-600">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="flex gap-2">
            {(["CASH", "TRANSFER"] as const).map(m => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`flex-1 flex flex-col items-center py-2 rounded-lg border text-xs font-medium transition-all ${
                  paymentMethod === m ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-500 hover:border-indigo-300"
                }`}
              >
                {m === "CASH" ? <Banknote size={16} className="mb-0.5" /> : <Receipt size={16} className="mb-0.5" />}
                {m === "CASH" ? "Tiền mặt" : "Chuyển khoản"}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="px-4 pb-2">
          <input
            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            placeholder="Ghi chú đơn hàng..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        {/* Checkout */}
        <div className="px-4 pb-4">
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || createOrderMut.isPending}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} />
            {createOrderMut.isPending ? "Đang xử lý..." : `Thanh toán ${formatCurrency(total)}`}
          </button>
        </div>
      </div>

      {/* Modal: Tạo thành viên mới */}
      <Modal open={showNewCustomer} onClose={() => setShowNewCustomer(false)} title="Thêm thành viên mới">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Không tìm thấy số điện thoại <strong>{phoneSearch}</strong>. Tạo thành viên mới?</p>
          <Input label="Họ tên" value={newCustName} onChange={e => setNewCustName(e.target.value)} />
          <Input label="Số điện thoại" value={newCustPhone} onChange={e => setNewCustPhone(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowNewCustomer(false)}>Bỏ qua</Button>
            <Button
              onClick={() => createCustomerMut.mutate({ fullName: newCustName, phoneNumber: newCustPhone })}
              loading={createCustomerMut.isPending}
              disabled={!newCustName || !newCustPhone}
            >
              Tạo & dùng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Size / Color Picker Modal */}
      <Modal open={!!pickerProduct} onClose={() => setPickerProduct(null)} title="Chọn phân loại">
        {pickerProduct && (() => {
          const sizes = pickerProduct.sizeInfo ? pickerProduct.sizeInfo.split("/").map(s => s.trim()).filter(Boolean) : [];
          const colors = pickerProduct.color ? pickerProduct.color.split("/").map(c => c.trim()).filter(Boolean) : [];
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {pickerProduct.imageUrl
                  ? <img src={pickerProduct.imageUrl} alt={pickerProduct.productName} className="w-16 h-16 object-cover rounded-lg" />
                  : <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">👗</div>
                }
                <div>
                  <p className="font-semibold text-gray-800">{pickerProduct.productName}</p>
                  <p className="text-indigo-600 font-bold">{formatCurrency(pickerProduct.price)}</p>
                </div>
              </div>
              {sizes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(s => (
                      <button key={s} onClick={() => setPickedSize(s)}
                        className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                          pickedSize === s ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-indigo-300"
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {colors.length > 1 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Màu sắc</p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(c => (
                      <button key={c} onClick={() => setPickedColor(c)}
                        className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                          pickedColor === c ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-indigo-300"
                        }`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" onClick={() => setPickerProduct(null)}>Hủy</Button>
                <Button onClick={confirmPicker}>Thêm vào giỏ</Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Bill Modal */}
      <Modal open={!!billOrder} onClose={() => setBillOrder(null)} title="Hoá đơn thanh toán">
        {billOrder && (
          <div className="space-y-4">
            <div ref={billRef} className="font-mono text-xs p-2">
              <div className="center text-center">
                <p className="bold big font-bold text-base">FORHER</p>
                <p>Thời trang FORHER</p>
                <hr className="border-dashed my-2" />
              </div>
              <div className="flex justify-between"><span>Mã HĐ:</span><span className="font-bold">{billOrder.orderId}</span></div>
              <div className="flex justify-between"><span>Ngày:</span><span>{new Date().toLocaleDateString("vi-VN")}</span></div>
              {billOrder.customer && <div className="flex justify-between"><span>KH:</span><span>{billOrder.customer.fullName}</span></div>}
              <hr className="border-dashed my-2" />
              {billOrder.items.map(item => (
                <div key={item.product.productId}>
                  <p className="truncate">{item.product.productName}</p>
                  <div className="flex justify-between text-gray-600 pl-2">
                    <span>{item.quantity} x {formatCurrency(item.product.price)}</span>
                    <span>{formatCurrency(item.product.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
              <hr className="border-dashed my-2" />
              {billOrder.loyaltyDiscount > 0 && (
                <div className="flex justify-between"><span>Giảm (điểm):</span><span>- {formatCurrency(billOrder.loyaltyDiscount)}</span></div>
              )}
              {billOrder.promoDiscount > 0 && (
                <div className="flex justify-between"><span>Giảm KM ({billOrder.promoCode}):</span><span>- {formatCurrency(billOrder.promoDiscount)}</span></div>
              )}
              <div className="flex justify-between font-bold text-sm">
                <span>TỔNG CỘNG:</span>
                <span>{formatCurrency(billOrder.total)}</span>
              </div>
              <div className="flex justify-between"><span>Thanh toán:</span><span>{billOrder.paymentMethod === "CASH" ? "Tiền mặt" : billOrder.paymentMethod === "TRANSFER" ? "Chuyển khoản" : "Thẻ"}</span></div>
              {billOrder.note && <div className="mt-1 text-gray-500">Ghi chú: {billOrder.note}</div>}
              <hr className="border-dashed my-2" />
              <p className="text-center">Cảm ơn quý khách!</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setBillOrder(null)}>Đóng</Button>
              <Button onClick={handlePrint}><Receipt size={14} /> In hoá đơn</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
