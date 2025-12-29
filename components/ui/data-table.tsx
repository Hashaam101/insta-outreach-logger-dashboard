"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageSize?: number
  enableServerPagination?: boolean
  pageCount?: number
  currentPage?: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 15,
  enableServerPagination = false,
  pageCount: serverPageCount = -1,
  currentPage: serverPage = 1,
}: DataTableProps<TData, TValue>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: (serverPage || 1) - 1,
        pageSize: pageSize,
      },
    },
    manualPagination: enableServerPagination,
    pageCount: serverPageCount,
  })

  const navigateToPage = (index: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", (index + 1).toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const finalPageCount = enableServerPagination ? serverPageCount : table.getPageCount()
  const currentPageIndex = enableServerPagination ? (serverPage - 1) : table.getState().pagination.pageIndex
  const displayPage = currentPageIndex + 1

  return (
    <div className="w-full">
      <ScrollArea className="w-full">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-primary/5 hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="h-11 px-4">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <span className="text-sm">No results found</span>
                      <span className="text-xs opacity-60">Try adjusting your search or filters</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Pagination */}
      {finalPageCount > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-primary/5 gap-4">
          <div className="text-xs text-muted-foreground order-2 sm:order-1">
            Page {displayPage} of {finalPageCount} ({enableServerPagination ? 'server-side' : data.length + ' total'})
          </div>
          <div className="flex items-center gap-1 order-1 sm:order-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => enableServerPagination ? navigateToPage(0) : table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => enableServerPagination ? navigateToPage(currentPageIndex - 1) : table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, finalPageCount) }, (_, i) => {
                let pageNum: number
                if (finalPageCount <= 5) {
                  pageNum = i + 1
                } else if (displayPage <= 3) {
                  pageNum = i + 1
                } else if (displayPage >= finalPageCount - 2) {
                  pageNum = finalPageCount - 4 + i
                } else {
                  pageNum = displayPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={displayPage === pageNum ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-8 w-8 text-xs",
                      displayPage === pageNum && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => enableServerPagination ? navigateToPage(pageNum - 1) : table.setPageIndex(pageNum - 1)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => enableServerPagination ? navigateToPage(currentPageIndex + 1) : table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => enableServerPagination ? navigateToPage(finalPageCount - 1) : table.setPageIndex(finalPageCount - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}