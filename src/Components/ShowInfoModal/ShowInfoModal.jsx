import FloatingInput from "../../utils/InputForm"; 
import { formatDateTime } from "../../utils/formatDateTime"; 

const ShowInfoModal = ({ row, onClose, fields }) => {
  if (!row) return null;

  const capitalizeWords = (str) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const fullName = capitalizeWords(`${row.firstname || ""} ${row.lastname || ""}`.trim()) || "User Info";

  // Use the fields prop to determine which fields to display
  const displayedFields = fields?.filter(({ key }) => {
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
        <h2
          className="modal-title"
          style={{ fontSize: "2rem", textAlign: "center", marginBottom: "1.5rem" }}
        >
          {fullName}'s Information
        </h2>

        <div className="modal-body">
          {displayedFields.map(({ key, label }) => (
            <div className="input-container" key={key}>
              <FloatingInput
                name={key}
                value={
                  key === "created_at" || key === "updated_at"
                    ? formatDateTime(row[key])
                    : key === "birthdate"
                    ? new Date(row[key]).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    : key === "gender"
                    ? capitalizeWords(row[key].toString())
                    : row[key].toString()
                }
                placeholder={label || capitalizeWords(key)}
                disabled={true}
              />
            </div>
          ))}
        </div>

        <div className="modal-buttons">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowInfoModal;
