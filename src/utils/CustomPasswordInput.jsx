import React, { useState } from "react";
import PasswordToggleIcon from "./PasswordToggleIcon";
import "./InputForm.css"; // for floating label styles

const CustomPasswordInput = ({ value, onChange, placeholder, name }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [show, setShow] = useState(false);

  const handleChange = (e) => {
    setInputValue(e.target.value);
    onChange && onChange(e);
  };

  return (
    <div className="input-container" style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        name={name}
        value={inputValue}
        onChange={handleChange}
        placeholder=" " // needed for :placeholder-shown
        className="floating-input"
      />
      <label className={`floating-label ${inputValue ? "has-value" : ""}`}>
        {placeholder}
      </label>
      
      {/* Only the icon handles the toggle */}
      <PasswordToggleIcon
        show={show}
        onToggle={() => setShow((prev) => !prev)}
        style={{
          position: "absolute",
          right: "1rem",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />
    </div>
  );
};

export default CustomPasswordInput;
