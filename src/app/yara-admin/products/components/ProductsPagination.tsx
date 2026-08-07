import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface ProductsPaginationProps {
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

export function ProductsPagination({
  rowsPerPage,
  setRowsPerPage,
  currentPage,
  setCurrentPage,
  totalItems,
  totalPages,
  startIndex,
  endIndex,
}: ProductsPaginationProps) {
  return (
    <div className="p-4 border-t border-burgundy/5 bg-ivory/20 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-burgundy/60 font-body">
        <span>Rows per page:</span>
        <select 
          aria-label="Rows per page"
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(Number(e.target.value))}
          className="bg-transparent border border-burgundy/10 rounded-md px-2 py-1 outline-none focus:border-burgundy/30 cursor-pointer text-burgundy"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span className="ml-4">{totalItems > 0 ? startIndex + 1 : 0}-{endIndex} of {totalItems}</span>
      </div>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {(() => {
            const pages = [];
            for (let i = 0; i < Math.min(5, totalPages); i++) {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }
              pages.push(pageNum);
            }
            return pages.map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink 
                  href="#" 
                  isActive={currentPage === pageNum}
                  onClick={(e) => { e.preventDefault(); setCurrentPage(pageNum); }}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ));
          })()}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
