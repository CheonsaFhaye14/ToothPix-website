import { useState, useRef, useEffect } from "react";  
import FloatingInput from "../InputForm.jsx"; 
import { validateCustomOption, capitalizeWords } from "./validation.js"; 
import "./CustomSelect.css";

export default function CustomSelect({ 
  options = [], 
  value = "", 
  onChange, 
  placeholder, 
  name,
  allowCustom = false
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || ""); // selected value
  const [customInput, setCustomInput] = useState("");       // "Add new" input
  const [localOptions, setLocalOptions] = useState(options);
  const [customError, setCustomError] = useState("");
  const containerRef = useRef(null);

useEffect(() => {
  if (value === undefined || value === null) return;

  const selectedOption = localOptions.find(
    (o) =>
      o &&
      o.value !== undefined &&
      String(o.value).toLowerCase() === String(value).toLowerCase()
  );

  if (selectedOption) {
    setInputValue(selectedOption.label);
  } else {
    // fallback to value only if it's a string/number
    if (typeof value === "string" || typeof value === "number") {
      setInputValue(value);
    }
  }
}, [value, localOptions]);

  // Sync options
  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const getOptionLabel = (opt) => {
    if (!opt) return "";
    if (typeof opt === "string" || typeof opt === "number") return opt;
    return opt.label || String(opt.value || "");
  };

const handleSelect = (option) => {
  if (!option) return;

  // Determine label and value
  const label = typeof option === "object" ? option.label : option;
  const val = typeof option === "object" ? option.value : option;

  // Show the label in the input field
  setInputValue(label);

  // Send the value to the parent form
  onChange && onChange({ target: { name, value: val } });

  setOpen(false);
};



  const handleCustomAdd = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return setCustomError("Cannot add empty value");

    // Already exists in local options
  const exists = localOptions.some((o) => {
  if (!o) return false;
  const val = typeof o === "object" ? o.value : o;
  if (!val) return false;
  return String(val).toLowerCase() === trimmed.toLowerCase();
});

    if (exists) {
      setCustomError("Option already exists");
      setCustomInput(""); // clear input for next
      return;
    }

    const error = validateCustomOption(trimmed, localOptions, name);
    if (error) {
      setCustomError(error);
      return;
    }

    // Add new option
    const newOption = { label: capitalizeWords(trimmed), value: trimmed };
    setLocalOptions((prev) => [...prev, newOption]);

    // Automatically select the new option
    handleSelect(newOption);

    // Clear the add-new input and error
    setCustomInput("");
    setCustomError("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setCustomError("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="input-container custom-select-container" ref={containerRef} style={{ position: "relative" }}>
      <input
        type="text"
        value={inputValue}
        className="floating-input"
        placeholder=""
        onClick={() => setOpen((prev) => !prev)}
        readOnly
      />
      <label className={`floating-label ${inputValue ? "has-value" : ""}`}>
        {placeholder}
      </label>

      {open && (
        <ul className="dropdown-list">
          {localOptions.map((opt) => (
            <li
              key={typeof opt === "object" ? opt.value : opt}
              className="dropdown-item"
              onClick={() => handleSelect(opt)}
            >
              {getOptionLabel(opt)}
            </li>
          ))}

          {allowCustom && (
            <li className="dropdown-item add-new">
              <FloatingInput
                name="customInput"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Add new..."
              />
              <button type="button" onClick={handleCustomAdd}>Add</button>
              {customError && (
                <p className="text-error" style={{ marginTop: "0.25rem" }}>
                  {customError}
                </p>
              )}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
