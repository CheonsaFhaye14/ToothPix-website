// ---------------------------
// Validate custom option for CustomSelectMultiple
export function validateCustomOption(option, existingOptions, fieldName = "") {
  const trimmed = option.trim();

  // ❌ Empty check
  if (!trimmed) return "Cannot add empty option";

  // ❌ Duplicate check (case-insensitive)
  const duplicate = existingOptions.some(
    (o) => o.value.toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) return "Option already exists";

  // ✅ Field-specific rules
  if (fieldName === "medicalhistory") {
    // Allow numbers, letters, and common punctuation
    // Limit to 255 characters
    if (trimmed.length > 255) return "Medical history is too long";
    if (!/^[a-zA-Z0-9\s.,'-()]+$/.test(trimmed)) return "Invalid characters in medical history";
  }

  if (fieldName === "allergies") {
    // Allergies: allow numbers, letters, spaces, hyphens, commas, parentheses
    if (trimmed.length > 255) return "Allergy name is too long";
    if (!/^[a-zA-Z0-9\s.,'-()]+$/.test(trimmed)) return "Invalid characters in allergy name";
  }

  return ""; // ✅ No error
}

// Capitalize words helper
export function capitalizeWords(str) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}
