import { m as motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Address } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { COUNTRIES } from '@/lib/countries';

export function CheckoutShippingStep({
  form,
  updateForm,
  errors,
  savedAddresses,
  selectedAddressId,
  handleSelectAddress,
  getInputClass,
  currentStep
}: {
  form: any;
  updateForm: (field: string, value: string) => void;
  errors: any;
  savedAddresses: Address[];
  selectedAddressId: string | null;
  handleSelectAddress: (addr: Address) => void;
  getInputClass: (field: string) => string;
  currentStep: number;
}) {
  return (
    <motion.div
      key="shipping"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="glass-card rounded-3xl p-6 sm:p-8"
    >
      <h2 className="font-heading text-xl font-bold text-burgundy mb-6">Shipping Address</h2>
      
      {savedAddresses.length > 0 && (
        <div className="mb-6">
          <label htmlFor="savedaddresses_7559f9" className="font-ui text-sm font-semibold text-burgundy mb-3 block">Saved Addresses</label>
          <div className="grid sm:grid-cols-2 gap-3">
            {savedAddresses.map((addr: Address) => (
              <button
                key={addr.id}
                onClick={() => handleSelectAddress(addr)}
                className={`text-left p-3 rounded-xl border transition ${
                  selectedAddressId === addr.id 
                    ? 'border-burgundy bg-burgundy/5' 
                    : 'border-burgundy/10 hover:border-burgundy/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className={selectedAddressId === addr.id ? 'text-burgundy' : 'text-burgundy/50'} />
                  <span className="font-ui font-bold text-sm text-burgundy">{addr.name}</span>
                  {addr.isDefault && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-rose-gold bg-rose-gold/10 px-2 py-0.5 rounded-full">Default</span>}
                </div>
                <p className="font-body text-xs text-burgundy/70 truncate">{addr.street}, {addr.city}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <input id="savedaddresses_7559f9" aria-label="Full Name" value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Full Name" className={getInputClass('name')} />
          {errors.name && <p className="text-red-400 text-xs mt-1 ml-1 font-body">{errors.name}</p>}
        </div>
        <div className="sm:col-span-2">
          <input aria-label="Email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="Email" type="email" className={getInputClass('email')} />
          {errors.email && <p className="text-red-400 text-xs mt-1 ml-1 font-body">{errors.email}</p>}
        </div>
        <div>
          <input aria-label="Phone Number" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="Phone Number" type="tel" className={getInputClass('phone')} />
          {errors.phone && <p className="text-red-400 text-xs mt-1 ml-1 font-body">{errors.phone}</p>}
        </div>
        <div>
          <Select value={form.country} onValueChange={(val) => updateForm('country', val || '')}>
            <SelectTrigger className={getInputClass('country')}>
              <SelectValue aria-label="Country" placeholder="Country" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} sideOffset={8} className="bg-ivory border border-burgundy/10 shadow-xl rounded-2xl z-[100] outline-none focus:outline-none overflow-hidden p-0">
              <ScrollArea className="h-64 rounded-2xl">
                <div className="p-1.5">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c} className="font-body text-base sm:text-sm text-burgundy cursor-pointer focus:bg-champagne/50 focus:text-burgundy rounded-xl pl-3 pr-8 py-2.5 transition-colors">
                      {c}
                    </SelectItem>
                  ))}
                </div>
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <input aria-label="Delivery Address" value={form.street} onChange={(e) => updateForm('street', e.target.value)} placeholder="Delivery Address" className={getInputClass('street')} />
          {errors.street && <p className="text-red-400 text-xs mt-1 ml-1 font-body">{errors.street}</p>}
        </div>
        <div>
          <input aria-label="City" value={form.city} onChange={(e) => updateForm('city', e.target.value)} placeholder="City" className={getInputClass('city')} />
          {errors.city && <p className="text-red-400 text-xs mt-1 ml-1 font-body">{errors.city}</p>}
        </div>
        <div>
          <input aria-label="Province" value={form.state} onChange={(e) => updateForm('state', e.target.value)} placeholder="Province" className={getInputClass('state')} />
          {errors.state && <p className="text-red-400 text-xs mt-1 ml-1 font-body">{errors.state}</p>}
        </div>
        <div>
          <input aria-label="ZIP Code" value={form.zip} onChange={(e) => updateForm('zip', e.target.value)} placeholder="ZIP Code" inputMode="numeric" className={getInputClass('zip')} />
          {errors.zip && <p className="text-red-400 text-xs mt-1 ml-1 font-body">{errors.zip}</p>}
        </div>
      </div>
    </motion.div>
  );
}
