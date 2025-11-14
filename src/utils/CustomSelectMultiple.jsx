import { useState, useRef, useEffect } from "react"; 
import "./CustomSelect.css";

export default function CustomSelectMultiple({ options = [], value = [], onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const [normalizedValue, setNormalizedValue] = useState([]);

  // Normalize initial value to [{label, value}]
  useEffect(() => {
    const norm = (value || []).map(v => {
      // Already in correct format
      if (v && v.label !== undefined && v.value !== undefined) {
        return { label: v.label, value: Number(v.value) };
      }
      // From {id, name}
      if (v && v.id !== undefined && v.name !== undefined) {
        return { label: v.name, value: Number(v.id) };
      }
      // Number value
      if (typeof v === "number") {
        const opt = options.find(o => Number(o.value) === v);
        return opt ? { label: opt.label, value: Number(opt.value) } : { label: String(v), value: v };
      }
      return v;
    });

    console.log("📝 Normalized initial value:", norm);
    setNormalizedValue(norm);
  }, [value, options]); // Re-run whenever options change

  const getOptionLabel = (opt) => {
    if (!opt) return "";
    if (typeof opt === "string") return opt;
    if (opt.label) return opt.label;
    return String(opt);
  };

  const getValueText = () => {
    return Array.isArray(normalizedValue) ? normalizedValue.map(getOptionLabel).join(", ") : "";
  };

  const handleSelect = (option) => {
    let newValues = Array.isArray(normalizedValue) ? [...normalizedValue] : [];

    const exists = newValues.some(v => v.value === option.value);

    if (exists) {
      newValues = newValues.filter(v => v.value !== option.value);
    } else {
      newValues.push(option);
    }

    console.log("📝 Updated selected values:", newValues);
    setNormalizedValue(newValues);
    onChange && onChange(newValues);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="input-container custom-select-container" ref={containerRef} style={{ position: "relative" }}>
      <input
        type="text"
        readOnly
        value={getValueText()}
        className="floating-input"
        onClick={() => setOpen(prev => !prev)}
      />
      <label className={`floating-label ${normalizedValue && normalizedValue.length ? "has-value" : ""}`}>
        {placeholder}
      </label>

      {open && (
        <ul className="dropdown-list">
          {options.map((opt) => {
            const checked = normalizedValue.some(v => Number(v.value) === Number(opt.value));
            return (
              <li key={opt.value} className="dropdown-item">
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleSelect({ label: opt.label, value: Number(opt.value) })}
                    style={{ marginRight: "8px" }}
                  />
                  {getOptionLabel(opt)}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
