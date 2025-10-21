import React from "react";
import "./Header.css";

const Header = ({
  title,
  description,
  onAddClick,
  addLabel = "Add",
  children,
  icon,
}) => {
  return (
    <div className="admin-header mb-4">
      <div className="admin-header-top">
        {/* Left side: title and add button */}
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <h1 className="admin-header-title m-0">
            {icon && <span>{icon}</span>}
            {title}
          </h1>

          {onAddClick && (
            <button className="add-btn" onClick={onAddClick}>
              ➕ {addLabel}
            </button>
          )}
        </div>

        {/* Right side: children (e.g., export buttons or filters) */}
        <div className="admin-header-right">{children}</div>
      </div>

      {/* Optional description */}
      {description && <p className="admin-header-desc">{description}</p>}
    </div>
  );
};

export default Header;
