'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, Loader2, Save, X } from 'lucide-react';
import { createClient } from '@/lib/pocketbase';
import { createProductWithFilesAction } from '@/app/actions/products';
import { getAllProducts } from '@/lib/data/products';
import { ProductFormUI, FormDataState } from './components/ProductFormUI';

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
  const [formData, setFormData] = useState<FormDataState>({
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
  const pendingCompressions = useRef<Promise<any>[]>([]);
  
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    // Fetch categories and max product code
    async function loadInitialData() {
      try {
        const pb = createClient();
        
        // Load categories
        const categoryRecords = await pb.collection('categories').getFullList({ sort: 'name' });
        setCategories(categoryRecords.map(r => ({ id: r.id, name: r.name })));

        // Load highest product code efficiently by just getting the most recent YARA product
        let nextCodeNum = 1001; // fallback
        const latestProducts = await pb.collection('products').getList(1, 1, {
          sort: '-created',
          filter: 'productCode ~ "YARA-"',
          fields: 'productCode',
        });

        if (latestProducts.items.length > 0) {
          const latestCode = latestProducts.items[0].productCode;
          const maxNum = parseInt(latestCode.replace('YARA-', ''), 10) || 0;
          if (maxNum >= 1000) {
            nextCodeNum = maxNum + 1;
          }
        }
        
        setFormData(prev => ({ ...prev, productCode: `YARA-${nextCodeNum}` }));
      } catch (err) {
        console.error('Failed to load initial data', err);
        // Fallback if DB fetch fails (e.g. CORS or network error)
        setFormData(prev => ({ 
          ...prev, 
          productCode: prev.productCode === 'Loading...' ? `YARA-${Math.floor(Date.now() / 1000).toString().slice(-4)}` : prev.productCode 
        }));
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
      
      // 1. Immediately show previews for instant UI feedback
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      
      // 2. Temporarily push original files to maintain order and allow immediate saving
      imageFiles.current.push(...filesArray);
      
      const options = {
        maxSizeMB: 0.5, // Strict 500KB limit to avoid Nginx 1MB 413 error
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: 'image/jpeg' as string, // Force JPEG to bypass strict MIME checking
      };

      // 3. Compress in the background without blocking the UI
      const compressionPromises = filesArray.map(async (originalFile) => {
        try {
          const imageCompression = (await import('browser-image-compression')).default;
          const compressedFile = await imageCompression(originalFile, options);
          // Find by exact reference in case user reordered or deleted images while compressing
          const index = imageFiles.current.findIndex(f => f === originalFile);
          if (index !== -1) {
            imageFiles.current[index] = compressedFile;
          }
        } catch (error) {
          console.error("Error compressing image:", error);
          // If it fails, the original file is already in the array
        }
      });
      pendingCompressions.current.push(...compressionPromises);
    }
  };

  const removeImage = (index: number) => {
    imageFiles.current = imageFiles.current.filter((_: any, i: number) => i !== index);
    setImagePreviews(prev => prev.filter((_: any, i: number) => i !== index));
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    // Reorder imageFiles
    const files = [...imageFiles.current];
    const [movedFile] = files.splice(fromIndex, 1);
    files.splice(toIndex, 0, movedFile);
    imageFiles.current = files;
    
    // Reorder imagePreviews
    setImagePreviews(prev => {
      const previews = [...prev];
      const [movedPreview] = previews.splice(fromIndex, 1);
      previews.splice(toIndex, 0, movedPreview);
      return previews;
    });
  };

  useEffect(() => {
    // Empty cleanup since we no longer use ObjectURLs
  }, [imagePreviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name.trim() || formData.price === '' || formData.price === null || formData.price === undefined || !formData.shortDescription?.trim() || !formData.description?.trim()) {
        setError("Error: Name, Price, Short Description, and Full Description are required.");
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (pendingCompressions.current.length > 0) {
        // Wait for compressions if they are literally still happening
        await Promise.all(pendingCompressions.current);
        pendingCompressions.current = [];
      }
      
      const submitData = new FormData();
      // Basic Fields
      submitData.append('name', formData.name);
      
      const finalProductCode = formData.productCode === 'Loading...' 
        ? `YARA-${Math.floor(Date.now() / 1000).toString().slice(-4)}`
        : formData.productCode;
      submitData.append('productCode', finalProductCode);
      
      submitData.append('price', formData.price);
      if (formData.originalPrice) submitData.append('originalPrice', formData.originalPrice);
      if (formData.category) submitData.append('category', formData.category);
      submitData.append('inStock', formData.inStock.toString());
      if (formData.badge) submitData.append('badge', formData.badge);
      
      // Text Fields
      submitData.append('shortDescription', formData.shortDescription);
      submitData.append('description', `<p>${formData.description}</p>`);
      
      if (formData.material) submitData.append('material', formData.material);
      if (formData.weight) submitData.append('weight', formData.weight);
      
      if (formData.colors && formData.colors.length > 0) {
        formData.colors.forEach(c => submitData.append('colors', c));
      }
      
      if (formData.tags && formData.tags.length > 0) {
        formData.tags.forEach(t => submitData.append('tags', t));
      }

      submitData.append('rating', formData.rating.toString());
      submitData.append('reviewCount', formData.reviewCount.toString());

      // 0. Get Token (must happen before navigation so the server action request isn't aborted)
      const { getAdminTokenAction } = await import('@/app/actions/products');
      const tokenResult = await getAdminTokenAction();
      if (!tokenResult.token) {
         setError(tokenResult.error || 'Admin auth failed');
         setLoading(false);
         return;
      }

      // 1. INSTANT REDIRECT (Optimistic UI via sessionStorage)
      const optimisticProduct = {
        id: 'temp-' + Date.now(),
        name: formData.name,
        productCode: finalProductCode,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : 0,
        inStock: formData.inStock,
        isActive: true,
        images: imageFiles.current.length > 0 ? imageFiles.current.map(f => URL.createObjectURL(f)) : ['/placeholder.png'],
        description: `<p>${formData.description}</p>`,
        shortDescription: formData.shortDescription,
        material: formData.material,
        weight: formData.weight,
        colors: formData.colors,
        tags: formData.tags,
        rating: formData.rating,
        reviewCount: formData.reviewCount,
        badge: formData.badge,
        created: new Date().toISOString()
      };
      sessionStorage.setItem('optimisticProduct', JSON.stringify(optimisticProduct));
      
      router.push('/yara-admin/products');
      
      // 2. FIRE AND FORGET EVERYTHING ELSE
      (async () => {
        try {
          // Append all images to the initial POST request formData
          for (let i = 0; i < imageFiles.current.length; i++) {
            const file = imageFiles.current[i];
            const fileName = (file as File).name || `image-${i}.jpg`;
            const mimeType = file.type || 'image/jpeg';
            submitData.append('images', new File([file], fileName, { type: mimeType }));
          }

          const PB_BASE = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.yarasl.shop'; 

          const createRes = await fetch(`${PB_BASE}/api/collections/products/records`, {
            method: 'POST',
            headers: { Authorization: tokenResult.token as string },
            body: submitData, 
          });
          
          if (!createRes.ok) {
             console.error("Create failed:", await createRes.text());
             throw new Error('Create failed');
          }
          
          const { revalidateProductsAction } = await import('@/app/actions/products');
          await revalidateProductsAction();
          
          // Notify the products list page that the real product is ready
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('product-created-bg'));
          }
        } catch (err) {
          console.error('Background upload failed', err);
        }
      })();

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process form');
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
        reorderImages={reorderImages}
        handleSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
