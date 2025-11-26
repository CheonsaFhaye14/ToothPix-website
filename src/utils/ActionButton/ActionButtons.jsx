import React from "react";
import "./ActionButtons.css";

const ActionButtons = ({
  onEdit,
  onDelete,
  onUndo,
  editLabel = "✏️ Edit",
  deleteLabel = "🗑️ Delete",
  undoLabel = "↩️ Undo",
}) => {
  return (
    <div className="action-buttons" style={{ display: "flex", gap: "0.5rem" }}>
      {onEdit && (
        <button className="btn-edit" onClick={onEdit}>
          {editLabel}
        </button>
      )}
      {onDelete && (
        <button className="btn-delete" onClick={onDelete}>
          {deleteLabel}
        </button>
      )}
      {onUndo && (
        <button className="btn-undo" onClick={onUndo}>
          {undoLabel}
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
