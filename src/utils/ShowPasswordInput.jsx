import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./ShowPasswordInput.css";

const ShowPasswordInput = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="password-wrapper">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <span
        className="show-password-icon"
        onClick={() => setShow(!show)}
      >
        <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
      </span>
    </div>
  );
};

export default ShowPasswordInput;
