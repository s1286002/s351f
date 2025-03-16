"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Enhanced pagination controls for data tables
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.pageSize - Items per page
 * @param {Array<number>} props.pageSizeOptions - Available page size options
 * @param {Function} props.onPageChange - Page change handler
 * @param {Function} props.onPageSizeChange - Page size change handler
 * @returns {JSX.Element} PaginationControls component
 */
export default function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
}) {
  const [visiblePages, setVisiblePages] = useState([]);

  // Calculate visible page numbers
  useEffect(() => {
    const calculateVisiblePages = () => {
      const delta = 1; // Number of pages to show before and after current page
      const range = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      // Always show first page
      if (range.length > 0 && range[0] > 2) {
        range.unshift("ellipsis-start");
      }

      if (totalPages >= 1 && (range.length === 0 || range[0] !== 1)) {
        range.unshift(1);
      }

      // Always show last page
      if (range.length > 0 && range[range.length - 1] < totalPages - 1) {
        range.push("ellipsis-end");
      }

      if (
        totalPages > 1 &&
        (range.length === 0 || range[range.length - 1] !== totalPages)
      ) {
        range.push(totalPages);
      }

      setVisiblePages(range);
    };

    calculateVisiblePages();
  }, [currentPage, totalPages]);

  // Disable buttons when at first/last page
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages || totalPages === 0;

  // Calculate item range being displayed
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(startItem + pageSize - 1, totalItems);

  return (
    <div className="flex flex-col gap-4 w-full mt-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Items per page selector */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Show</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue>{pageSize}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>

        {/* Item count display */}
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          {totalItems > 0
            ? `${startItem}-${endItem} of ${totalItems}`
            : "0 results"}
        </div>
      </div>

      {/* Page navigation - always show */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1 border rounded-md p-1">
          {/* Previous page button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={isFirstPage}
            className="flex items-center gap-1 h-8"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {/* Page numbers */}
          <div className="flex items-center">
            {visiblePages.map((page, i) => {
              if (page === "ellipsis-start" || page === "ellipsis-end") {
                return (
                  <span
                    key={page}
                    className="mx-1 w-8 h-8 flex items-center justify-center text-muted-foreground"
                  >
                    &hellip;
                  </span>
                );
              }

              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  className="w-8 h-8 mx-1"
                  onClick={() => onPageChange(page)}
                  disabled={currentPage === page}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          {/* Next page button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLastPage}
            className="flex items-center gap-1 h-8"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Direct page input for larger datasets */}
      {totalPages > 5 && (
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-sm">Go to page:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
            }}
            className="w-16 h-8 border rounded-md text-center"
          />
          <span className="text-sm text-muted-foreground">of {totalPages}</span>
        </div>
      )}
    </div>
  );
}
