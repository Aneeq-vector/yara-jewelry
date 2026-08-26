import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Address } from '@/types';
import { useAuthStore } from '@/lib/store/auth-store';
import { getAddressesAction } from '@/app/actions/addresses';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { createOrderAction } from '@/app/actions/orders';

export function useCheckoutLogic() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'error' | 'done'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);
  
  const { user } = useAuthStore();
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { items, getTotal, clearCart, removeItem } = useCartStore();
  const wishlistItems = useWishlistStore(s => s.items);
  const removeFromWishlist = useWishlistStore(s => s.removeItem);
  const subtotal = getTotal();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', street: '', city: '', state: '', zip: '', country: '',
    deliveryMethod: 'standard',
    paymentMethod: '',
  });

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
      if (uploadProgress >= 100) {
        setUploadState('processing');
        return;
      }
      const timeout = setTimeout(() => {
        setUploadProgress(prev => Math.min(prev + 15, 100));
      }, 300);
      return () => clearTimeout(timeout);
    } else if (uploadState === 'processing') {
      const timeout = setTimeout(() => {
        setUploadState('done');
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [uploadState, uploadProgress]);

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
  
  const FREE_DELIVERY_THRESHOLD = 10000;

  const getShippingFee = (method: string) => {
    if (items.length === 0) return 0;
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
    if (items.length === 0) return;
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
    if (isSubmitting || items.length === 0) return;
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('shippingName', form.name);
    formData.append('shippingStreet', form.street);
    formData.append('shippingCity', form.city);
    formData.append('shippingZip', form.zip);
    formData.append('shippingCountry', form.country || 'Sri Lanka');
    formData.append('paymentMethod', form.paymentMethod);
    formData.append('email', form.email);
    formData.append('phone', form.phone);
    
    const productIdsSet = new Set<string>();

    items.forEach(item => {
      if (item.product.category !== 'gift-boxes' && !item.isCustomBox) {
        productIdsSet.add(item.product.id);
      }
      if (item.isCustomBox && item.boxItems) {
        item.boxItems.forEach((b: any) => {
          if (b.id) {
            productIdsSet.add(b.id);
          }
        });
      }
    });
    
    // We pass the raw items to the server for authoritative calculation
    formData.append('cartItems', JSON.stringify(items));
    formData.append('idempotencyKey', idempotencyKey);
    // Also pass deliveryMethod so server knows which shipping fee to apply
    formData.append('deliveryMethod', form.deliveryMethod);

    const productIds = Array.from(productIdsSet);
    productIds.forEach(id => formData.append('items', id));

    const generatedOrderId = `YRA-${Math.floor(100000 + Math.random() * 900000)}`;
    formData.append('orderId', generatedOrderId);
    formData.append('orderDate', new Date().toISOString());
    
    if (form.paymentMethod === 'bank_transfer' && receiptFile) {
      try {
        const { compressImage } = await import('@/lib/image-compression');
        const compressedReceipt = await compressImage(receiptFile);
        formData.append('receipt', compressedReceipt);
      } catch (err) {
        // Fallback to original file if compression fails
        formData.append('receipt', receiptFile);
      }
    }

    try {
      const res = await createOrderAction(formData);
      
      if (res.success) {
        productIds.forEach(id => {
          if (wishlistItems.some(wi => wi.id === id)) {
            removeFromWishlist(id);
          }
        });

        setOrderId(res.orderId || '');
        setOrderPlaced(true);
        clearCart();
        
        // Clear transient state
        setCurrentStep(1);
        setReceiptFile(null);
        setUploadState('idle');
        setUploadProgress(0);
        setIdempotencyKey(crypto.randomUUID());
        setForm(prev => ({
          ...prev,
          deliveryMethod: 'standard',
          paymentMethod: '',
        }));
      } else {
        alert(res.error || "Failed to place order.");
        if (res.removeStaleCartItemId) {
          removeItem(res.removeStaleCartItemId);
          if (items.length <= 1) {
            router.push('/cart');
          }
        }
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (field: string) => `w-full px-4 py-3 rounded-xl bg-transparent border ${errors[field] ? 'border-red-400 focus:border-red-500' : 'border-burgundy/20 focus:border-burgundy'} font-body text-base sm:text-sm text-burgundy placeholder:text-burgundy/50 focus:outline-none transition-colors`;

  return {
    currentStep, setCurrentStep, orderPlaced, setOrderPlaced, orderId,
    receiptFile, setReceiptFile, uploadState, setUploadState, uploadProgress,
    isSubmitting, hasHydrated, user, savedAddresses, selectedAddressId, errors, items,
    subtotal, form, FREE_DELIVERY_THRESHOLD, shipping, total,
    handleSelectAddress, handleFileChange, retryUpload, updateForm,
    nextStep, prevStep, placeOrder, getInputClass
  };
}
