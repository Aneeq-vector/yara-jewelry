import { TableSkeleton } from "@/components/admin/TableSkeleton";

export default function CustomersLoading() {
  return <TableSkeleton columns={7} rows={8} />;
}
