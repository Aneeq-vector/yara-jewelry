import { m as motion } from 'framer-motion';
import { Upload, FileTextIcon, Loader2, FileWarningIcon, CheckIcon, XIcon, RefreshCwIcon } from 'lucide-react';
import { Attachment, AttachmentMedia, AttachmentContent, AttachmentTitle, AttachmentDescription, AttachmentActions, AttachmentAction } from '@/components/ui/attachment';

export function CheckoutReviewStep({
  form,
  receiptFile,
  uploadState,
  uploadProgress,
  handleFileChange,
  retryUpload,
  setReceiptFile,
  setUploadState,
  receiptError,
  currentStep
}: any) {
  return (
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
                            <div className="w-full flex flex-col gap-2">
                              <label htmlFor="receipt-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-burgundy/20 rounded-xl cursor-pointer bg-white/50 hover:bg-rose-gold/10 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-burgundy/60 text-center">
                                  <Upload size={24} className="mb-2" />
                                  <p className="mb-1 text-sm font-body"><span className="font-semibold text-burgundy">Click to upload</span> or drag and drop</p>
                                  <p className="text-xs font-body opacity-70">PNG, JPG or PDF</p>
                                  <p className="text-xs font-body opacity-70">Maximum file size: 5 MB</p>
                                </div>
                                <input id="receipt-upload" type="file" className="hidden" accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileChange} />
                              </label>
                              {receiptError && (
                                <p className="text-sm text-red-500 leading-5 break-words font-body">{receiptError}</p>
                              )}
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

  );
}
