export function validateForm(formValues, fieldTemplates, currentType) {  
  const fields = fieldTemplates[currentType] || [];
  const errors = {};

  fields.forEach((field) => {
    let value = formValues[field.name];

    // Normalize value (trim spaces)
    if (typeof value === "string") {
      value = value.trim();
      formValues[field.name] = value; // ★ auto-clean input
    }

    // Determine if field is required
    const isRequired = field.required || (typeof field.requiredIf === "function" && field.requiredIf(formValues));

    // Required field check
    if (isRequired && (value === undefined || value === "")) {
      errors[field.name] = `${field.placeholder} is required`;
      return;
    }

    // Letters only + auto-clean multiple spaces for all fields containing "name"
    if (field.name.toLowerCase().includes("name") && value) {
      formValues[field.name] = value.replace(/\s+/g, " "); // remove double spaces

      if (!/^[A-Za-z\s]+$/.test(value)) {
        errors[field.name] = `${field.placeholder} must contain letters only`;
      } else {
        // Capitalize first letter of each word
        formValues[field.name] = formValues[field.name]
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
      }
    }

    // Email format check
    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[field.name] = "Invalid email format";
      }
    }

    // Password length check
    if (field.name === "password" && value) {
      if (value.length < 6) {
        errors[field.name] = "Password must be at least 6 characters long";
      }
    }

    // Birthday must be at least 5 years old
    if (field.name === "birthday" && value) {
      const birthDate = new Date(value);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 5);
      if (birthDate > minDate) {
        errors[field.name] = "User must be at least 5 years old";
      }
    }

    // Contact: must start 09 + length 11 + numeric
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
      if (isNaN(Number(value))) {
        errors[field.name] = `${field.placeholder} must be a number`;
      }
    }
  });

  return errors;
}
