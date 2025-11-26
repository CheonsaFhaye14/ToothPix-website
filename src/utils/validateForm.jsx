export function validateForm(formValues, fieldTemplates, currentType) {
  const fields = fieldTemplates[currentType] || [];
  const errors = {};

  fields.forEach((field) => {
    let value = formValues[field.name];

    // Trim string values
    if (typeof value === "string") {
      value = value.trim();
      formValues[field.name] = value; // auto-clean input
    }

    // Determine if field is required
    const isRequired =
      field.required ||
      (typeof field.requiredIf === "function" && field.requiredIf(formValues));

    // Required field check
    if (isRequired) {
      if (
        value === undefined ||
        value === "" ||
        (field.type === "select-multiple" && Array.isArray(value) && value.length === 0) ||
        (field.type === "picture" && !value)
      ) {
        errors[field.name] = `${field.placeholder} is required`;
        return;
      }
    }

    // Names (letters only, capitalize) except username
    if (field.name.toLowerCase().includes("name") && field.name !== "username" && value) {
      value = value.replace(/\s+/g, " ");
      formValues[field.name] = value;

      if (!/^[A-Za-z\s]+$/.test(value)) {
        errors[field.name] = `${field.placeholder} must contain letters only`;
      } else {
        formValues[field.name] = value
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");
      }
    }

    // Username rules
    if (field.name === "username" && value) {
      if (value.length < 4) {
        errors[field.name] = "Username must be at least 4 characters long";
      } else if (/\s/.test(value)) {
        errors[field.name] = "Username must not contain spaces";
      } else if (!/^[A-Za-z]/.test(value)) {
        errors[field.name] = "Username must start with a letter";
      } else if (!/^[A-Za-z][A-Za-z0-9._-]{3,39}$/.test(value)) {
        errors[field.name] =
          "Username can contain letters, numbers, ., -, _ only (4-40 chars)";
      }
    }

    // Email validation
    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[field.name] = "Invalid email format";
      }
    }

// Password validation
if (field.name === "password" && value) {
  // Format check: uppercase, lowercase, number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  if (!regex.test(value)) {
    errors[field.name] =
      "Password must contain uppercase, lowercase letters, and a number";
  } else if (value.length < 6) {
    // Length check
    errors[field.name] = "Password must be at least 6 characters long";
  }
}



// Birthday check (at least 5 years old)
if (field.name === "birthdate" && value) {
  // Ensure value is a valid date string "YYYY-MM-DD"
  const [year, month, day] = value.split("-").map(Number);

  // Check for invalid date numbers
  if (!year || !month || !day) {
    errors[field.name] = "Invalid birthday format";
  } else {
    const birthDate = new Date(year, month - 1, day); // month is 0-indexed
    const today = new Date();

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Check age
    if (age < 5) {
      errors[field.name] = "User must be at least 5 years old";
    }
  }
}


    // Contact validation
    if (field.name === "contact" && value) {
      if (!/^[0-9]+$/.test(value)) {
        errors[field.name] = "Contact must contain numbers only";
      } else if (!value.startsWith("09")) {
        errors[field.name] = "Contact must start with 09";
      } else if (value.length !== 11) {
        errors[field.name] = "Contact must be 11 digits long";
      }
    }

 // Number type validation 
if (field.type === "number" && value !== undefined && value !== "") {
  const num = Number(value);

  if (isNaN(num)) {
    errors[field.name] = `${field.placeholder} must be a number`;
  }

  // Whole number validation ONLY for specific fields
  if (field.name === "installment_times" || field.name === "custom_interval_days") {
    if (!Number.isInteger(num)) {
      errors[field.name] = `${field.placeholder} must be a whole number`;
    } else if (num < 1) {
      errors[field.name] = `${field.placeholder} must be greater than 0`;
    }
  }
}


    // Optional: multi-select value validation (already handled in required)
  });

  return errors;
}
