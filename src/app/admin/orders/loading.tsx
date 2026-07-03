import { TableSkeleton } from "@/components/admin/TableSkeleton";

export default function OrdersLoading() {
  return <TableSkeleton columns={7} rows={8} />;
}
