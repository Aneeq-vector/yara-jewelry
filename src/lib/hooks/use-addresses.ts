import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAddressesAction, addAddressAction, updateAddressAction, deleteAddressAction } from '@/app/actions/addresses';
import { queryKeys } from '@/lib/query-keys';
import { Address } from '@/types';

export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.addresses('current'),
    queryFn: async () => {
      const res = await getAddressesAction();
      if (!res.success) throw new Error(res.error || 'Failed to fetch addresses');
      return res.addresses as Address[];
    },
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Address>) => {
      const res = await addAddressAction(data);
      if (!res.success) throw new Error(res.error || 'Failed to add address');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses('current') });
    }
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Address> }) => {
      const res = await updateAddressAction(id, data);
      if (!res.success) throw new Error(res.error || 'Failed to update address');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses('current') });
    }
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteAddressAction(id);
      if (!res.success) throw new Error(res.error || 'Failed to delete address');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses('current') });
    }
  });
}
