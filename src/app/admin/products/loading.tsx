import { TableSkeleton } from "@/components/admin/TableSkeleton";

export default function ProductsLoading() {
  return <TableSkeleton columns={7} rows={8} />;
}
