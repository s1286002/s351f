"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";

/**
 * Reusable filter bar component for data filtering
 * @param {Object} props - Component props
 * @param {Array<Object>} props.filters - Filter definitions
 * @param {Function} props.onApplyFilters - Function called when filters are applied
 * @param {Function} props.onResetFilters - Function called when filters are reset
 * @returns {JSX.Element} FilterBar component
 */
export default function FilterBar({
  filters = [],
  onApplyFilters,
  onResetFilters,
}) {
  const [expanded, setExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(
    filters.reduce((acc, filter) => {
      acc[filter.name] = filter.value || "";
      return acc;
    }, {})
  );

  /**
   * Check if any filter has a value
   * @returns {boolean} True if any filter has a value
   */
  const hasActiveFilters = () => {
    return Object.values(localFilters).some(
      (value) =>
        value !== "" &&
        value !== null &&
        value !== undefined &&
        (typeof value !== "object" || Object.keys(value).length > 0)
    );
  };

  /**
   * Update a filter value
   * @param {string} name - Filter name
   * @param {any} value - Filter value
   */
  const updateFilter = (name, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Apply the current filters
   */
  const applyFilters = () => {
    if (onApplyFilters) {
      // Remove empty filters
      const appliedFilters = Object.entries(localFilters)
        .filter(
          ([_, value]) => value !== "" && value !== null && value !== undefined
        )
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      onApplyFilters(appliedFilters);
    }
  };

  /**
   * Reset all filters
   */
  const resetFilters = () => {
    const emptyFilters = filters.reduce((acc, filter) => {
      acc[filter.name] = "";
      return acc;
    }, {});

    setLocalFilters(emptyFilters);

    if (onResetFilters) {
      onResetFilters();
    }
  };

  /**
   * Render a filter input based on its type
   * @param {Object} filter - Filter definition
   * @returns {JSX.Element} Filter input component
   */
  const renderFilterInput = (filter) => {
    const { name, label, type, options = [], onChange, ...rest } = filter;

    switch (type) {
      case "select":
        return (
          <div className="space-y-1" key={name}>
            <Label htmlFor={name}>{label}</Label>
            <Select
              value={localFilters[name] || ""}
              onValueChange={(value) => {
                updateFilter(name, value);
                if (onChange) onChange(value);
              }}
            >
              <SelectTrigger id={name}>
                <SelectValue placeholder={`Select ${label}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "date":
        return (
          <div className="space-y-1" key={name}>
            <Label htmlFor={name}>{label}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={name}
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters[name] ? (
                    format(new Date(localFilters[name]), "PPP")
                  ) : (
                    <span className="text-muted-foreground">Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    localFilters[name]
                      ? new Date(localFilters[name])
                      : undefined
                  }
                  onSelect={(date) => {
                    updateFilter(name, date ? date.toISOString() : "");
                    if (onChange) onChange(date ? date.toISOString() : "");
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case "number":
        return (
          <div className="space-y-1" key={name}>
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              type="number"
              value={localFilters[name] || ""}
              onChange={(e) => {
                updateFilter(name, e.target.value);
                if (onChange) onChange(e.target.value);
              }}
              {...rest}
            />
          </div>
        );

      default: // text
        return (
          <div className="space-y-1" key={name}>
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              type="text"
              value={localFilters[name] || ""}
              onChange={(e) => {
                updateFilter(name, e.target.value);
                if (onChange) onChange(e.target.value);
              }}
              {...rest}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          Filters{" "}
          {hasActiveFilters() &&
            `(${Object.values(localFilters).filter((v) => v).length})`}
        </Button>

        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4 border-t">
          {filters.map((filter) => renderFilterInput(filter))}

          <div className="flex items-end space-x-2 md:col-span-2 lg:col-span-3 xl:col-span-4">
            <Button onClick={applyFilters}>Apply Filters</Button>
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
