import { useState, useEffect, useCallback } from "react";
import PasswordToggleIcon from "../../utils/PasswordToggleIcon";
import CustomSelect from "../../utils/Select/CustomSelect";
import CustomDate from "../../utils/CustomDate";
import FloatingInput from "../../utils/InputForm"; // your floating label input
import "./AddModal.css";
 import { validateForm } from "../../utils/validateForm"; // adjust path
import CustomSelectMultiple from "../../utils/SelectMultiple/CustomSelectMultiple"; // import the new component
import CustomPicInput from "../../utils/CustomPicInput"; // <-- new image input
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function AddModal({ datatype, choices, selected, fields, onClose, onSubmit })
{
  const [currentType, setCurrentType] = useState(selected); // default to selected choice
  const [showPasswordFields, setShowPasswordFields] = useState({}); 
  const [errors, setErrors] = useState({});
  const currentFields = fields[currentType] || [];  // fields for current type
  const [loading, setLoading] = useState(false);

  // Initialize form values based on current type
const initializeFormValues = useCallback((type) => {

    const currentFields = fields[type] || [];

    // Set initial values based on field types
    const initValues = currentFields.reduce((acc, field) => {
    if (field.type === "checkbox") acc[field.name] = false;
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
}, [fields]);

    const [formValues, setFormValues] = useState(() => initializeFormValues(currentType));

// Reset form values and errors when currentType changes
useEffect(() => {
  setFormValues(initializeFormValues(currentType));
  setErrors({}); // reset errors
}, [currentType, initializeFormValues]);



// Handle input changes
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

  // Show only current field error live (optional)
  setErrors(prev => ({
    ...prev,
    [name]: validationErrors[name] || ""
  }));
};



// Handle form submission
const handleSubmit = () => {

   setLoading(true);

  // Validate all fields
  const validationErrors = validateForm(formValues, fields, currentType);

  // If there are errors, mark all fields as touched and show errors
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    setLoading(false);
    return;
  }

  // Normalize values (like select -> value, picture -> File)
  const normalizedValues = { ...formValues };

  (fields[currentType] || []).forEach((field) => {
    const val = normalizedValues[field.name];

    if (field.type === "select") {
      if (typeof val === "string") {
        normalizedValues[field.name] = val.toLowerCase();
      } else if (val && typeof val === "object") {
        normalizedValues[field.name] = String(val.value).toLowerCase();
      }
    }

    if (field.type === "select-multiple" && Array.isArray(val)) {
      normalizedValues[field.name] = val.map(v => String(v).toLowerCase());
    }

    if (field.type === "picture") {
      normalizedValues[field.name] = val; // File object or null
    }
  });

  // Include currentType
  const finalValues = {
    ...normalizedValues,
    [datatype]: currentType.toLowerCase(),
  };

  if (onSubmit) {
    onSubmit(finalValues);
  }
  setLoading(false);
};



  const togglePasswordVisibility = (name) => {
    setShowPasswordFields((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };




  const dynamicTitle = `Add New ${currentType}`;

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
  {currentFields.map((field) => {
    // ✅ ShowIf logic: only render if showIf returns true (or no showIf defined)
  if (field.showIf && typeof field.showIf === "function" && !field.showIf(formValues, field)) {
  return null;
}


   const isRequired = field.required || (field.requiredIf && field.requiredIf(formValues));

const labelText = isRequired 
  ? `*${field.placeholder}` 
  : `${field.placeholder} (optional)`;

// Time field (special case: futuretime / pasttime)
if (field.name === "time") {
  let availableTimes = field.options || [];
  const selectedDate = formValues["date"];
  const today = new Date();

  if (selectedDate) {
    const selected = new Date(selectedDate);
    const isToday =
      selected.getFullYear() === today.getFullYear() &&
      selected.getMonth() === today.getMonth() &&
      selected.getDate() === today.getDate();

    if (isToday) {
      // Determine time filtering based on date type
      if (fields[currentType].find(f => f.name === "date")?.type === "futuredate") {
        // Keep only times equal or after now
        const nowMinutes = today.getHours() * 60 + today.getMinutes();
        availableTimes = availableTimes.filter(opt => {
          const [h, m] = opt.value.split(":").map(Number);
          return h * 60 + m >= nowMinutes;
        });
      } else if (fields[currentType].find(f => f.name === "date")?.type === "pastdate") {
        // Keep only times equal or before now
        const nowMinutes = today.getHours() * 60 + today.getMinutes();
        availableTimes = availableTimes.filter(opt => {
          const [h, m] = opt.value.split(":").map(Number);
          return h * 60 + m <= nowMinutes;
        });
      }
    }
  }

  return (
    <div className="input-container" key={field.name}>
      <CustomSelect
        options={availableTimes}
        value={formValues[field.name]}
        onChange={handleChange}
        placeholder={labelText}
        name={field.name}
      />
      {errors[field.name] && <p className="text-error">{errors[field.name]}</p>}
    </div>
  );
}

// Select field
if (field.type === "select") {

  return (
    <div className="input-container" key={field.name}>
      <CustomSelect
        options={field.options || []}
        value={formValues[field.name]}
       onChange={(e) => {
  let rawValue = e.target.value;

  // Convert string "true"/"false" into real boolean
  if (rawValue === "true") rawValue = true;
  if (rawValue === "false") rawValue = false;

  // Normalize for comparisons (only trim if string)
  const inputVal =
    typeof rawValue === "string" ? rawValue.trim() : rawValue;

  // If still empty string
  if (inputVal === "") {
    handleChange({ target: { name: field.name, value: "" } });
    return;
  }

  // Normalize options to consistent objects
  const normalizedOptions = (field.options || []).map((o) =>
    typeof o === "string"
      ? { label: o, value: o }
      : { label: o.label, value: o.value }
  );

  // Find match ignoring case, stringified comparison
  const existingOption = normalizedOptions.find(
    (o) =>
      o &&
      o.value !== undefined &&
      String(o.value).toLowerCase() === String(inputVal).toLowerCase()
  );

  let selectedValue = inputVal;
  let displayLabel = inputVal;

  if (existingOption) {
    selectedValue = existingOption.value;
    displayLabel = existingOption.label;
  } else if (field.allowCustom && typeof inputVal === "string") {
    // Capitalize custom label
    displayLabel = inputVal
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const newOption = { label: displayLabel, value: inputVal };

    // Add new custom option
    field.options = [...normalizedOptions, newOption];
  }

  handleChange({
    target: { name: field.name, value: selectedValue },
  });
}}

        placeholder={labelText}
        name={field.name}
        allowCustom={field.allowCustom}
      />

      {errors[field.name] && (
        <p className="text-error">{errors[field.name]}</p>
      )}
    </div>
    
  );
}
if (field.type === "select-multiple") {
  // Normalize options
  const normalizedOptions = (field.options || []).map((o) =>
    typeof o === "string" ? { label: o, value: o } : o
  );

  const selectedOptions = normalizedOptions.filter((opt) =>
    formValues[field.name]?.includes(opt.value)
  );

  return (
    <div className="input-container" key={field.name}>
      <CustomSelectMultiple
        options={normalizedOptions}
        value={selectedOptions}
        allowCustom={field.allowCustom}
        onChange={(updatedOptions) => {
          if (!updatedOptions) return;

          const values = updatedOptions.map((o) => o.value);

          handleChange({ target: { name: field.name, value: values } });

          if (field.allowCustom) {
            const newOptions = updatedOptions.filter(
              (o) =>
                !normalizedOptions.some(
                  (existing) => existing.value === o.value
                )
            );

            if (newOptions.length) {
              field.options = [...normalizedOptions, ...newOptions];
            }
          }
        }}
        placeholder={labelText}
        name={field.name}
      />

      {errors[field.name] && (
        <p className="text-error">{errors[field.name]}</p>
      )}
    </div>
  );
}



// Date field
if (field.type === "date" || field.type === "pastdate" || field.type === "futuredate") {
  let minDate, maxDate;
  const today = new Date();

  if (field.type === "pastdate") {
    // Allow only today and past
    maxDate = today; // today is max
  } else if (field.type === "futuredate") {
    // Allow only today and future
    minDate = today; // today is min
  }

  return (
    <div className="input-container" key={field.name} style={{ marginBottom: "1.5rem" }}>
      <CustomDate
        name={field.name}
        value={formValues[field.name]}
        onChange={handleChange}
        placeholder={labelText}
        minDate={minDate}
        maxDate={maxDate}
      />
      {errors[field.name] && (
        <p className="text-error" style={{ marginTop: "0.3rem" }}>
          {errors[field.name]}
        </p>
      )}
    </div>
  );
}


    // Picture / File input field
if (field.type === "picture") {
  return (
    <div className="input-container" key={field.name}>
      <CustomPicInput
        name={field.name}
        value={formValues[field.name]}
        onChange={handleChange}
        editable={true}
      />
      {errors[field.name] && (
        <p className="text-error" style={{ marginBottom: "1.5rem" }}>
          {errors[field.name]}
        </p>
      )}
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
          {errors[field.name] && <p className="text-error">
            {errors[field.name]}</p>}
        </div>
      );
    }

    // Password field with toggle
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
{errors[field.name] && (
  <p className="text-error" style={{ marginBottom: "1.5rem" }}>
    {errors[field.name]}
  </p>
)}
        </div>
      );
    }

    // Default input -> FloatingInput
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
 <button
            type="button"
            className="btn-submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> <span style={{ marginLeft: "0.5rem" }}>Adding...</span>
              </>
            ) : (
              "Add"
            )}
          </button>


          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
