import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-burgundy/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white border border-burgundy/10 rounded-2xl shadow-2xl w-full max-w-[425px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 pb-4 space-y-3">
          <h2 className="text-xl font-heading font-bold text-burgundy pr-8">
            {title}
          </h2>
          <p className="text-burgundy/70 font-body text-sm leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-burgundy/40 hover:text-burgundy hover:bg-rose-gold/10 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 pt-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto px-6 rounded-xl border-burgundy/20 hover:bg-rose-gold/10 text-burgundy"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`w-full sm:w-auto px-6 rounded-xl text-white ${
              variant === 'danger' 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-burgundy hover:bg-burgundy/90'
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
