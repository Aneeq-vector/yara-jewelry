'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Check } from 'lucide-react';

const mockAddresses = [
  { id: '1', name: 'Home', street: '42, Rose Garden Apartments, MG Road', city: 'Mumbai', state: 'Maharashtra', zip: '400001', phone: '+91 98765 43210', isDefault: true },
  { id: '2', name: 'Office', street: '15th Floor, Yara Tower, BKC', city: 'Mumbai', state: 'Maharashtra', zip: '400051', phone: '+91 98765 43211', isDefault: false },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(mockAddresses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false });

  const inputClass = "w-full px-3 py-2 rounded-xl bg-transparent border border-burgundy/20 font-body text-sm text-burgundy placeholder:text-burgundy/50 focus:outline-none focus:border-burgundy transition-colors";

  const deleteAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const startEdit = (addr: any) => {
    setEditingId(addr.id);
    setEditForm({ ...addr });
  };

  const saveEdit = () => {
    // If setting as default, remove default from others
    let updated = addresses.map(a => a.id === editingId ? editForm : a);
    if (editForm.isDefault) {
      updated = updated.map(a => a.id === editingId ? a : { ...a, isDefault: false });
    }
    setAddresses(updated);
    setEditingId(null);
  };

  const saveNew = () => {
    let updated = [{ ...newForm, id: Math.random().toString() }, ...addresses];
    if (newForm.isDefault) {
      updated = updated.map(a => a.id === updated[0].id ? a : { ...a, isDefault: false });
    }
    setAddresses(updated);
    setIsAdding(false);
    setNewForm({ name: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false });
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
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-6 relative border-2 border-burgundy/30"
          >
            <h3 className="font-heading text-lg font-bold text-burgundy mb-4">Add New Address</h3>
            <div className="space-y-3">
              <input value={newForm.name} onChange={(e) => setNewForm(p => ({ ...p, name: e.target.value }))} placeholder="Name (e.g. Home)" className={inputClass} />
              <input value={newForm.street} onChange={(e) => setNewForm(p => ({ ...p, street: e.target.value }))} placeholder="Street Address" className={inputClass} />
              <div className="grid grid-cols-2 gap-2">
                <input value={newForm.city} onChange={(e) => setNewForm(p => ({ ...p, city: e.target.value }))} placeholder="City" className={inputClass} />
                <input value={newForm.state} onChange={(e) => setNewForm(p => ({ ...p, state: e.target.value }))} placeholder="Province" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={newForm.zip} onChange={(e) => setNewForm(p => ({ ...p, zip: e.target.value }))} placeholder="ZIP Code" className={inputClass} />
                <input value={newForm.phone} onChange={(e) => setNewForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone Number" className={inputClass} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="new-default" checked={newForm.isDefault} onChange={(e) => setNewForm(p => ({ ...p, isDefault: e.target.checked }))} className="rounded border-burgundy/20 text-burgundy focus:ring-burgundy" />
                <label htmlFor="new-default" className="font-body text-xs text-burgundy cursor-pointer">Set as default</label>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-nude/30">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-xl font-ui text-xs font-semibold text-burgundy/60 hover:bg-champagne/40 transition-colors">Cancel</button>
                <button onClick={saveNew} className="px-4 py-2 rounded-xl font-ui text-xs font-semibold bg-burgundy text-white hover:bg-burgundy/90 transition-colors">Save</button>
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
                <input value={editForm.name} onChange={(e) => setEditForm((p: any) => ({ ...p, name: e.target.value }))} placeholder="Name (e.g. Home)" className={inputClass} />
                <input value={editForm.street} onChange={(e) => setEditForm((p: any) => ({ ...p, street: e.target.value }))} placeholder="Street Address" className={inputClass} />
                <div className="grid grid-cols-2 gap-2">
                  <input value={editForm.city} onChange={(e) => setEditForm((p: any) => ({ ...p, city: e.target.value }))} placeholder="City" className={inputClass} />
                  <input value={editForm.state} onChange={(e) => setEditForm((p: any) => ({ ...p, state: e.target.value }))} placeholder="Province" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={editForm.zip} onChange={(e) => setEditForm((p: any) => ({ ...p, zip: e.target.value }))} placeholder="ZIP Code" className={inputClass} />
                  <input value={editForm.phone} onChange={(e) => setEditForm((p: any) => ({ ...p, phone: e.target.value }))} placeholder="Phone Number" className={inputClass} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id={`edit-default-${addr.id}`} checked={editForm.isDefault} onChange={(e) => setEditForm((p: any) => ({ ...p, isDefault: e.target.checked }))} className="rounded border-burgundy/20 text-burgundy focus:ring-burgundy" />
                  <label htmlFor={`edit-default-${addr.id}`} className="font-body text-xs text-burgundy cursor-pointer">Set as default</label>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-nude/30">
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl font-ui text-xs font-semibold text-burgundy/60 hover:bg-champagne/40 transition-colors">Cancel</button>
                  <button onClick={saveEdit} className="px-4 py-2 rounded-xl font-ui text-xs font-semibold bg-burgundy text-white hover:bg-burgundy/90 transition-colors">Save</button>
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
                    <p className="font-body text-sm text-burgundy/60">{addr.city}, {addr.state} {addr.zip}</p>
                    <p className="font-body text-xs text-burgundy/40 mt-2">{addr.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-nude/30">
                  <button onClick={() => startEdit(addr)} className="font-ui text-xs font-semibold text-burgundy/50 hover:text-burgundy transition-colors">Edit</button>
                  <span className="text-nude">•</span>
                  <button onClick={() => deleteAddress(addr.id)} className="font-ui text-xs font-semibold text-red-400 hover:text-red-500 transition-colors">Delete</button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </>
  );
}
