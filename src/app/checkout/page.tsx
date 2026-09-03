'use client';

import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Truck, CreditCard, ClipboardCheck, Check, ChevronRight, Info, Upload, FileTextIcon, XIcon, Loader2, RefreshCwIcon, FileWarningIcon, CheckIcon, ShoppingBag } from 'lucide-react';
import { useCheckoutLogic } from './useCheckoutLogic';
import PageWrapper from '@/components/layout/PageWrapper';
import { CheckoutShippingStep } from './components/CheckoutShippingStep';
import { CheckoutPaymentStep } from './components/CheckoutPaymentStep';
import { CheckoutReviewStep } from './components/CheckoutReviewStep';
import { CheckoutSuccess } from './components/CheckoutSuccess';
import { OrderSummary } from './components/OrderSummary';
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
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Review', icon: ClipboardCheck },
];

export default function CheckoutPage() {
  const {
    currentStep, orderPlaced, orderId, receiptFile, setReceiptFile, uploadState, setUploadState, uploadProgress, receiptError,
    isSubmitting, hasHydrated, savedAddresses, selectedAddressId, errors, items,
    subtotal, form, shipping, total,
    handleSelectAddress, handleFileChange, retryUpload, updateForm,
    nextStep, prevStep, placeOrder, getInputClass
  } = useCheckoutLogic();

  if (orderPlaced && orderId) {
    return <CheckoutSuccess orderId={orderId} />;
  }

  if (!hasHydrated) {
    return (
      <PageWrapper>
        <div className="pt-28 pb-20 min-h-[60vh] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-burgundy/30" />
        </div>
      </PageWrapper>
    );
  }

  if (hasHydrated && items.length === 0) {
    return (
      <PageWrapper>
        <div className="pt-28 pb-20 min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-20 h-20 bg-champagne/30 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={32} className="text-burgundy/50" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-burgundy mb-4">Your cart is empty</h1>
          <p className="text-burgundy/60 font-body mb-8 max-w-md">
            Add some beautiful pieces before proceeding to checkout.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/shop" className="btn-primary">
              Continue Shopping
            </Link>
            <Link href="/cart" className="btn-secondary">
              View Cart
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl font-bold text-burgundy mb-10"
          >
            Checkout
          </m.h1>

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
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition ${
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
                  <CheckoutShippingStep form={form} updateForm={updateForm} errors={errors} savedAddresses={savedAddresses} selectedAddressId={selectedAddressId} handleSelectAddress={handleSelectAddress} getInputClass={getInputClass} currentStep={currentStep} />
                )}

                

                {/* Step 2: Payment */}
                {currentStep === 2 && (
                  <CheckoutPaymentStep form={form} updateForm={updateForm} currentStep={currentStep} />
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                  <CheckoutReviewStep form={form} receiptFile={receiptFile} uploadState={uploadState} uploadProgress={uploadProgress} handleFileChange={handleFileChange} retryUpload={retryUpload} setReceiptFile={setReceiptFile} setUploadState={setUploadState} receiptError={receiptError} currentStep={currentStep} />
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row-reverse items-stretch sm:items-center justify-between gap-3 sm:gap-4 mt-6">
                {currentStep < 3 ? (
                  <button 
                    onClick={nextStep} 
                    disabled={currentStep === 2 && !form.paymentMethod}
                    className={`btn-primary w-full sm:w-auto justify-center flex items-center gap-2 ${currentStep === 2 && !form.paymentMethod ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>Continue</span>
                    <ChevronRight size={16} className="relative z-10" />
                  </button>
                ) : (
                  <button 
                    onClick={placeOrder} 
                    disabled={!form.paymentMethod || (form.paymentMethod === 'bank_transfer' && uploadState !== 'done') || isSubmitting} 
                    className="btn-primary w-full sm:w-auto justify-center flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmitting ? 'Processing...' : 'Place Order'}</span>
                    {isSubmitting ? <Loader2 size={16} className="relative z-10 animate-spin" /> : <Check size={16} className="relative z-10" />}
                  </button>
                )}
                
                {currentStep > 1 ? (
                  <button onClick={prevStep} className="btn-secondary w-full sm:w-auto text-sm justify-center flex items-center">
                    Back
                  </button>
                ) : (
                  <div className="hidden sm:block" />
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-2">
                <OrderSummary items={items} subtotal={subtotal} shipping={shipping} total={total} />
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
