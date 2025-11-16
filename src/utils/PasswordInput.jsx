import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./InputForm.css";
import "./PasswordToggleIcon.css";

export default function PasswordInput({ value, onChange, placeholder, name }) {
  const [inputValue, setInputValue] = useState(value || "");
  const [showPassword, setShowPassword] = useState(false);

  // Sync with parent value when it changes
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
    onChange && onChange(e);
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="input-container" style={{ position: "relative" }}>
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={inputValue}
        onChange={handleChange}
        placeholder=""
        className="floating-input"
      />
      <label className={`floating-label ${inputValue ? "has-value" : ""}`}>
        {placeholder}
      </label>
      <span
        className="show-password-icons"
        onClick={togglePassword}
        style={{ cursor: "pointer" }}
      >
        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
      </span>
    </div>
  );
}
