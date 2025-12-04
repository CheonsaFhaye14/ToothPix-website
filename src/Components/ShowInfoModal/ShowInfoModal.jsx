import FloatingInput from "../../utils/InputForm";
import { formatDateTime } from "../../utils/formatDateTime"; 
import CustomPicInput from "../../utils/CustomPicInput";
import FloatingTextArea from "../../utils/FloatingTextArea";

const ShowInfoModal = ({ row, onClose, fields, children, title = "Information" }) => {
  if (!row) return null;

  console.log("ShowInfoModal props:", { row, fields, children });

  const capitalizeWords = (str) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

// Build a default name if firstname/lastname or name exist
const fullName =
  capitalizeWords(
    `${row.firstname || ""} ${row.lastname || ""}`.trim()
  ) || (row.name ? capitalizeWords(row.name) : "");


  const displayedFields =
    fields?.filter(({ key }) => {
      const value = row[key];
      return (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        value.toString().trim() !== ""
      );
    }) || [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content show-info-modal"
        onClick={(e) => e.stopPropagation()}
      >
      <h2 className="modal-title" style={{ fontSize: "2rem", textAlign: "center", marginBottom: "1.5rem" }}>
  {fullName ? `${fullName}'s ${title}` : title}
</h2>


        <div className="modal-body">
          {displayedFields.map(({ key, label }) => {
            console.log("Rendering field:", key, "with value:", row[key]);

            return (
          <div className="input-container" key={key}>
  {key === "profile_image" ? (
    <CustomPicInput
      name={key}
      value={row[key]}
      editable={false}
      label={label || "Picture"}
    />
  ) : key === "description" || key === "notes" || key === "treatment_notes" ? (
    <FloatingTextArea
      name={key}
      value={row[key]}
      placeholder={label || capitalizeWords(key)}
      disabled={true}
    />
  ) : (
    <FloatingInput
      name={key}
      value={
        key === "created_at" || key === "updated_at"
          ? formatDateTime(row[key])
          : key === "birthdate"
          ? new Date(row[key]).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : key === "gender"
          ? capitalizeWords(row[key].toString())
          : key === "date"
          ? formatDateTime(row[key])
          : row[key].toString()
      }
      placeholder={label || capitalizeWords(key)}
      disabled={true}
    />
  )}
</div>

            );
          })}
        </div>

        <div className="action-buttons" style={{ marginBottom: "1.5rem" }}>
          {children}
          <button className="btn-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowInfoModal;
