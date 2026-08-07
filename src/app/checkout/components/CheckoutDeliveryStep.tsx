import { m as motion } from 'framer-motion';

export function CheckoutDeliveryStep({
  form,
  updateForm,
  subtotal,
  FREE_DELIVERY_THRESHOLD,
  currentStep
}: any) {
  return (
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
                          className={`w-full flex items-center justify-between p-5 rounded-2xl border transition ${
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

  );
}
