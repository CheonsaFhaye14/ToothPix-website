import { useState, useEffect } from "react";
import "./InputForm.css"; 

export default function FloatingInput({ value, onChange, placeholder, name, disabled = false, readOnly = false }) {
  const [inputValue, setInputValue] = useState(value || "");

  // ✅ Sync with parent value when it changes
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleChange = (e) => {
    if (disabled || readOnly) return; // prevent editing when locked
    setInputValue(e.target.value);
    onChange && onChange(e);
  };

  return (
    <div className="input-container">
      <input
        type="text"
        name={name}
        value={inputValue}
        onChange={handleChange}
        placeholder=""
        className="floating-input"
        disabled={disabled}
        readOnly={readOnly}
      />
      <label className={`floating-label ${inputValue ? "has-value" : ""}`}>
        {placeholder}
      </label>
    </div>
  );
}
