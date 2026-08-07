'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, Loader2, Save, X } from 'lucide-react';
import { createClient } from '@/lib/pocketbase';
import { createProductWithFilesAction } from '@/app/actions/products';
import { getAllProducts } from '@/lib/data/products';
import { ProductFormUI } from './components/ProductFormUI';

interface Category {
  id: string;
  name: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    productCode: 'Loading...',
    price: '',
    originalPrice: '',
    category: '',
    inStock: true,
    badge: '',
    shortDescription: '',
    description: '',
    material: '',
    weight: '',
    colors: [] as string[],
    tags: [] as string[],
    rating: 1,
    reviewCount: 0
  });
  
  const imageFiles = useRef<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    // Fetch categories and max product code
    async function loadInitialData() {
      try {
        const pb = createClient();
        
        // Load categories
        const categoryRecords = await pb.collection('categories').getFullList({ sort: 'name' });
        setCategories(categoryRecords.map(r => ({ id: r.id, name: r.name })));

        // Load highest product code using data helper which handles cache busting
        const allProducts = await getAllProducts();
        
        let nextCodeNum = 1001; // fallback
        const yaraCodes = allProducts.reduce((acc: string[], r) => {
          if (r.productCode && r.productCode.startsWith('YARA-')) {
            acc.push(r.productCode);
          }
          return acc;
        }, []);

        
        if (yaraCodes.length > 0) {
          // Find max number
          const maxNum = Math.max(...yaraCodes.map(c => parseInt(c.replace('YARA-', ''), 10) || 0));
          if (maxNum >= 1000) {
            nextCodeNum = maxNum + 1;
          }
        }
        
        setFormData(prev => ({ ...prev, productCode: `YARA-${nextCodeNum}` }));
      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    }
    loadInitialData();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({ ...prev, name }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      imageFiles.current.push(...filesArray);
      
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    imageFiles.current = imageFiles.current.filter((_: any, i: number) => i !== index);
    setImagePreviews(prev => prev.filter((_: any, i: number) => i !== index));
  };

  useEffect(() => {
    // Empty cleanup since we no longer use ObjectURLs
  }, [imagePreviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const pb = createClient();
      const submitData = new FormData();

      // Basic Fields
      submitData.append('name', formData.name);
      submitData.append('productCode', formData.productCode);
      submitData.append('price', formData.price);
      if (formData.originalPrice) submitData.append('originalPrice', formData.originalPrice);
      if (formData.category) submitData.append('category', formData.category);
      submitData.append('inStock', formData.inStock.toString());
      if (formData.badge) submitData.append('badge', formData.badge);
      
      // Text Fields
      submitData.append('shortDescription', formData.shortDescription);
      // For editor fields, we send string, but ideally it should be HTML
      submitData.append('description', `<p>${formData.description}</p>`);
      
      if (formData.material) submitData.append('material', formData.material);
      if (formData.weight) submitData.append('weight', formData.weight);
      
      // Multi-select fields (colors, tags) - stored as JSON arrays in some cases or multi-select in PocketBase
      // PocketBase handles comma separated or multiple append for select fields
      if (formData.colors && formData.colors.length > 0) {
        formData.colors.forEach(c => submitData.append('colors', c));
      }
      
      if (formData.tags && formData.tags.length > 0) {
        formData.tags.forEach(t => submitData.append('tags', t));
      }
      
      submitData.append('rating', formData.rating.toString());
      submitData.append('reviewCount', formData.reviewCount.toString());

      // Images
      imageFiles.current.forEach((file: File) => {
        submitData.append('images', file);
      });

      const res = await createProductWithFilesAction(submitData);
      
      if (res.error) {
        console.error('Create error:', res.error, res.details);
        throw new Error(res.error + (res.details ? ': ' + JSON.stringify(res.details) : ''));
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/yara-admin/products');
        router.refresh(); // Force refresh to see new product
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/yara-admin/products" className="p-2 hover:bg-burgundy/5 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-burgundy" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-burgundy">Add New Product</h1>
          <p className="text-burgundy/60 font-body text-sm mt-1">Create a new product listing in your catalog.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-medium">
          {error}
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-6 right-6 bg-green-50 text-green-700 px-6 py-4 rounded-xl border border-green-200 shadow-xl z-50 flex items-center gap-3 animate-in slide-in-from-top-2 fade-in">
          <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-sm">
            ✓
          </div>
          <div className="font-medium">Product created successfully!</div>
        </div>
      )}

      <ProductFormUI
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        handleNameChange={handleNameChange}
        imagePreviews={imagePreviews}
        handleImageChange={handleImageChange}
        removeImage={removeImage}
        handleSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
