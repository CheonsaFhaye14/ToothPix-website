import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./PasswordToggleIcon.css";
const PasswordToggleIcon = ({ show, onToggle }) => {
  return (
    <span
      className="show-password-icons"
      onClick={onToggle}
      style={{ cursor: "pointer" }}
    >
      <FontAwesomeIcon icon={show ? faEye : faEyeSlash} />
    </span>
  );
};

export default PasswordToggleIcon;
