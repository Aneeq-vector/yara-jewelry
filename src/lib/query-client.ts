import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Conservative defaults for a unified cache
        staleTime: 0,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false, // We'll opt-in on specific hooks
      },
    },
  });
}
