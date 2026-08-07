import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function CustomersPagination({
  rowsPerPage, setRowsPerPage, setCurrentPage, currentPage, totalPages, handlePageChange, filteredCustomers
}: any) {
  return (
    <>
        <div className="p-4 border-t border-burgundy/5 bg-ivory/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-burgundy/60 font-body">
            <span>Rows per page:</span>
            <select aria-label="Action" 
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent border border-burgundy/10 rounded-md px-2 py-1 outline-none focus:border-burgundy/30 cursor-pointer text-burgundy"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="ml-4">
              {filteredCustomers.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-
              {Math.min(currentPage * rowsPerPage, filteredCustomers.length)} of {filteredCustomers.length}
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
