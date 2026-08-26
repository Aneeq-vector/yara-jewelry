import { Check, Star, X } from 'lucide-react';
import { Product } from '@/types';

export function ProductTabs({ product, activeTab, setActiveTab }: { product: Product, activeTab: string, setActiveTab: (tab: 'description' | 'details' | 'reviews') => void }) {
  return (
    <div className="border-t border-nude/30 pt-8">
                <div className="flex gap-6 mb-6">
                  {(['description', 'details', 'reviews'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`font-ui text-sm font-semibold uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                        activeTab === tab
                          ? 'text-burgundy border-burgundy'
                          : 'text-burgundy/40 border-transparent hover:text-burgundy/60'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === 'description' && (
                  <div 
                    className="font-body text-sm text-burgundy/60 leading-relaxed [&>p]:mb-4 last:[&>p]:mb-0"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                )}

                {activeTab === 'details' && (
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-nude/20">
                      <span className="font-ui text-sm text-burgundy/50">Material</span>
                      <span className="font-ui text-sm font-semibold text-burgundy">{product.material}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-nude/20">
                      <span className="font-ui text-sm text-burgundy/50">Weight</span>
                      <span className="font-ui text-sm font-semibold text-burgundy">{product.weight}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-nude/20">
                      <span className="font-ui text-sm text-burgundy/50">Colors Available</span>
                      <span className="font-ui text-sm font-semibold text-burgundy">{product.colors?.join(', ')}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-ui text-sm text-burgundy/50">Availability</span>
                      {product.quantity > 0 ? (
                        <span className="font-ui text-sm font-semibold text-emerald-600 flex items-center gap-1">
                          <Check size={14} /> In Stock
                        </span>
                      ) : (
                        <span className="font-ui text-sm font-semibold text-rose-500 flex items-center gap-1">
                          <X size={14} /> Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-center">
                        <div className="font-heading text-4xl font-bold text-burgundy">{product.rating}</div>
                        <div className="flex items-center gap-0.5 justify-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-nude'} />
                          ))}
                        </div>
                        <p className="font-body text-xs text-burgundy/40 mt-1">{product.reviewCount} reviews</p>
                      </div>
                    </div>
                    {/* Sample reviews */}
                    {[
                      { name: 'Ananya S.', rating: 5, comment: 'Absolutely gorgeous! The quality is amazing for the price. Will buy again.', date: '2 weeks ago' },
                      { name: 'Priya M.', rating: 4, comment: 'Beautiful piece, exactly as shown. Packaging was lovely too!', date: '1 month ago' },
                    ].map((review, i) => (
                      <div key={review.name} className="p-4 rounded-2xl bg-champagne/20 border border-nude/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-ui font-semibold text-sm text-burgundy">{review.name}</span>
                          <span className="font-body text-xs text-burgundy/40">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5 mb-2">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} size={11} className={j < review.rating ? 'text-amber-400 fill-amber-400' : 'text-nude'} />
                          ))}
                        </div>
                        <p className="font-body text-sm text-burgundy/60">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
  );
}
