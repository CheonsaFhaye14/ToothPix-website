import { useState, useRef, useEffect } from "react";
import "./CustomSelect.css";

export default function CustomSelect({ options = [], value = null, onChange, placeholder, name }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Get display label for an option
  const getOptionLabel = (opt) => {
    if (!opt) return "";
    if (typeof opt === "string" || typeof opt === "number") return opt;
    return opt.label || String(opt.value || "");
  };

  // Handle selecting an option
  const handleSelect = (option) => {
    let val = option;

    // If option is an object, pass the full object
    if (typeof option === "object" && option !== null) val = option;

    onChange && onChange({ target: { name, value: val } });
    setOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Display value text
  const displayValue = value ? getOptionLabel(value) : "";

  return (
    <div
      className="input-container custom-select-container"
      ref={containerRef}
      style={{ position: "relative" }}
    >
      <input
        type="text"
        readOnly
        value={displayValue}
        className="floating-input"
        onClick={() => setOpen((prev) => !prev)}
      />
      <label className={`floating-label ${displayValue ? "has-value" : ""}`}>
        {placeholder}
      </label>

      {open && (
        <ul className="dropdown-list">
          {options.map((opt) => {
            const key = typeof opt === "object" && opt !== null ? opt.value : opt;
            const label = getOptionLabel(opt);

            return (
              <li
                key={key}
                className="dropdown-item"
                onClick={() => handleSelect(opt)}
              >
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
