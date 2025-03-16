"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Advanced search input component with debounce for data tables
 * @param {Object} props - Component props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Change handler for search
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.debounceMs - Debounce delay in milliseconds
 * @param {string} props.className - Additional class names
 * @returns {JSX.Element} SearchInput component
 */
export default function SearchInput({
  value = "",
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  className,
}) {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced search handler
  const debouncedSearch = useCallback(
    (searchValue) => {
      clearTimeout(debounceTimerRef.current);

      if (searchValue.trim() === value.trim()) return;

      debounceTimerRef.current = setTimeout(() => {
        onChange(searchValue);
      }, debounceMs);
    },
    [onChange, value, debounceMs]
  );

  // Handle input change
  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedSearch(newValue);
  };

  // Handle clear button click
  const handleClear = () => {
    setLocalValue("");
    onChange("");
    inputRef.current?.focus();
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    clearTimeout(debounceTimerRef.current);
    onChange(localValue);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative w-full max-w-md", className)}
    >
      <Search
        className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />

      <Input
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        className="pl-8 pr-10"
        aria-label="Search input"
      />

      {localValue && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-2 py-0"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </form>
  );
}
