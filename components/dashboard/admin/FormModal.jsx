"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/**
 * Reusable form modal component for data entry
 * @param {Object} props - Component props
 * @param {string} props.title - Modal title
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.initialData - Initial form data
 * @param {Array<Object>} props.fields - Form field definitions
 * @param {Function} props.onSubmit - Function called with form data on submit
 * @param {boolean} props.isSubmitting - Whether the form is submitting
 * @returns {JSX.Element} FormModal component
 */
export default function FormModal({
  title,
  isOpen,
  onClose,
  initialData = {},
  fields = [],
  onSubmit,
  isSubmitting = false,
}) {
  const [externalOptions, setExternalOptions] = useState({});
  // Track fields that need to be refreshed when their dependencies change
  const [fieldsToRefresh, setFieldsToRefresh] = useState([]);

  const form = useForm({
    defaultValues: initialData || {},
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      // Convert nested properties (e.g. user.name) to object structure
      const formattedData = { ...initialData };

      // Handle nested field paths in initialData
      fields.forEach((field) => {
        if (field.name.includes(".")) {
          const parts = field.name.split(".");
          let current = initialData;

          // Navigate through the nested structure
          for (let i = 0; i < parts.length - 1; i++) {
            current = current?.[parts[i]] || {};
          }

          // Get the value from the nested property if it exists
          const value = current?.[parts[parts.length - 1]];

          // Set the value in the form if it exists
          if (value !== undefined) {
            form.setValue(field.name, value);
          }
        }
      });

      // Reset form with the new values
      form.reset(formattedData);
    }
  }, [initialData, form, fields]);

  /**
   * Refresh options for a specific field
   * @param {string} fieldName - Name of field to refresh options for
   */
  const refreshFieldOptions = async (fieldName) => {
    const field = fields.find((f) => f.name === fieldName);
    if (!field || !field.optionsEndpoint) return;

    try {
      const formValues = form.getValues();

      // Determine endpoint - either static string or function that returns endpoint based on form values
      let endpoint = field.optionsEndpoint;
      if (typeof endpoint === "function") {
        endpoint = endpoint(formValues);
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch options: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Determine label and value keys from field or use defaults
        const labelKey = field.optionLabelKey || "name";
        const valueKey = field.optionValueKey || "_id";

        // Format options for select
        const options = result.data.map((item) => ({
          label:
            typeof labelKey === "function" ? labelKey(item) : item[labelKey],
          value: item[valueKey],
        }));

        setExternalOptions((prev) => ({
          ...prev,
          [field.name]: options,
        }));
      }
    } catch (error) {
      console.error(`Error refreshing options for ${field.name}:`, error);
    }
  };

  // Find fields with dependencies when fields array changes
  useEffect(() => {
    const dependentFields = fields
      .filter((field) => field.dependsOn)
      .map((field) => ({
        name: field.name,
        dependsOn: field.dependsOn,
      }));

    setFieldsToRefresh(dependentFields);
  }, [fields]);

  // Fetch options for select fields from external endpoints
  useEffect(() => {
    const fetchOptions = async () => {
      // Find fields with optionsEndpoint (both for select and multiselect)
      const fieldsWithExternalOptions = fields.filter(
        (field) =>
          (field.type === "select" || field.type === "multiselect") &&
          (field.optionsEndpoint || typeof field.optionsEndpoint === "function")
      );

      // Fetch options for each field
      const optionsPromises = fieldsWithExternalOptions.map(async (field) => {
        try {
          // Get the current form values to pass to dynamic endpoints
          const formValues = form.getValues();

          // Determine endpoint - either static string or function that returns endpoint based on form values
          let endpoint = field.optionsEndpoint;
          if (typeof endpoint === "function") {
            endpoint = endpoint(formValues);
          }

          const response = await fetch(endpoint);
          if (!response.ok) {
            throw new Error(`Failed to fetch options: ${response.status}`);
          }

          const result = await response.json();
          if (result.success) {
            // Determine label and value keys from field or use defaults
            const labelKey = field.optionLabelKey || "name";
            const valueKey = field.optionValueKey || "_id";

            // Format options for select
            const options = result.data.map((item) => ({
              label:
                typeof labelKey === "function"
                  ? labelKey(item)
                  : item[labelKey],
              value: item[valueKey],
            }));

            return { fieldName: field.name, options };
          }
          throw new Error(result.error || "Failed to load options");
        } catch (error) {
          console.error(`Error fetching options for ${field.name}:`, error);
          return { fieldName: field.name, options: [], error: error.message };
        }
      });

      // Wait for all promises to resolve
      const results = await Promise.all(optionsPromises);

      // Update options state
      const newOptions = {};
      results.forEach((result) => {
        newOptions[result.fieldName] = result.options;
      });

      setExternalOptions((prev) => ({ ...prev, ...newOptions }));
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [fields, isOpen, form]);

  /**
   * Get the value from a nested object path
   * @param {Object} obj - The object to get the value from
   * @param {string} path - The path to the value
   * @returns {any} The value at the path
   */
  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((o, key) => o?.[key], obj);
  };

  /**
   * Handle form submission
   * @param {Object} data - Form data
   */
  const handleSubmit = (data) => {
    if (onSubmit) {
      onSubmit(data);
    }
  };

  /**
   * Render a form field based on its type
   * @param {Object} field - Field definition
   * @returns {JSX.Element} Form field component
   */
  const renderField = (field) => {
    const {
      name,
      label,
      type = "text",
      required = false,
      placeholder,
      options = [],
      optionsEndpoint,
      ...rest
    } = field;

    // Get field value, handling both flat and nested properties
    const fieldValue = form.watch(name);

    // Get validation rules
    const validationRules = {
      required: required ? `${label} is required` : false,
      ...rest.validation,
    };

    // Determine if field has error
    const hasError = !!form.formState.errors[name];
    const errorMessage = form.formState.errors[name]?.message;

    // Handle different field types
    switch (type) {
      case "textarea":
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id={name}
              placeholder={placeholder}
              className={hasError ? "border-destructive" : ""}
              {...form.register(name, validationRules)}
            />
            {hasError && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
        );

      case "select":
        let selectOptions = options;

        // If endpoint is provided, use fetched options
        if (optionsEndpoint && externalOptions[name]) {
          selectOptions = externalOptions[name];
        }

        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <Select
              value={fieldValue || ""}
              onValueChange={(value) => {
                // Preserve the current value
                const currentValue = form.getValues(name);

                // Only update if the value has changed
                if (value !== currentValue) {
                  form.setValue(name, value, { shouldValidate: true });

                  // Call onChange handler if provided
                  if (field.onChange && typeof field.onChange === "function") {
                    field.onChange(value, form);
                  }

                  // Check if any fields depend on this field and refresh them
                  const dependentFields = fieldsToRefresh
                    .filter((f) => f.dependsOn === name)
                    .map((f) => f.name);

                  if (dependentFields.length > 0) {
                    dependentFields.forEach((fieldName) => {
                      refreshFieldOptions(fieldName);
                    });
                  }
                }
              }}
            >
              <SelectTrigger
                id={name}
                className={hasError ? "border-destructive" : ""}
              >
                <SelectValue placeholder={placeholder || `Select ${label}`} />
              </SelectTrigger>
              <SelectContent>
                {selectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
        );

      case "multiselect":
        let multiselectOptions = options;

        // If endpoint is provided, use fetched options
        if (optionsEndpoint && externalOptions[name]) {
          multiselectOptions = externalOptions[name];
        }

        // Convert fieldValue to array if it's not already
        const selectedValues = Array.isArray(fieldValue)
          ? fieldValue
          : fieldValue
          ? [fieldValue]
          : [];

        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <div className="flex flex-wrap gap-2 border rounded-md p-2">
              {multiselectOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${name}-${option.value}`}
                    checked={selectedValues.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter((val) => val !== option.value);
                      form.setValue(name, newValues, { shouldValidate: true });
                    }}
                  />
                  <Label
                    htmlFor={`${name}-${option.value}`}
                    className="text-sm"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {hasError && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
        );

      case "time":
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={name}
              type="time"
              value={fieldValue || ""}
              onChange={(e) =>
                form.setValue(name, e.target.value, { shouldValidate: true })
              }
              className={hasError ? "border-destructive" : ""}
              {...form.register(name, validationRules)}
            />
            {hasError && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
        );

      case "date":
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={name}
                  type="button"
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    hasError ? "border-destructive" : ""
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fieldValue ? (
                    format(new Date(fieldValue), "PPP")
                  ) : (
                    <span className="text-muted-foreground">
                      {placeholder || "Pick a date"}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fieldValue ? new Date(fieldValue) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      // Format date as ISO string
                      const isoDate = date.toISOString();
                      form.setValue(name, isoDate, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    } else {
                      form.setValue(name, "", {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }
                  }}
                  disabled={(date) => false} // Allow all dates
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {hasError && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div key={name} className="flex items-start space-x-2 space-y-0">
            <Checkbox
              id={name}
              checked={!!fieldValue}
              onCheckedChange={(checked) =>
                form.setValue(name, checked, { shouldValidate: true })
              }
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor={name}>
                {label}{" "}
                {required && <span className="text-destructive">*</span>}
              </Label>
              {hasError && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}
            </div>
          </div>
        );

      case "radio":
        return (
          <div key={name} className="space-y-2">
            <Label>
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <RadioGroup
              value={fieldValue || ""}
              onValueChange={(value) =>
                form.setValue(name, value, { shouldValidate: true })
              }
            >
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`${name}-${option.value}`}
                  />
                  <Label htmlFor={`${name}-${option.value}`}>
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {hasError && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
        );

      default: // text, email, password, number, etc.
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={name}
              type={type}
              placeholder={placeholder}
              className={hasError ? "border-destructive" : ""}
              {...(type === "number"
                ? {
                    ...form.register(name, {
                      ...validationRules,
                      valueAsNumber: true, // Convert to number
                    }),
                    min: rest.validation?.min?.value || 0,
                    step: rest.step || 1,
                  }
                : form.register(name, validationRules))}
            />
            {hasError && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 py-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(renderField)}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
