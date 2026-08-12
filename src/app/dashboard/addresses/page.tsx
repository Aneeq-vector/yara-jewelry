'use client';

import { useState, useEffect } from 'react';
import { m as motion } from 'framer-motion';
import { MapPin, Plus, Check, Loader2 } from 'lucide-react';
import { getAddressesAction, addAddressAction, updateAddressAction, deleteAddressAction } from '@/app/actions/addresses';
import { Address } from '@/types';
import { COUNTRIES } from '@/lib/countries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', street: '', city: '', state: '', zipCode: '', phone: '', country: 'Sri Lanka', isDefault: false });
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    addressId: null as string | null
  });

  const inputClass = "w-full px-3 py-2 rounded-xl bg-transparent border border-burgundy/20 font-body text-sm text-burgundy placeholder:text-burgundy/50 focus:outline-none focus:border-burgundy transition-colors";

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    const result = await getAddressesAction();
    if (result.success && result.addresses) {
      setAddresses(result.addresses);
    }
    setLoading(false);
  };

  const deleteAddress = (id: string) => {
    setConfirmModal({
      isOpen: true,
      addressId: id
    });
  };

  const confirmDeleteAddress = async () => {
    if (!confirmModal.addressId) return;
    setConfirmModal({ isOpen: false, addressId: null });
    setSaving(true);
    await deleteAddressAction(confirmModal.addressId);
    await fetchAddresses();
    setSaving(false);
  };

  const startEdit = (addr: any) => {
    setEditingId(addr.id);
    setEditForm({ ...addr });
  };

  const saveEdit = async () => {
    if (!editForm.name || !editForm.street || !editForm.city || !editForm.zipCode) {
      alert("Please fill in all required fields (Name, Street, City, and ZIP).");
      return;
    }
    setSaving(true);
    const res = await updateAddressAction(editingId!, editForm);
    if (!res.success) {
      alert(res.error);
      setSaving(false);
      return;
    }
    await fetchAddresses();
    setEditingId(null);
    setSaving(false);
  };

  const saveNew = async () => {
    if (!newForm.name || !newForm.street || !newForm.city || !newForm.zipCode) {
      alert("Please fill in all required fields (Name, Street, City, and ZIP).");
      return;
    }
    setSaving(true);
    const res = await addAddressAction(newForm);
    if (!res.success) {
      alert(res.error);
      setSaving(false);
      return;
    }
    await fetchAddresses();
    setIsAdding(false);
    setNewForm({ name: '', street: '', city: '', state: '', zipCode: '', phone: '', country: 'Sri Lanka', isDefault: false });
    setSaving(false);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl font-bold text-burgundy">Saved Addresses</h1>
            <p className="font-body text-burgundy/50 mt-2">Manage your delivery locations.</p>
          </div>
          <button onClick={() => setIsAdding(true)} className="btn-secondary text-sm flex items-center justify-center gap-2 self-start sm:self-auto px-6 py-2.5">
            <Plus size={16} strokeWidth={2.5} className="-mt-0.5" /> <span>ADD NEW</span>
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {loading && !isAdding && addresses.length === 0 ? (
          <div className="col-span-2 flex justify-center items-center py-12 text-burgundy">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : (!loading && !isAdding && addresses.length === 0 ? (
          <div className="col-span-2 glass-card rounded-3xl p-10 flex flex-col items-center justify-center text-center">
            <MapPin size={48} className="text-burgundy/20 mb-4" />
            <h3 className="font-heading text-xl font-bold text-burgundy mb-2">No addresses saved</h3>
            <p className="font-body text-burgundy/60 max-w-md">You haven't saved any delivery addresses yet. Add one now to make checkout faster.</p>
            <button onClick={() => setIsAdding(true)} className="btn-primary mt-6">
              Add New Address
            </button>
          </div>
        ) : null)}
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-6 relative border-2 border-burgundy/30"
          >
            <h3 className="font-heading text-lg font-bold text-burgundy mb-4">Add New Address</h3>
            <div className="space-y-3">
              <input aria-label="Name (e.g. Home)" value={newForm.name} onChange={(e) => setNewForm(p => ({ ...p, name: e.target.value }))} placeholder="Name (e.g. Home)" className={inputClass} />
              <input aria-label="Street Address" value={newForm.street} onChange={(e) => setNewForm(p => ({ ...p, street: e.target.value }))} placeholder="Street Address" className={inputClass} />
              <div className="grid grid-cols-2 gap-2">
                <input aria-label="City" value={newForm.city} onChange={(e) => setNewForm(p => ({ ...p, city: e.target.value }))} placeholder="City" className={inputClass} />
                <input aria-label="Province" value={newForm.state} onChange={(e) => setNewForm(p => ({ ...p, state: e.target.value }))} placeholder="Province" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input aria-label="ZIP Code" value={newForm.zipCode} onChange={(e) => setNewForm(p => ({ ...p, zipCode: e.target.value }))} placeholder="ZIP Code" className={inputClass} />
                <input aria-label="Phone Number" value={newForm.phone} onChange={(e) => setNewForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone Number" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Select value={newForm.country} onValueChange={(val) => setNewForm(p => ({ ...p, country: val || 'Sri Lanka' }))}>
                  <SelectTrigger className={inputClass}>
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
              <div className="flex items-center gap-3 mt-3">
                <Checkbox id="new-default" checked={newForm.isDefault} onCheckedChange={(checked) => setNewForm(p => ({ ...p, isDefault: !!checked }))} className="border-burgundy/30 data-[state=checked]:bg-burgundy data-[state=checked]:border-burgundy h-5 w-5 rounded-md" />
                <label htmlFor="new-default" className="font-body text-sm font-medium text-burgundy cursor-pointer">Set as default address</label>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-nude/30">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-xl font-ui text-xs font-semibold text-burgundy/60 hover:bg-champagne/40 transition-colors">Cancel</button>
                <button onClick={saveNew} disabled={saving} className="px-4 py-2 rounded-xl font-ui text-xs font-semibold bg-burgundy text-white hover:bg-burgundy/90 transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </motion.div>
        )}
        {addresses.map((addr, i) => (
          <motion.div
            key={addr.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card rounded-3xl p-6 relative ${addr.isDefault ? 'ring-2 ring-rose-gold/30' : ''}`}
          >
            {editingId === addr.id ? (
              <div className="space-y-3">
                <h3 className="font-heading text-lg font-bold text-burgundy mb-2">Edit Address</h3>
                <input aria-label="Name (e.g. Home)" value={editForm.name} onChange={(e) => setEditForm((p: any) => ({ ...p, name: e.target.value }))} placeholder="Name (e.g. Home)" className={inputClass} />
                <input aria-label="Street Address" value={editForm.street} onChange={(e) => setEditForm((p: any) => ({ ...p, street: e.target.value }))} placeholder="Street Address" className={inputClass} />
                <div className="grid grid-cols-2 gap-2">
                  <input aria-label="City" value={editForm.city} onChange={(e) => setEditForm((p: any) => ({ ...p, city: e.target.value }))} placeholder="City" className={inputClass} />
                  <input aria-label="Province" value={editForm.state} onChange={(e) => setEditForm((p: any) => ({ ...p, state: e.target.value }))} placeholder="Province" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input aria-label="ZIP Code" value={editForm.zipCode} onChange={(e) => setEditForm((p: any) => ({ ...p, zipCode: e.target.value }))} placeholder="ZIP Code" className={inputClass} />
                  <input aria-label="Phone Number" value={editForm.phone} onChange={(e) => setEditForm((p: any) => ({ ...p, phone: e.target.value }))} placeholder="Phone Number" className={inputClass} />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Select value={editForm.country || 'Sri Lanka'} onValueChange={(val) => setEditForm((p: any) => ({ ...p, country: val || 'Sri Lanka' }))}>
                    <SelectTrigger className={inputClass}>
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
                <div className="flex items-center gap-3 mt-3">
                  <Checkbox id={`edit-default-${addr.id}`} checked={editForm.isDefault} onCheckedChange={(checked) => setEditForm((p: any) => ({ ...p, isDefault: !!checked }))} className="border-burgundy/30 data-[state=checked]:bg-burgundy data-[state=checked]:border-burgundy h-5 w-5 rounded-md" />
                  <label htmlFor={`edit-default-${addr.id}`} className="font-body text-sm font-medium text-burgundy cursor-pointer">Set as default address</label>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-nude/30">
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl font-ui text-xs font-semibold text-burgundy/60 hover:bg-champagne/40 transition-colors">Cancel</button>
                  <button onClick={saveEdit} disabled={saving} className="px-4 py-2 rounded-xl font-ui text-xs font-semibold bg-burgundy text-white hover:bg-burgundy/90 transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            ) : (
              <>
                {addr.isDefault && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-rose-gold/10 text-rose-gold text-[10px] font-ui font-bold uppercase tracking-wider flex items-center gap-1">
                    <Check size={10} /> Default
                  </span>
                )}
                <div className="flex items-start gap-3 mb-3">
                  <MapPin size={16} className="text-rose-gold mt-0.5" />
                  <div>
                    <h3 className="font-ui font-semibold text-sm text-burgundy">{addr.name}</h3>
                    <p className="font-body text-sm text-burgundy/60 mt-1">{addr.street}</p>
                    <p className="font-body text-sm text-burgundy/60">{addr.city}, {addr.state} {addr.zipCode}</p>
                    <p className="font-body text-sm text-burgundy/60">{addr.country || 'Sri Lanka'}</p>
                    <p className="font-body text-xs text-burgundy/40 mt-2">{addr.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-nude/30">
                  <button onClick={() => startEdit(addr)} className="font-ui text-xs font-semibold text-burgundy/50 hover:text-burgundy transition-colors">Edit</button>
                  <span className="text-nude">•</span>
                  <button onClick={() => deleteAddress(addr.id)} disabled={saving} className="font-ui text-xs font-semibold text-red-400 hover:text-red-500 transition-colors disabled:opacity-50">Delete</button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Address"
        description="Are you sure you want to delete this address? This cannot be undone."
        onConfirm={confirmDeleteAddress}
        onClose={() => setConfirmModal({ isOpen: false, addressId: null })}
        variant="danger"
      />
    </>
  );
}
