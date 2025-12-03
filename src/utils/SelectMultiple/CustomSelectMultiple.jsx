// CustomSelectMultiple.jsx
// ---------------------------
import { useState, useRef, useEffect } from "react";
import "../Select/CustomSelect.css";
import "./CustomSelectMultiple.css";
import FloatingInput from "../InputForm.jsx";
import { validateCustomOption, capitalizeWords } from "./validation.js";

export default function CustomSelectMultiple({
  options = [],
  value = [],
  onChange,
  placeholder,
  allowCustom = false,
  name = "", // field name
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const [normalizedValue, setNormalizedValue] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [localOptions, setLocalOptions] = useState(options);
  const [customError, setCustomError] = useState("");

  // Sync options with props
  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  // Normalize values and remove duplicates
  useEffect(() => {
    const norm = (value || []).map((v) => {
      if (v && v.label !== undefined && v.value !== undefined) return { ...v };
      if (v && v.id !== undefined && v.name !== undefined) return { label: v.name, value: v.id };
      if (typeof v === "number" || typeof v === "string") {
        const opt = localOptions.find(
          (o) => o.value === v || o.value.toString().toLowerCase() === String(v).toLowerCase()
        );
        return opt ? { label: opt.label, value: opt.value } : { label: String(v), value: v };
      }
      return { label: String(v), value: v };
    });

    const deduped = [];
    const seen = new Set();
    norm.forEach((v) => {
      const key = v.value.toString().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(v);
      }
    });

    setNormalizedValue(deduped);
  }, [value, localOptions]);

  const getOptionLabel = (opt) => (opt ? opt.label || String(opt.value || "") : "");
  const getValueText = () => normalizedValue.map(getOptionLabel).join(", ");

  const handleSelect = (option) => {
    let newValues = [...normalizedValue];
    const existsIndex = newValues.findIndex(
      (v) => v.value.toString().toLowerCase() === option.value.toString().toLowerCase()
    );

    if (existsIndex !== -1) newValues.splice(existsIndex, 1);
    else newValues.push(option);

    // Deduplicate
    const deduped = [];
    const seen = new Set();
    newValues.forEach((v) => {
      const key = v.value.toString().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(v);
      }
    });

    setNormalizedValue(deduped);
    onChange && onChange(deduped.map((v) => ({ label: v.label, value: v.value })));
  };

const handleCustomAdd = () => {
  const trimmedValue = customInput.trim();

  // Already selected check
  const alreadySelected = normalizedValue.some(
    (v) => v.value.toString().toLowerCase() === trimmedValue.toLowerCase()
  );
  if (alreadySelected) {
    setCustomError("Option already selected");
    setCustomInput("");
    return;
  }

  // Validate with field-specific rules
  const error = validateCustomOption(customInput, localOptions, name);
  if (error) {
    setCustomError(error);
    return;
  }

  // Add new option safely
  setCustomError("");
  const capitalized = capitalizeWords(trimmedValue);
  const newOption = { label: capitalized, value: capitalized };

  setLocalOptions((prev) => [...prev, newOption]);
  handleSelect(newOption);
  setCustomInput("");
};



  // Close dropdown on click outside
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
    <div className="input-container" ref={containerRef} style={{ position: "relative" }}>
      <input
        type="text"
        readOnly
        value={getValueText()}
        className="floating-input"
        onClick={() => setOpen((prev) => !prev)}
      />
      <label className={`floating-label ${normalizedValue.length ? "has-value" : ""}`}>
        {placeholder}
      </label>

      {open && (
        <ul className="dropdown-list">
        {localOptions.map((opt, index) => {
  const checked = normalizedValue.some(
    (v) => v.value.toString().toLowerCase() === opt.value.toString().toLowerCase()
  );
  return (
    <li key={`${opt.value}-${index}`} className="dropdown-item">
      <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => handleSelect({ label: opt.label, value: opt.value })}
          style={{ marginRight: "8px" }}
        />
        {getOptionLabel(opt)}
      </label>
    </li>
  );
})}


          {allowCustom && (
            <li className="dropdown-item add-new">
              <FloatingInput
                name="customInput"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Add new..."
              />
              <button type="button" onClick={handleCustomAdd}>
                Add
              </button>
              {customError && <p className="text-error" style={{ marginTop: "0.25rem" }}>{customError}</p>}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
