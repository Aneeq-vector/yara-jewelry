import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';

export function OrdersPagination({
  rowsPerPage, setRowsPerPage, setCurrentPage, currentPage, totalPages, handlePageChange, filteredOrders
}: any) {
  return (
    <>
        <div className="p-4 border-t border-burgundy/5 bg-ivory/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-burgundy/60 font-body">
            <span>Rows per page:</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="bg-transparent border border-burgundy/10 text-burgundy text-sm rounded-md px-2 py-1 font-body outline-none focus:border-burgundy/30 transition-colors cursor-pointer flex items-center gap-2">
                {rowsPerPage} <ChevronDown size={14} className="text-burgundy/50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-20 bg-white border border-burgundy/10 rounded-xl shadow-lg p-1">
                {[10, 25, 50, 100].map((num) => (
                  <DropdownMenuItem 
                    key={num}
                    onClick={() => { setRowsPerPage(num); setCurrentPage(1); }}
                    className="cursor-pointer text-sm text-burgundy focus:bg-rose-gold/10 hover:bg-rose-gold/10 rounded-md px-3 py-2 outline-none"
                  >
                    {num}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="ml-4">
              {filteredOrders.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-
              {Math.min(currentPage * rowsPerPage, filteredOrders.length)} of {filteredOrders.length}
            </span>
          </div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                // Show first, last, current, and adjacent pages
                if (
                  p === 1 || 
                  p === totalPages || 
                  (p >= currentPage - 1 && p <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === p}
                        onClick={(e) => { e.preventDefault(); handlePageChange(p); }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  p === currentPage - 2 || 
                  p === currentPage + 2
                ) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

    </>
  );
}
