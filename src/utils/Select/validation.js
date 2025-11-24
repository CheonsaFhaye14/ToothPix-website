// validation.js

export function validateCustomOption(value, options = [], fieldName = "") {
  if (!value || !value.trim()) return "Value is required";

  // Duplicate check (case-insensitive)
  const exists = options.some(opt => {
    if (!opt || opt.value === undefined || opt.value === null) return false;
    return String(opt.value).toLowerCase() === value.trim().toLowerCase();
  });

  if (exists) return "This option already exists";

  // Field-specific rules
  if (fieldName === "category") {
    if (value.trim().length < 2) return "Category name must be at least 2 characters";
    if (value.trim().length > 50) return "Category name is too long";
    if (!/^[\w\s-]+$/.test(value.trim())) return "Category name contains invalid characters";
  }

  return ""; // no error
}

export function capitalizeWords(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}
