import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import "./CustomPicInput.css";

export default function CustomPicInput({ value, onChange, name, editable = true }) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
    } else if (typeof value === "string") {
      setPreview(value);
    } else {
      setPreview("");
    }
  }, [value]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image");
        e.target.value = "";
        return;
      }
      const url = URL.createObjectURL(file);
      setPreview(url);
      onChange && onChange({ target: { name, value: file } });
    }
  };

  const handleRemove = () => {
    setPreview("");
    onChange && onChange({ target: { name, value: null } });
    const input = document.querySelector(`input[name="${name}"].pic-circle-file`);
    if (input) input.value = "";
  };

  return (
    <div className="pic-circle-container">
      {editable && (
        <input
          type="file"
          accept="image/*"
          name={name}
          onChange={handleChange}
          className="pic-circle-file"
        />
      )}

      <div
        className="pic-circle"
        onClick={
          editable
            ? () =>
                document
                  .querySelector(`input[name="${name}"].pic-circle-file`)
                  .click()
            : undefined
        }
        style={{
          backgroundImage: preview ? `url(${preview})` : "none",
          cursor: editable ? "pointer" : "default",
        }}
      >
        {!preview && <FontAwesomeIcon icon={faUser} className="pic-icon" />}
      </div>

      {editable && preview && (
        <button className="remove-pic-btn" onClick={handleRemove}>
          ✖
        </button>
      )}
    </div>
  );
}
