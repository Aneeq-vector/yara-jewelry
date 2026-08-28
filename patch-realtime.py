with open('src/lib/hooks/use-product-realtime.ts', 'r') as f:
    content = f.read()

replacement = """async function handleProductEvent(
  e: { action: string; record: any },
  queryClient: QueryClient
) {
  if (e.record.isStaged) {
    return; // Ignore staged products entirely from realtime
  }

  if (e.action === 'update') {
    let updated = mapRecordToProduct(e.record);
    if (!e.record.expand?.category) {
      const fullRecord = await getProductById(e.record.id);
      if (fullRecord) {
        updated = fullRecord;
      }
    }

    const detailKey = queryKeys.products.detail(e.record.id);
    if (queryClient.getQueryData(detailKey)) {
      queryClient.setQueryData(detailKey, updated);
    }

    const listKey = queryKeys.products.catalog();
    if (queryClient.getQueryData(listKey)) {
      queryClient.setQueryData(listKey, (old: any[]) => {
        const exists = old.some(p => p.id === updated.id);
        if (exists) return old.map((p) => (p.id === updated.id ? updated : p));
        
        // If it was previously staged and just finalized, it won't be in the list.
        // We must invalidate to trigger a refetch, because appending might break pagination/sorting.
        queryClient.invalidateQueries({ queryKey: listKey });
        return old;
      });
    }

    const optionsKey = queryKeys.products.options();
    if (queryClient.getQueryData(optionsKey)) {
      queryClient.setQueryData(optionsKey, (old: any[]) => {
        const exists = old.some(p => p.id === updated.id);
        if (exists) return old.map((p) => (p.id === updated.id ? { ...p, ...updated } : p));
        queryClient.invalidateQueries({ queryKey: optionsKey });
        return old;
      });
    }

    queryClient.invalidateQueries({
      queryKey: ['products', 'related'],
      refetchType: 'none',
    });

  } else if (e.action === 'create') {"""

content = content.replace("async function handleProductEvent(\n  e: { action: string; record: any },\n  queryClient: QueryClient\n) {\n  if (e.action === 'update') {", replacement)

with open('src/lib/hooks/use-product-realtime.ts', 'w') as f:
    f.write(content)
