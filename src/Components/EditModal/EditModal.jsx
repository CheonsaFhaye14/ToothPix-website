import { useState, useEffect, useCallback } from "react";
import PasswordToggleIcon from "../../utils/PasswordToggleIcon";
import CustomSelect from "../../utils/Select/CustomSelect";
import CustomDate from "../../utils/CustomDate";
import FloatingInput from "../../utils/InputForm";
import CustomSelectMultiple from "../../utils/SelectMultiple/CustomSelectMultiple";
import CustomPicInput from "../../utils/CustomPicInput";
import "./AddModal.css";
import { validateForm } from "../../utils/validateForm";

export default function EditModal({ datatype, choices, selected, fields, initialValues, onClose, onSubmit }) {
  const [currentType, setCurrentType] = useState(selected);
  const [showPasswordFields, setShowPasswordFields] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize form values based on current type or initialValues
  const initializeFormValues = useCallback((type) => {
    const currentFields = fields[type] || [];
    const initValues = currentFields.reduce((acc, field) => {
      if (initialValues && initialValues[field.name] !== undefined) {
        acc[field.name] = initialValues[field.name];
      } else if (field.type === "checkbox") acc[field.name] = false;
      else if (field.type === "multi-select") acc[field.name] = [];
      else acc[field.name] = "";
      return acc;
    }, {});

    const passwordStates = currentFields
      .filter((f) => f.type === "password")
      .reduce((acc, f) => {
        acc[f.name] = false;
        return acc;
      }, {});

    setShowPasswordFields(passwordStates);

    return initValues;
  }, [fields, initialValues]);

  const [formValues, setFormValues] = useState(() => initializeFormValues(currentType));

  useEffect(() => {
    setFormValues(initializeFormValues(currentType));
    setErrors({});
  }, [currentType, initializeFormValues]);

  const handleChange = (e) => {
    let name, newValue;

    if (e.target && e.target.name) {
      name = e.target.name;
      if (e.target.type === "checkbox") newValue = e.target.checked;
      else if (e.target.type === "file") newValue = e.target.files[0];
      else newValue = e.target.value;
    } else if (e.name) {
      name = e.name;
      newValue = e.value;
    } else return;

    const updatedValues = { ...formValues, [name]: newValue };
    setFormValues(updatedValues);

    const validationErrors = validateForm(updatedValues, fields, currentType);
    setErrors(prev => ({ ...prev, [name]: validationErrors[name] || "" }));
  };

  const handleSubmit = () => {
    const validationErrors = validateForm(formValues, fields, currentType);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const normalizedValues = { ...formValues };

    (fields[currentType] || []).forEach((field) => {
      const val = normalizedValues[field.name];
      if (field.type === "select") normalizedValues[field.name] = typeof val === "object" ? val.value : val;
      if (field.type === "select-multiple" && Array.isArray(val)) normalizedValues[field.name] = val.map(v => v.value || v);
      if (field.type === "picture") normalizedValues[field.name] = val; // File object
    });

    const finalValues = { ...normalizedValues, [datatype]: currentType.toLowerCase() };
    console.log("Edit Submission Data:", finalValues);

    if (onSubmit) onSubmit(finalValues);
  };

  const togglePasswordVisibility = (name) => {
    setShowPasswordFields(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const dynamicTitle = `Edit ${currentType}`;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2 className="modal-title">{dynamicTitle}</h2>

        {choices && choices.length > 1 && (
          <div className="modal-choice-bar">
            {choices.map((choice) => (
              <button
                key={choice}
                className={`choice-btn ${choice === currentType ? "active" : ""}`}
                onClick={() => setCurrentType(choice)}
              >
                {choice}
              </button>
            ))}
          </div>
        )}

        <div className="modal-body">
          <div className="modal-form">
            {fields[currentType]?.map((field) => {
              if (field.showIf && typeof field.showIf === "function" && !field.showIf(formValues, field)) return null;

              const isRequired = field.required || (field.requiredIf && field.requiredIf(formValues));
              const labelText = isRequired ? `*${field.placeholder}` : `${field.placeholder} (optional)`;

              // Date
              if (["date", "pastdate", "futuredate"].includes(field.type)) {
                let minDate, maxDate;
                const today = new Date();
                if (field.type === "pastdate") maxDate = today;
                else if (field.type === "futuredate") minDate = today;

                return (
                  <div className="input-container" key={field.name}>
                    <CustomDate
                      name={field.name}
                      value={formValues[field.name]}
                      onChange={handleChange}
                      placeholder={labelText}
                      minDate={minDate}
                      maxDate={maxDate}
                    />
                    {errors[field.name] && <p className="text-error">{errors[field.name]}</p>}
                  </div>
                );
              }

              // Picture
              if (field.type === "picture") {
                return (
                  <div className="input-container" key={field.name}>
                    <CustomPicInput
                      name={field.name}
                      value={formValues[field.name]}
                      onChange={handleChange}
                    />
                    {errors[field.name] && <p className="text-error">{errors[field.name]}</p>}
                  </div>
                );
              }

              // Checkbox
              if (field.type === "checkbox") {
                return (
                  <div className="input-container" key={field.name}>
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={formValues[field.name] || false}
                      onChange={handleChange}
                      className="modal-input"
                    />
                    <label className="modal-label">{labelText}</label>
                    {errors[field.name] && <p className="text-error">{errors[field.name]}</p>}
                  </div>
                );
              }

              // Password
              if (field.type === "password") {
                return (
                  <div key={field.name}>
                    <div className="input-container password-wrapper" style={{ position: "relative" }}>
                      <input
                        type={showPasswordFields[field.name] ? "text" : "password"}
                        name={field.name}
                        value={formValues[field.name] || ""}
                        onChange={handleChange}
                        className="floating-input"
                        placeholder=" "
                      />
                      <label className={`floating-label ${formValues[field.name] ? "has-value" : ""}`}>
                        {labelText}
                      </label>
                      <PasswordToggleIcon
                        show={showPasswordFields[field.name]}
                        onToggle={() => togglePasswordVisibility(field.name)}
                        style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)" }}
                      />
                    </div>
                    {errors[field.name] && <p className="text-error">{errors[field.name]}</p>}
                  </div>
                );
              }

              // Multi-select
              if (field.type === "select-multiple") {
                const normalizedOptions = (field.options || []).map(o => typeof o === "string" ? { label: o, value: o } : o);
                const selectedOptions = normalizedOptions.filter(opt => formValues[field.name]?.includes(opt.value));

                return (
                  <div className="input-container" key={field.name}>
                    <CustomSelectMultiple
                      options={normalizedOptions}
                      value={selectedOptions}
                      allowCustom={field.allowCustom}
                      onChange={(updatedOptions) => {
                        const values = updatedOptions.map(o => o.value);
                        handleChange({ target: { name: field.name, value: values } });
                      }}
                      placeholder={labelText}
                      name={field.name}
                    />
                    {errors[field.name] && <p className="text-error">{errors[field.name]}</p>}
                  </div>
                );
              }

              // Select / default input
              if (field.type === "select") {
                return (
                  <div className="input-container" key={field.name}>
                    <CustomSelect
                      options={field.options || []}
                      value={formValues[field.name]}
                      onChange={handleChange}
                      placeholder={labelText}
                      name={field.name}
                    />
                    {errors[field.name] && <p className="text-error">{errors[field.name]}</p>}
                  </div>
                );
              }

              return (
                <div className="input-container" key={field.name}>
                  <FloatingInput
                    name={field.name}
                    value={formValues[field.name] || ""}
                    onChange={handleChange}
                    placeholder={labelText}
                  />
                  {errors[field.name] && <p className="text-error">{errors[field.name]}</p>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-buttons">
          <button type="button" className="btn-submit" onClick={handleSubmit}>
            Update
          </button>
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
