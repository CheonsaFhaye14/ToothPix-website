import { useState, useEffect } from "react";
import "./InputForm.css"; 

export default function FloatingInput({ value, onChange, placeholder, name }) {
  const [inputValue, setInputValue] = useState(value || "");

  // ✅ Sync with parent value when it changes (fix reset)
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleChange = (e) => {
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
      />
      <label className={`floating-label ${inputValue ? "has-value" : ""}`}>
        {placeholder}
      </label>
    </div>
  );
}
