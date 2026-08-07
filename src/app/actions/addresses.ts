'use server';

import { requireAuth } from '@/lib/pocketbase-server';
import { Address } from '@/types';

export async function getAddressesAction(): Promise<{ success: boolean; addresses?: Address[]; error?: string }> {
  try {
    const { pb, user } = await requireAuth();

    const records = await pb.collection('addresses').getFullList({
      filter: `user="${user.id}"`
    });

    const addresses = records.map(record => ({
      id: record.id,
      name: record.name,
      street: record.street,
      city: record.city,
      state: record.state,
      zipCode: record.zip, // mapping 'zip' in DB to 'zipCode' in type
      phone: record.phone,
      isDefault: record.isDefault
    })) as Address[];

    return { success: true, addresses };
  } catch (error: any) {
    console.error('Error fetching addresses:', error);
    return { success: false, error: error.message || 'Failed to fetch addresses' };
  }
}

export async function addAddressAction(data: Partial<Address>): Promise<{ success: boolean; error?: string }> {
  try {
    const { pb, user } = await requireAuth();

    if (data.isDefault) {
      // Unset previous defaults
      const existing = await pb.collection('addresses').getFullList({ filter: `user="${user.id}" && isDefault=true` });
      await Promise.all(existing.map(addr => pb.collection('addresses').update(addr.id, { isDefault: false })));
    }

    await pb.collection('addresses').create({
      user: user.id,
      name: data.name,
      street: data.street,
      city: data.city,
      state: data.state,
      zip: data.zipCode,
      phone: data.phone,
      isDefault: data.isDefault || false
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error adding address:', error);
    return { success: false, error: error.message || 'Failed to add address' };
  }
}

export async function updateAddressAction(id: string, data: Partial<Address>): Promise<{ success: boolean; error?: string }> {
  try {
    const { pb, user } = await requireAuth();

    if (data.isDefault) {
      // Unset previous defaults
      const existing = await pb.collection('addresses').getFullList({ filter: `user="${user.id}" && isDefault=true && id!="${id}"` });
      await Promise.all(existing.map(addr => pb.collection('addresses').update(addr.id, { isDefault: false })));
    }

    await pb.collection('addresses').update(id, {
      name: data.name,
      street: data.street,
      city: data.city,
      state: data.state,
      zip: data.zipCode,
      phone: data.phone,
      isDefault: data.isDefault
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating address:', error);
    return { success: false, error: error.message || 'Failed to update address' };
  }
}

export async function deleteAddressAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { pb, user } = await requireAuth();

    await pb.collection('addresses').delete(id);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return { success: false, error: error.message || 'Failed to delete address' };
  }
}
