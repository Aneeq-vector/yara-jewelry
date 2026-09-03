import { m as motion, AnimatePresence } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Info, CreditCard } from 'lucide-react';

export function CheckoutPaymentStep({
  form,
  updateForm,
  currentStep
}: any) {
  return (
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
                        className={`relative flex flex-col cursor-pointer rounded-2xl border p-5 shadow-sm transition-colors focus:outline-none ${form.paymentMethod === 'bank_transfer' ? 'border-burgundy bg-burgundy/5' : 'border-nude/30 hover:border-burgundy/20'}`}
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
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.95, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-8 pt-4 space-y-2">
                                <p className="font-body text-xs text-burgundy/70 mb-2">Please transfer the total amount to the following bank account:</p>
                                <div className="grid grid-cols-2 gap-2 font-body text-sm text-burgundy bg-white/50 p-3 rounded-xl border border-burgundy/10">
                                  <span className="text-burgundy/50">Bank Name</span>
                                  <span className="font-medium">Hatton National Bank</span>
                                  
                                  <span className="text-burgundy/50">Account Name</span>
                                  <span className="font-medium">Fathima Lamaa</span>
                                  
                                  <span className="text-burgundy/50">Account Number</span>
                                  <span className="font-medium">0830 2031 0603</span>
                                  
                                  <span className="text-burgundy/50">Branch</span>
                                  <span className="font-medium">Puttalam</span>
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
                        className={`relative flex flex-col cursor-pointer rounded-2xl border p-5 shadow-sm transition-colors focus:outline-none ${form.paymentMethod === 'cod' ? 'border-burgundy bg-champagne/30' : 'border-nude/30 hover:border-burgundy/20'}`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-4">
                            <RadioGroupItem value="cod" id="cod" className="border-burgundy/50 text-burgundy" />
                            <div className="flex flex-col">
                              <span className="font-ui font-semibold text-sm text-burgundy">Cash on Delivery</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    </RadioGroup>
                    <p className="font-body text-xs text-burgundy/30 mt-4 flex items-center gap-1">
                      <CreditCard size={12} /> Your payment information is secure and encrypted.
                    </p>
                  </motion.div>

  );
}
