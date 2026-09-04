'use client';

import { getOptimizedImageUrl, isPocketBaseResizable } from '@/lib/image-utils';
import { useState, useEffect, useRef } from 'react';
import { X, Search, Plus, Minus, Trash2, Package, Loader2, CheckCircle, Upload } from 'lucide-react';
import { createManualOrderAction, ManualOrderItem } from '@/app/actions/orders';
import { useProductOptions } from '@/lib/hooks/use-products';
import { getProductColors } from '@/lib/colors';
import { Product } from '@/types';

const SOURCES = ['Instagram', 'Facebook', 'WhatsApp', 'Walk-in', 'Phone Call', 'Other'];
import { getShippingFee } from '@/lib/constants';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order?: any) => void;
}

export function AddOrderModal({ isOpen, onClose, onOrderCreated }: AddOrderModalProps) {
  // Customer
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('Sri Lanka');

  // Order meta
  const [source, setSource] = useState('Instagram');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [notes, setNotes] = useState('');
  const [deductStock, setDeductStock] = useState(true);

  // Products
  const { data: rawProducts, isLoading: productsLoading } = useProductOptions();
  const allProducts = (rawProducts || []) as unknown as Product[];
  const [productSearch, setProductSearch] = useState('');
  // orderItems uses colorQuantities: { Yellow: 2, Green: 5 } or { '': 3 } for no-color products
  const [orderItems, setOrderItems] = useState<ManualOrderItem[]>([]);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  // Fetched by useProductOptions hook

  const resetForm = () => {
    setName(''); setPhone(''); setEmail(''); setCity(''); setAddress(''); setCountry('Sri Lanka');
    setSource('Instagram'); setPaymentMethod('cod'); setPaymentStatus('pending');
    setNotes(''); setDeductStock(true);     setOrderItems([]); setProductSearch('');
    setError(''); setSuccess(false); setShowProductPicker(false);
    setReceiptFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.productCode || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  const addProduct = (product: Product) => {
    const existing = orderItems.findIndex(i => i.productId === product.id);
    if (existing !== -1) {
      // Already added — just open the picker view again (do nothing, it's visible in the list)
      setShowProductPicker(false);
      setProductSearch('');
      return;
    }
    // Build initial colorQuantities:
    // If product has colors, start all at 0 so admin sets counts explicitly
    // If no colors, use '' key with qty 1
    const colorsInfo = getProductColors(product);
    const colorQuantities: Record<string, number> = colorsInfo.length > 0
      ? Object.fromEntries(colorsInfo.map(c => [c.name, 0]))
      : { '': 1 };

    setOrderItems(prev => [...prev, {
      productId: product.id,
      productName: product.name,
      price: product.price,
      colorQuantities,
    }]);
    setShowProductPicker(false);
    setProductSearch('');
  };

  const updateColorQty = (itemIndex: number, color: string, delta: number) => {
    const updated = [...orderItems];
    const item = updated[itemIndex];
    const product = allProducts.find(p => p.id === item.productId);
    
    const current = item.colorQuantities[color] ?? 0;
    
    let maxAllowed = Infinity;
    if (deductStock && product) {
       if (product.inventoryMode === 'color') {
          maxAllowed = product.colorStock?.[color] ?? 0;
       } else {
          maxAllowed = product.quantity;
       }
    }
    
    // Also consider other colors sharing the global stock if inventoryMode === 'global'
    if (deductStock && product && product.inventoryMode !== 'color') {
       const otherColorsTotal = Object.entries(item.colorQuantities).filter(([k]) => k !== color).reduce((s, [_, q]) => s + q, 0);
       maxAllowed = Math.max(0, product.quantity - otherColorsTotal);
    }
    
    const newQty = Math.max(0, Math.min(current + delta, maxAllowed));
    
    updated[itemIndex].colorQuantities = {
      ...item.colorQuantities,
      [color]: newQty,
    };
    setOrderItems(updated);
  };

  const removeItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  // Total quantity for a single item across all colors
  const itemTotalQty = (item: ManualOrderItem) =>
    Object.values(item.colorQuantities).reduce((s, q) => s + q, 0);

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * itemTotalQty(i), 0);
  const total = subtotal + getShippingFee(subtotal);

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Customer name is required.'); return; }
    if (!phone.trim()) { setError('Phone number is required.'); return; }
    if (!city.trim()) { setError('City is required.'); return; }
    if (orderItems.length === 0) { setError('Please add at least one product.'); return; }
    const hasQty = orderItems.some(i => itemTotalQty(i) > 0);
    if (!hasQty) { setError('Please set a quantity for at least one product/color.'); return; }

    setError('');
    setSubmitting(true);

    const result = await createManualOrderAction({
      shippingName: name.trim(),
      shippingPhone: phone.trim(),
      shippingEmail: email.trim() || undefined,
      shippingStreet: address.trim() || undefined,
      shippingCity: city.trim(),
      shippingCountry: country || 'Sri Lanka',
      source,
      items: orderItems.filter(i => itemTotalQty(i) > 0),
      totalAmount: total,
      paymentMethod,
      paymentStatus,
      notes: notes.trim() || undefined,
      deductStock,
      receiptFile: receiptFile || undefined,
      idempotencyKey,
    });

    setSubmitting(false);

    if (result.success) {
      setSuccess(true);
      onOrderCreated(result.record);
      // Re-roll idempotency key for the next potential order
      setIdempotencyKey(crypto.randomUUID());
      setTimeout(() => handleClose(), 1800);
    } else {
      setError(result.error || 'Failed to create order.');
    }
  };

  if (!isOpen) return null;

  const inputClass = 'w-full bg-ivory/40 border border-burgundy/15 rounded-xl px-3.5 py-2.5 text-sm text-burgundy placeholder:text-burgundy/40 focus:outline-none focus:border-burgundy/40 focus:bg-white transition-colors font-body';
  const labelClass = 'block text-[11px] font-ui font-bold uppercase tracking-wider text-burgundy/50 mb-1.5';

  return (
    <div className="fixed inset-0 bg-burgundy/40 backdrop-blur-sm z-50 flex items-start justify-end" onClick={handleClose}>
      <div className="relative bg-white h-full w-full max-w-xl shadow-2xl overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-burgundy/8 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-xl text-burgundy">Add Manual Order</h2>
            <p className="text-xs text-burgundy/50 font-body mt-0.5">For Instagram, Facebook, WhatsApp & walk-in orders</p>
          </div>
          <button onClick={handleClose} className="p-2 text-burgundy/40 hover:text-burgundy hover:bg-champagne/50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle className="text-emerald-500" size={36} />
            </div>
            <h3 className="font-heading font-bold text-lg text-burgundy">Order Created!</h3>
            <p className="text-sm text-burgundy/60 font-body text-center">The order has been saved and stock has been updated.</p>
          </div>
        ) : (
          <div className="flex-1 p-6 space-y-6">

            {/* Source */}
            <div>
              <label className={labelClass}>Order Source</label>
              <div className="flex flex-wrap gap-2">
                {SOURCES.map(s => (
                  <button key={s} onClick={() => setSource(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-ui font-semibold transition-all border ${source === s ? 'bg-burgundy text-white border-burgundy shadow-sm' : 'bg-ivory/60 text-burgundy/60 border-burgundy/15 hover:border-burgundy/30 hover:text-burgundy'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <p className={labelClass + ' mb-3'}>Customer Information</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelClass}>Name <span className="text-rose-500">*</span></label>
                  <input className={inputClass} placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Phone <span className="text-rose-500">*</span></label>
                  <input className={inputClass} placeholder="+94 77 123 4567" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Email <span className="text-burgundy/30">(optional)</span></label>
                  <input className={inputClass} placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>City <span className="text-rose-500">*</span></label>
                  <input className={inputClass} placeholder="Colombo" value={city} onChange={e => setCity(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input className={inputClass} placeholder="Sri Lanka" value={country} onChange={e => setCountry(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Address <span className="text-burgundy/30">(optional)</span></label>
                  <input className={inputClass} placeholder="Street address" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className={labelClass + ' mb-0'}>Products</p>
                <button onClick={() => setShowProductPicker(prev => !prev)}
                  className="flex items-center gap-1.5 text-xs font-ui font-semibold text-burgundy hover:text-wine transition-colors">
                  <Plus size={14} /> Add Product
                </button>
              </div>

              {/* Product Picker Dropdown */}
              {showProductPicker && (
                <div className="mb-3 border border-burgundy/15 rounded-xl overflow-hidden bg-white shadow-lg">
                  <div className="flex items-center gap-2 p-3 border-b border-burgundy/8">
                    <Search size={14} className="text-burgundy/40" />
                    <input autoFocus
                      className="flex-1 text-sm text-burgundy bg-transparent outline-none placeholder:text-burgundy/40 font-body"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)} />
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {productsLoading ? (
                      <div className="flex items-center justify-center p-6">
                        <Loader2 size={20} className="animate-spin text-burgundy/40" />
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <p className="text-center text-sm text-burgundy/40 p-6 font-body">No products found</p>
                    ) : (
                      filteredProducts.map(product => (
                        <button key={product.id} onClick={() => addProduct(product)}
                          disabled={product.quantity <= 0}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left border-b border-burgundy/5 last:border-0 ${product.quantity <= 0 ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-ivory/60'}`}>
                          {product.images?.[0] && (
                            <img src={product.images[0]} alt={product.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-ivory" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-body font-medium text-burgundy truncate">{product.name}</p>
                            <p className="text-xs text-burgundy/50">Rs. {product.price.toLocaleString()}</p>
                          </div>
                          {product.quantity <= 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100 font-ui flex-shrink-0">Out of stock</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              {orderItems.length === 0 ? (
                <div className="border-2 border-dashed border-burgundy/10 rounded-xl p-6 text-center">
                  <Package size={24} className="mx-auto text-burgundy/20 mb-2" />
                  <p className="text-sm text-burgundy/40 font-body">No products added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item, idx) => {
                    const productData = allProducts.find(p => p.id === item.productId);
                    const hasColors = Object.keys(item.colorQuantities).some(k => k !== '');
                    const totalQty = itemTotalQty(item);

                    return (
                      <div key={idx} className="bg-ivory/40 border border-burgundy/8 rounded-xl p-3">
                        {/* Product header */}
                        <div className="flex items-start gap-3 mb-3">
                          {productData?.images?.[0] && (
                            <img src={productData.images[0]} alt={item.productName} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-body font-medium text-burgundy truncate">{item.productName}</p>
                            <p className="text-xs text-burgundy/50">Rs. {item.price.toLocaleString()} each</p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            {totalQty > 0 && (
                              <span className="text-sm font-ui font-bold text-burgundy">
                                Rs. {(item.price * totalQty).toLocaleString()}
                              </span>
                            )}
                            <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Per-color quantity rows */}
                        <div className="space-y-2">
                          {Object.entries(item.colorQuantities).map(([color, qty]) => {
                            const isOutOfStock = deductStock && color !== '' && productData?.inventoryMode === 'color' && (productData.colorStock?.[color] || 0) <= 0;
                            const maxStock = color !== '' && productData?.inventoryMode === 'color' ? (productData.colorStock?.[color] || 0) : (productData?.quantity || 0);

                            return (
                            <div key={color} className={`flex items-center justify-between ${isOutOfStock ? 'opacity-50' : ''}`}>
                              {hasColors ? (
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-ui font-semibold px-2.5 py-1 rounded-full border ${qty > 0 ? 'bg-burgundy text-white border-burgundy' : 'text-burgundy/50 border-burgundy/20 bg-white'}`}>
                                    {color}
                                  </span>
                                  {isOutOfStock && <span className="text-[10px] text-red-500 font-ui font-bold">Out of stock</span>}
                                </div>
                              ) : (
                                <span className="text-xs font-body text-burgundy/50">Quantity</span>
                              )}
                              <div className="flex items-center gap-2.5">
                                <button
                                  onClick={() => updateColorQty(idx, color, -1)}
                                  className="w-6 h-6 rounded-full bg-white border border-burgundy/15 text-burgundy hover:bg-burgundy hover:text-white transition-colors flex items-center justify-center disabled:opacity-30"
                                  disabled={isOutOfStock}
                                >
                                  <Minus size={11} />
                                </button>
                                <span className="text-sm font-ui font-bold text-burgundy w-6 text-center">{qty}</span>
                                <button
                                  onClick={() => updateColorQty(idx, color, 1)}
                                  className="w-6 h-6 rounded-full bg-white border border-burgundy/15 text-burgundy hover:bg-burgundy hover:text-white transition-colors flex items-center justify-center disabled:opacity-30"
                                  disabled={isOutOfStock || (deductStock && qty >= maxStock)}
                                >
                                  <Plus size={11} />
                                </button>
                                {hasColors && qty > 0 && (
                                  <span className="text-xs text-burgundy/40 font-body w-16 text-right">
                                    Rs. {(item.price * qty).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          )})}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Summary */}
            {orderItems.some(i => itemTotalQty(i) > 0) && (
              <div className="bg-ivory/50 border border-burgundy/8 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm font-body text-burgundy/70">
                  <span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-body text-burgundy/70">
                  <span>Delivery fee</span>
                  <span>{getShippingFee(subtotal) === 0 ? 'Free' : `Rs. ${getShippingFee(subtotal).toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-base font-ui font-bold text-burgundy border-t border-burgundy/10 pt-2">
                  <span>Total</span><span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Payment Method</label>
                <select className={inputClass} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as 'cod' | 'bank_transfer')}>
                  <option value="cod">Cash on Delivery</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Payment Status</label>
                <select className={inputClass} value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as 'pending' | 'paid')}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            {/* Receipt Upload — shown only for bank transfer */}
            {paymentMethod === 'bank_transfer' && (
              <div>
                <label className={labelClass}>Payment Receipt <span className="text-burgundy/30">(optional)</span></label>
                <div
                  onClick={() => receiptInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                    receiptFile ? 'border-emerald-300 bg-emerald-50' : 'border-burgundy/15 hover:border-burgundy/30 bg-ivory/30'
                  }`}
                >
                  <input
                    ref={receiptInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                  />
                  {receiptFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                        <span className="text-sm text-emerald-700 font-body truncate max-w-[220px]">{receiptFile.name}</span>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setReceiptFile(null); if (receiptInputRef.current) receiptInputRef.current.value = ''; }}
                        className="text-burgundy/40 hover:text-red-500 transition-colors ml-2"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload size={18} className="text-burgundy/30" />
                      <p className="text-xs text-burgundy/50 font-body">Click to upload receipt (image or PDF)</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className={labelClass}>Notes <span className="text-burgundy/30">(optional)</span></label>
              <textarea
                className={inputClass + ' resize-none h-20'}
                placeholder="Special instructions, DM handle, reference, etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Stock toggle */}
            <label className="flex items-start gap-3 cursor-pointer bg-amber-50 border border-amber-200/60 rounded-xl p-3.5">
              <input type="checkbox" checked={deductStock} onChange={e => setDeductStock(e.target.checked)} className="mt-0.5 accent-burgundy" />
              <div>
                <p className="text-sm font-ui font-semibold text-burgundy">Deduct from stock</p>
                <p className="text-xs text-burgundy/50 font-body mt-0.5">Automatically reduce product quantities in inventory after placing this order.</p>
              </div>
            </label>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-body">{error}</div>
            )}
          </div>
        )}

        {/* Footer */}
        {!success && (
          <div className="sticky bottom-0 bg-white border-t border-burgundy/8 p-4 flex gap-3">
            <button onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border border-burgundy/20 text-burgundy text-sm font-ui font-semibold hover:bg-ivory transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-burgundy text-white text-sm font-ui font-semibold hover:bg-wine transition-colors shadow-md shadow-burgundy/20 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 size={15} className="animate-spin" /> Creating...</> : 'Create Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
