import React from 'react';
import { X, Upload } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/types';

interface EditProductImagesProps {
  editingProduct: Product;
  newImagePreviews: string[];
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeNewImage: (index: number) => void;
  removeExistingImage: (imgUrl: string, index: number) => void;
}

export function EditProductImages({
  editingProduct,
  newImagePreviews,
  handleImageChange,
  removeNewImage,
  removeExistingImage,
}: EditProductImagesProps) {
  return (
    <div className="md:col-span-2 space-y-2">
      <span className="block text-sm font-semibold text-burgundy mb-2">Images</span>
      {((editingProduct.images && editingProduct.images.length > 0) || newImagePreviews.length > 0) && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mb-4">
          {editingProduct.images?.map((imgUrl, idx) => (
            <div key={imgUrl} className="relative aspect-square rounded-xl overflow-hidden group border border-burgundy/10">
              <Image src={imgUrl} alt="existing" fill unoptimized className="object-cover" sizes="100px" />
              <div className="absolute top-1 left-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-medium">Existing</div>
              <button 
                type="button"
                onClick={() => removeExistingImage(imgUrl, idx)}
                className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                aria-label="Remove existing image"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {newImagePreviews.map((preview, idx) => (
            <div key={preview} className="relative aspect-square rounded-xl overflow-hidden group border border-burgundy/10">
              <Image src={preview} alt="preview" fill unoptimized className="object-cover" sizes="100px" />
              <div className="absolute top-1 left-1 bg-burgundy px-2 py-0.5 rounded text-[10px] text-white font-medium">New</div>
              <button 
                type="button"
                onClick={() => removeNewImage(idx)}
                className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                aria-label="Remove new image"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-4 items-center">
        <label htmlFor="product-image-upload" className="cursor-pointer bg-white border border-dashed border-burgundy/30 hover:border-burgundy/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors flex-1">
          <Upload size={24} className="text-burgundy/50" />
          <span className="text-sm text-burgundy/60 font-medium">Click to upload additional images</span>
          <input 
            id="product-image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
