'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Truck, CreditCard, ClipboardCheck, Check, ChevronRight, Info, Upload, FileTextIcon, XIcon, Loader2, RefreshCwIcon, FileWarningIcon, CheckIcon } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { formatPrice } from '@/lib/utils';
import { COUNTRIES } from '@/lib/countries';
import { getAddressesAction } from '@/app/actions/addresses';
import { createOrderAction } from '@/app/actions/orders';
import { Address } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";

const steps = [
  { id: 1, label: 'Shipping', icon: MapPin },
  { id: 2, label: 'Delivery', icon: Truck },
  { id: 3, label: 'Payment', icon: CreditCard },
  { id: 4, label: 'Review', icon: ClipboardCheck },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'error' | 'done'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuthStore();
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        email: prev.email || user.email || '',
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    getAddressesAction().then(res => {
      if (res.success && res.addresses) {
        setSavedAddresses(res.addresses);
        const def = res.addresses.find(a => a.isDefault);
        if (def) {
          handleSelectAddress(def);
        }
      }
    });
  }, []);

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setForm(prev => ({
      ...prev,
      name: addr.name,
      phone: addr.phone || '',
      street: addr.street,
      city: addr.city,
      state: addr.state || '',
      zip: addr.zipCode,
      country: addr.country || 'Sri Lanka',
    }));
    setErrors({});
  };

  useEffect(() => {
    if (uploadState === 'uploading') {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploadState('processing');
            return 100;
          }
          return prev + 15;
        });
      }, 300);
      return () => clearInterval(interval);
    } else if (uploadState === 'processing') {
      const timeout = setTimeout(() => {
        setUploadState('done');
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [uploadState]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
      setUploadState('uploading');
      setUploadProgress(0);
    }
  };

  const retryUpload = () => {
    setUploadState('uploading');
    setUploadProgress(0);
  };
  const { items, getTotal, clearCart } = useCartStore();
  const wishlistItems = useWishlistStore(s => s.items);
  const removeFromWishlist = useWishlistStore(s => s.removeItem);
  const subtotal = getTotal();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', street: '', city: '', state: '', zip: '', country: '',
    deliveryMethod: 'standard',
    paymentMethod: '',
  });

  const FREE_DELIVERY_THRESHOLD = 10000;

  const getShippingFee = (method: string) => {
    if (subtotal >= FREE_DELIVERY_THRESHOLD && method === 'standard') return 0;
    switch (method) {
      case 'standard': return 450;
      case 'express': return 1000;
      case 'premium': return 1450;
      default: return 450;
    }
  };

  const shipping = getShippingFee(form.deliveryMethod);
  const total = subtotal + shipping;

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const nextStep = () => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!form.name) newErrors.name = 'Required';
      if (!form.phone) newErrors.phone = 'Required';
      if (!form.street) newErrors.street = 'Required';
      if (!form.city) newErrors.city = 'Required';
      if (!form.state) newErrors.state = 'Required';
      if (!form.zip) newErrors.zip = 'Required';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }
    if (currentStep === 3) {
      if (!form.paymentMethod) {
        alert("Please select a payment method to continue.");
        return;
      }
    }
    setErrors({});
    setCurrentStep((s) => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const prevStep = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const placeOrder = async () => {
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('totalAmount', total.toString());
    formData.append('shippingName', form.name);
    formData.append('shippingStreet', form.street);
    formData.append('shippingCity', form.city);
    formData.append('shippingZip', form.zip);
    formData.append('shippingCountry', form.country || 'Sri Lanka');
    formData.append('paymentMethod', form.paymentMethod);
    
    const productIds = Array.from(new Set(
      items
        .filter(item => item.product.category !== 'gift-boxes' && !item.isCustomBox)
        .map(item => item.product.id)
    ));
    productIds.forEach(id => formData.append('items', id));
    
    const formattedCartDetails = items.map(item => {
      if (item.isCustomBox) {
        const boxItemsStr = item.boxItems?.map((b: any) => {
          const colorStr = b.selectedColor ? ` (${b.selectedColor})` : '';
          return `${b.name}${colorStr}`;
        }).join(', ');
        return `${item.quantity}x Custom Box (Rs. ${item.customPrice ?? item.product.price}) - Items: ${boxItemsStr}`;
      }
      
      const extras = [
        item.selectedColor ? `Color: ${item.selectedColor}` : '',
        item.product.material ? `Material: ${item.product.material}` : '',
        item.product.weight ? `Weight: ${item.product.weight}` : ''
      ].filter(Boolean).join(', ');
      
      const extraDetails = extras ? ` [${extras}]` : '';
      const codeStr = item.product.productCode ? ` (${item.product.productCode})` : '';
      return `${item.quantity}x ${item.product.name}${codeStr}${extraDetails} - Rs. ${item.customPrice ?? item.product.price}`;
    });
    
    formData.append('cartDetails', JSON.stringify(formattedCartDetails));

    const generatedOrderId = `YRA-${Math.floor(100000 + Math.random() * 900000)}`;
    formData.append('orderId', generatedOrderId);
    formData.append('orderDate', new Date().toISOString());
    
    if (form.paymentMethod === 'bank_transfer' && receiptFile) {
      formData.append('receipt', receiptFile);
    }

    try {
      const res = await createOrderAction(formData);
      
      if (res.success) {
        // Remove purchased items from wishlist
        productIds.forEach(id => {
          if (wishlistItems.some(wi => wi.id === id)) {
            removeFromWishlist(id);
          }
        });

        setOrderId(res.orderId || '');
        setOrderPlaced(true);
        clearCart();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(res.error || "Failed to place order.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <PageWrapper>
        <div className="pt-32 pb-20 text-center max-w-lg mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <div className="w-24 h-24 rounded-full gradient-rose-gold flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-white" />
            </div>
            <h1 className="font-heading text-4xl font-bold text-burgundy mb-3">Order Placed!</h1>
            <p className="font-body text-burgundy/50 mb-2">Thank you for shopping with Yara.</p>
            <p className="font-body text-sm text-burgundy/40 mb-8">
              Order #{orderId} — A confirmation email has been sent.
            </p>
            <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
              <span>Continue Shopping</span>
            </Link>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <PageWrapper>
        <div className="pt-32 pb-20 text-center px-4">
          <h1 className="font-heading text-3xl font-bold text-burgundy mb-4">Your cart is empty</h1>
          <Link href="/shop" className="btn-primary inline-block"><span>Go Shopping</span></Link>
        </div>
      </PageWrapper>
    );
  }

  const getInputClass = (field: string) => `w-full px-4 py-3 rounded-xl bg-transparent border ${errors[field] ? 'border-red-400 focus:border-red-500' : 'border-burgundy/20 focus:border-burgundy'} font-body text-sm text-burgundy placeholder:text-burgundy/50 focus:outline-none transition-colors`;

  return (
    <PageWrapper>
      <div className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl font-bold text-burgundy mb-10"
          >
            Checkout
          </motion.h1>

          {/* Steps Indicator */}
          <div className="flex items-center justify-between mb-12 max-w-lg mx-auto">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'gradient-rose-gold text-white'
                          : isActive
                          ? 'gradient-burgundy text-ivory'
                          : 'bg-champagne/50 text-burgundy/30'
                      }`}
                    >
                      {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                    </div>
                    <span className={`font-ui text-[10px] font-semibold uppercase tracking-wider mt-2 ${
                      isActive || isCompleted ? 'text-burgundy' : 'text-burgundy/30'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-8 sm:w-16 h-0.5 mx-2 rounded-full transition-colors ${
                      step.id < currentStep ? 'gradient-rose-gold' : 'bg-nude/40'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {/* Step 1: Shipping */}
                {currentStep === 1 && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="glass-card rounded-3xl p-6 sm:p-8"
                  >
                    <h2 className="font-heading text-xl font-bold text-burgundy mb-6">Shipping Address</h2>
                    
                    {savedAddresses.length > 0 && (
                      <div className="mb-6">
                        <label className="font-ui text-sm font-semibold text-burgundy mb-3 block">Saved Addresses</label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {savedAddresses.map(addr => (
                            <button
                              key={addr.id}
                              onClick={() => handleSelectAddress(addr)}
                              className={`text-left p-3 rounded-xl border transition-all ${
                                selectedAddressId === addr.id 
                                  ? 'border-burgundy bg-burgundy/5' 
                                  : 'border-burgundy/10 hover:border-burgundy/30'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin size={14} className={selectedAddressId === addr.id ? 'text-burgundy' : 'text-burgundy/50'} />
                                <span className="font-ui font-bold text-sm text-burgundy">{addr.name}</span>
                                {addr.isDefault && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-rose-gold bg-rose-gold/10 px-2 py-0.5 rounded-full">Default</span>}
                              </div>
                              <p className="font-body text-xs text-burgundy/70 truncate">{addr.street}, {addr.city}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <input value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Full Name" className={getInputClass('name')} />
                        {errors.name && <p className="text-red-400 text-xs mt-1 ml-1 font-body">{errors.name}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <input value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="Email" type="email" className={getInputClass('email')} />
                        {errors.email && <p className="text-red-400 text-xs mt-1 ml-1 font-body">{errors.email}</p>}
                      </div>
                      <div>
                        <input value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="Phone Number" className={getInputClass('phone')} />
                        {errors.phone && <p className="text-red-400 text-xs mt-1 ml-1 font-body">{errors.phone}</p>}
                      </div>
                      <div>
                        <Select value={form.country} onValueChange={(val) => updateForm('country', val || '')}>
                          <SelectTrigger className={getInputClass('country')}>
                            <SelectValue placeholder="Country" />
                          </SelectTrigger>
                          <SelectContent alignItemWithTrigger={false} sideOffset={8} className="bg-ivory border border-burgundy/10 shadow-xl rounded-2xl z-[100] outline-none focus:outline-none overflow-hidden p-0">
                            <ScrollArea className="h-64 rounded-2xl">
                              <div className="p-1.5">
                                {COUNTRIES.map((c) => (
                                  <SelectItem key={c} value={c} className="font-body text-sm text-burgundy cursor-pointer focus:bg-champagne/50 focus:text-burgundy rounded-xl pl-3 pr-8 py-2.5 transition-colors">
                                    {c}
                                  </SelectItem>
                                ))}
                              </div>
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <input value={form.street} onChange={(e) => updateForm('street', e.target.value)} placeholder="Delivery Address" className={getInputClass('street')} />
                        {errors.street && <p className="text-red-400 text-xs mt-1 ml-1 font-body">{errors.street}</p>}
                      </div>
                      <div>
                        <input value={form.city} onChange={(e) => updateForm('city', e.target.value)} placeholder="City" className={getInputClass('city')} />
                        {errors.city && <p className="text-red-400 text-xs mt-1 ml-1 font-body">{errors.city}</p>}
                      </div>
                      <div>
                        <input value={form.state} onChange={(e) => updateForm('state', e.target.value)} placeholder="Province" className={getInputClass('state')} />
                        {errors.state && <p className="text-red-400 text-xs mt-1 ml-1 font-body">{errors.state}</p>}
                      </div>
                      <div>
                        <input value={form.zip} onChange={(e) => updateForm('zip', e.target.value)} placeholder="ZIP Code" className={getInputClass('zip')} />
                        {errors.zip && <p className="text-red-400 text-xs mt-1 ml-1 font-body">{errors.zip}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Delivery */}
                {currentStep === 2 && (
                  <motion.div
                    key="delivery"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="glass-card rounded-3xl p-6 sm:p-8"
                  >
                    <h2 className="font-heading text-xl font-bold text-burgundy mb-6">Delivery Method</h2>
                    <div className="space-y-3">
                      {[
                        { id: 'standard', label: 'Standard Delivery', time: '5-7 business days', price: subtotal >= FREE_DELIVERY_THRESHOLD ? 'Free' : 'Rs. 450' },
                        { id: 'express', label: 'Express Delivery', time: '2-3 business days', price: 'Rs. 1,000' },
                        { id: 'premium', label: 'Premium Delivery', time: 'Within Colombo', price: 'Rs. 1,450' },
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => updateForm('deliveryMethod', method.id)}
                          className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
                            form.deliveryMethod === method.id
                              ? 'border-burgundy bg-burgundy/5'
                              : 'border-nude/30 hover:border-burgundy/20'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              form.deliveryMethod === method.id ? 'border-burgundy' : 'border-nude'
                            }`}>
                              {form.deliveryMethod === method.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-burgundy" />
                              )}
                            </div>
                            <div className="text-left">
                              <p className="font-ui font-semibold text-sm text-burgundy">{method.label}</p>
                              <p className="font-body text-xs text-burgundy/40">{method.time}</p>
                            </div>
                          </div>
                          <span className="font-ui font-bold text-sm text-burgundy">{method.price}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 3 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="glass-card rounded-3xl p-6 sm:p-8"
                  >
                    <h2 className="font-heading text-xl font-bold text-burgundy mb-6">Payment Details</h2>
                    <RadioGroup 
                      value={form.paymentMethod} 
                      onValueChange={(val) => updateForm('paymentMethod', val)} 
                      className="gap-4"
                    >
                      {/* Bank Transfer */}
                      <label 
                        htmlFor="bank_transfer" 
                        className={`relative flex flex-col cursor-pointer rounded-2xl border p-5 shadow-sm transition-all focus:outline-none ${form.paymentMethod === 'bank_transfer' ? 'border-burgundy bg-burgundy/5' : 'border-nude/30 hover:border-burgundy/20'}`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-4">
                            <RadioGroupItem value="bank_transfer" id="bank_transfer" className="border-burgundy/50 text-burgundy" />
                            <span className="font-ui font-semibold text-sm text-burgundy">Bank transfer</span>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {form.paymentMethod === 'bank_transfer' && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0, marginTop: 0 }}
                              animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-8 space-y-2">
                                <p className="font-body text-xs text-burgundy/70 mb-2">Please transfer the total amount to the following bank account:</p>
                                <div className="grid grid-cols-2 gap-2 font-body text-sm text-burgundy bg-white/50 p-3 rounded-xl border border-burgundy/10">
                                  <span className="text-burgundy/50">Bank Name</span>
                                  <span className="font-medium">Commercial Bank</span>
                                  
                                  <span className="text-burgundy/50">Account Name</span>
                                  <span className="font-medium">Yara Jewelry</span>
                                  
                                  <span className="text-burgundy/50">Account Number</span>
                                  <span className="font-medium">100 234 5678</span>
                                  
                                  <span className="text-burgundy/50">Branch</span>
                                  <span className="font-medium">Colombo 03</span>
                                </div>
                                <div className="mt-4 p-3 bg-rose-gold/20 border border-burgundy/20 rounded-xl flex items-start gap-3 shadow-inner">
                                  <div className="text-burgundy/70 mt-0.5"><Info size={16} /></div>
                                  <p className="font-body text-xs text-burgundy/80 leading-relaxed">
                                    <strong className="font-ui font-semibold text-burgundy">Important Note:</strong> You will need to upload your payment receipt on the next page to complete your order.
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </label>

                      {/* Cash on Delivery */}
                      <label 
                        htmlFor="cod" 
                        className={`relative flex flex-col cursor-not-allowed rounded-2xl border p-5 shadow-sm transition-all focus:outline-none opacity-60 border-nude/30 hover:border-burgundy/20`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-4">
                            <RadioGroupItem disabled value="cod" id="cod" className="border-burgundy/50 text-burgundy disabled:opacity-100" />
                            <div className="flex flex-col">
                              <span className="font-ui font-semibold text-sm text-burgundy">Cash on Delivery</span>
                              <span className="font-body text-xs text-burgundy/60 mt-1">Available after three orders completed.</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    </RadioGroup>
                    <p className="font-body text-xs text-burgundy/30 mt-4 flex items-center gap-1">
                      <CreditCard size={12} /> Your payment information is secure and encrypted.
                    </p>
                  </motion.div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="glass-card rounded-3xl p-6 sm:p-8"
                  >
                    <h2 className="font-heading text-xl font-bold text-burgundy mb-6">Review Order</h2>
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-champagne/20 border border-nude/20">
                        <h4 className="font-ui font-semibold text-xs uppercase tracking-wider text-burgundy/50 mb-2">Shipping To</h4>
                        <p className="font-body text-sm text-burgundy">{form.name}</p>
                        <p className="font-body text-sm text-burgundy/60">{form.street}, {form.city}, {form.state} {form.zip}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-champagne/20 border border-nude/20">
                        <h4 className="font-ui font-semibold text-xs uppercase tracking-wider text-burgundy/50 mb-2">Delivery</h4>
                        <p className="font-body text-sm text-burgundy capitalize">{form.deliveryMethod} Delivery</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-champagne/20 border border-nude/20">
                        <h4 className="font-ui font-semibold text-xs uppercase tracking-wider text-burgundy/50 mb-2">Payment</h4>
                        <p className="font-body text-sm text-burgundy">{form.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}</p>
                      </div>
                      {form.paymentMethod === 'bank_transfer' && (
                        <div className="p-4 rounded-2xl bg-champagne/20 border border-nude/20">
                          <h4 className="font-ui font-semibold text-xs uppercase tracking-wider text-burgundy/50 mb-3">Upload Payment Receipt</h4>
                          {!receiptFile ? (
                            <div className="flex items-center justify-center w-full">
                              <label htmlFor="receipt-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-burgundy/20 rounded-xl cursor-pointer bg-white/50 hover:bg-rose-gold/10 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-burgundy/60">
                                  <Upload size={24} className="mb-2" />
                                  <p className="mb-1 text-sm font-body"><span className="font-semibold text-burgundy">Click to upload</span> or drag and drop</p>
                                  <p className="text-xs font-body opacity-70">PNG, JPG or PDF (MAX. 5MB)</p>
                                </div>
                                <input id="receipt-upload" type="file" className="hidden" accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileChange} />
                              </label>
                            </div>
                          ) : (
                            <Attachment size="default" state={uploadState} className="w-full bg-white">
                              <AttachmentMedia>
                                {uploadState === 'uploading' && <Loader2 className="animate-spin text-burgundy" />}
                                {uploadState === 'processing' && <FileTextIcon className="text-burgundy" />}
                                {uploadState === 'error' && <FileWarningIcon />}
                                {uploadState === 'done' && <CheckIcon className="text-burgundy" />}
                                {uploadState === 'idle' && <FileTextIcon className="text-burgundy" />}
                              </AttachmentMedia>
                              <AttachmentContent>
                                <AttachmentTitle className={uploadState === 'error' ? 'text-destructive' : 'text-burgundy'}>
                                  {receiptFile.name}
                                </AttachmentTitle>
                                <AttachmentDescription className={uploadState === 'error' ? 'text-destructive/80' : 'text-burgundy/60'}>
                                  {uploadState === 'uploading' && `Uploading · ${Math.min(uploadProgress, 100)}%`}
                                  {uploadState === 'processing' && 'Processing document'}
                                  {uploadState === 'error' && 'Upload failed. Try again.'}
                                  {uploadState === 'done' && `Uploaded · ${(receiptFile.size / (1024 * 1024)).toFixed(2)} MB`}
                                </AttachmentDescription>
                              </AttachmentContent>
                              <AttachmentActions>
                                {uploadState === 'error' && (
                                  <AttachmentAction onClick={retryUpload} aria-label="Retry upload" className="text-destructive hover:bg-destructive/10">
                                    <RefreshCwIcon />
                                  </AttachmentAction>
                                )}
                                <AttachmentAction 
                                  onClick={() => { setReceiptFile(null); setUploadState('idle'); }} 
                                  aria-label="Remove receipt"
                                  className={uploadState === 'error' ? 'text-destructive hover:bg-destructive/10' : 'text-burgundy hover:bg-rose-gold/20'}
                                >
                                  <XIcon />
                                </AttachmentAction>
                              </AttachmentActions>
                            </Attachment>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6">
                {currentStep > 1 ? (
                  <button onClick={prevStep} className="btn-secondary text-sm">
                    Back
                  </button>
                ) : (
                  <div />
                )}
                {currentStep < 4 ? (
                  <button 
                    onClick={nextStep} 
                    disabled={currentStep === 3 && !form.paymentMethod}
                    className={`btn-primary flex items-center gap-2 ${currentStep === 3 && !form.paymentMethod ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>Continue</span>
                    <ChevronRight size={16} className="relative z-10" />
                  </button>
                ) : (
                  <button 
                    onClick={placeOrder} 
                    disabled={!form.paymentMethod || (form.paymentMethod === 'bank_transfer' && uploadState !== 'done') || isSubmitting} 
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmitting ? 'Processing...' : 'Place Order'}</span>
                    {isSubmitting ? <Loader2 size={16} className="relative z-10 animate-spin" /> : <Check size={16} className="relative z-10" />}
                  </button>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-3xl p-6 sticky top-28">
                <h3 className="font-heading text-lg font-bold text-burgundy mb-4">Order Summary</h3>
                <ScrollArea className="h-48 mb-4 pr-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.cartItemId} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-champagne/30 overflow-hidden flex-shrink-0">
                          <Image src={item.product.images[0]} alt="" fill className="object-cover" unoptimized />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-ui text-xs font-semibold text-burgundy truncate">{item.product.name}</p>
                          {item.isCustomBox ? (
                            <p className="font-body text-[10px] text-burgundy/40">
                              Qty: {item.quantity} • {item.boxItems?.length || 0} items
                            </p>
                          ) : (
                            <p className="font-body text-[10px] text-burgundy/40">
                              Qty: {item.quantity}{item.selectedColor ? ` • ${item.selectedColor}` : ''}
                            </p>
                          )}
                        </div>
                        <span className="font-ui text-xs font-bold text-burgundy">
                          {formatPrice((item.customPrice ?? item.product.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-t border-nude/30 pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-body text-sm text-burgundy/50">Subtotal</span>
                    <span className="font-ui text-sm font-semibold text-burgundy">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body text-sm text-burgundy/50">Delivery</span>
                    <span className="font-ui text-sm font-semibold text-burgundy">
                      {shipping === 0 ? (
                        <span className="flex items-center gap-2">
                          <span className="line-through text-burgundy/40 opacity-70">Rs. 450</span>
                          <span>Free</span>
                        </span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-nude/30">
                    <span className="font-ui font-bold text-burgundy">Total</span>
                    <span className="font-ui font-bold text-xl text-burgundy">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
