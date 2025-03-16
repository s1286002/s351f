"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SearchInput from "./SearchInput";
import PaginationControls from "./PaginationControls";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Search,
  ArrowUpDown,
  Trash2,
} from "lucide-react";

/**
 * Reusable data table component for admin pages
 * @param {Object} props - Component props
 * @param {Array<Object>} props.columns - Column definitions
 * @param {Array<Object>} props.data - Table data
 * @param {number} props.totalCount - Total number of items
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.pageSize - Items per page
 * @param {Array<number>} props.pageSizeOptions - Available page size options
 * @param {Function} props.onPageChange - Page change handler
 * @param {Function} props.onPageSizeChange - Page size change handler
 * @param {Function} props.onSortChange - Sort change handler
 * @param {Function} props.onSearch - Search handler
 * @param {Function} props.onRowClick - Row click handler
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @param {Function} props.onView - View handler
 * @param {Function} props.onBulkDelete - Bulk delete handler
 * @param {Array<Object>} props.bulkActions - Custom bulk actions
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} DataTable component
 */
export default function DataTable({
  columns = [],
  data = [],
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onSearch,
  searchValue = "",
  onRowClick,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
  bulkActions = [],
  isLoading = false,
}) {
  const [selected, setSelected] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);

  // Reset selected items when data changes
  useEffect(() => {
    setSelected([]);
  }, [data]);

  /**
   * Toggle selection of a single row
   * @param {string} id - Row ID
   */
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  /**
   * Toggle selection of all rows
   */
  const toggleSelectAll = () => {
    if (selected.length === data.length) {
      setSelected([]);
    } else {
      setSelected(data.map((item) => item._id));
    }
  };

  /**
   * Handle sort change
   * @param {string} field - Field to sort by
   */
  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortField(field);
    setSortDirection(isAsc ? "desc" : "asc");

    if (onSortChange) {
      onSortChange(field, isAsc ? "desc" : "asc");
    }
  };

  // Default bulk delete action
  const defaultBulkActions = onBulkDelete
    ? [
        {
          label: "Delete Selected",
          icon: Trash2,
          variant: "destructive",
          onClick: onBulkDelete,
        },
      ]
    : [];

  // Combine default and custom bulk actions
  const allBulkActions = [...defaultBulkActions, ...bulkActions];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Search component */}
        <SearchInput
          value={searchValue}
          onChange={onSearch}
          placeholder="Search items..."
        />

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selected.length} selected
            </span>
            {allBulkActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => action.onClick(selected)}
                className="flex items-center gap-1"
              >
                {action.icon && <action.icon className="h-4 w-4 mr-1" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {allBulkActions.length > 0 && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={data.length > 0 && selected.length === data.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}

              {columns.map((column, i) => (
                <TableHead
                  key={i}
                  className={
                    column.sortable ? "cursor-pointer select-none" : ""
                  }
                  onClick={
                    column.sortable ? () => handleSort(column.field) : undefined
                  }
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <div className="ml-1">
                        {sortField === column.field ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}

              {(onEdit || onDelete || onView) && (
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (allBulkActions.length > 0 ? 1 : 0) +
                    (onEdit || onDelete || onView ? 1 : 0)
                  }
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (allBulkActions.length > 0 ? 1 : 0) +
                    (onEdit || onDelete || onView ? 1 : 0)
                  }
                  className="h-24 text-center"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={row._id}
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {allBulkActions.length > 0 && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.includes(row._id)}
                        onCheckedChange={() => toggleSelect(row._id)}
                        aria-label={`Select row ${row._id}`}
                      />
                    </TableCell>
                  )}

                  {columns.map((column, i) => (
                    <TableCell key={i}>
                      {column.render ? (
                        column.render(row)
                      ) : column.field === "status" ? (
                        <Badge
                          variant={
                            row[column.field] === "active"
                              ? "outline"
                              : row[column.field] === "disabled"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {row[column.field]}
                        </Badge>
                      ) : column.field.includes(".") ? (
                        // Handle nested fields like "user.name"
                        column.field
                          .split(".")
                          .reduce((obj, key) => obj?.[key], row) || "N/A"
                      ) : (
                        row[column.field] || "N/A"
                      )}
                    </TableCell>
                  ))}

                  {(onEdit || onDelete || onView) && (
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>

                          {onView && (
                            <DropdownMenuItem onClick={() => onView(row)}>
                              View details
                            </DropdownMenuItem>
                          )}

                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(row)}>
                              Edit
                            </DropdownMenuItem>
                          )}

                          {onDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => onDelete(row._id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Enhanced pagination controls - always show */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
