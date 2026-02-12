"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DataPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

const buildPages = (page: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  pages.add(page);
  pages.add(Math.max(2, page - 1));
  pages.add(Math.min(totalPages - 1, page + 1));

  return Array.from(pages).sort((a, b) => a - b);
};

export function DataPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: DataPaginationProps) {
  const shouldShowPageSize = Boolean(onPageSizeChange);
  const totalPages = useMemo(() => {
    if (!total) return 1;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  const pages = useMemo(() => buildPages(page, totalPages), [page, totalPages]);

  if (total <= 0) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row pt-4">
      <div className="text-sm text-muted-foreground">
        Página {page} de {totalPages} • {total} registros
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {shouldShowPageSize && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Itens por página</span>
            <Select
              value={String(pageSize)}
              onValueChange={value => onPageSizeChange?.(Number(value))}
            >
              <SelectTrigger className="h-9 w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(option => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              />
            </PaginationItem>

            {pages.map((pageNumber, index) => {
              const prevPage = pages[index - 1];
              const shouldEllipsis = prevPage && pageNumber - prevPage > 1;

              return [
                shouldEllipsis ? (
                  <PaginationItem key={`ellipsis-${pageNumber}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : null,
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={pageNumber === page}
                    onClick={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>,
              ];
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
