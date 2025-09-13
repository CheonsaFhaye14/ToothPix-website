import React from "react";

const SuggestionsDropdown = ({ options, filterValue, onSelect }) => {
  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(filterValue.toLowerCase())
  );

  return (
    <ul className="suggestions-list-edit">
      {filtered.map((opt, index) => (
        <li
          key={index}
          className="suggestion-item"
          onClick={() => onSelect(opt)}
        >
          {opt}
        </li>
      ))}
    </ul>
  );
};

export default function EditUserModal({
  editFormData,
  handleEditFormChange,
  handleEditSubmit,
  setIsEditing,
  openSuggestion,
  setOpenSuggestion,
  existingUsertype,
  existingGender,
  setEditFormData,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Edit User</h2>
        <form onSubmit={handleEditSubmit}>
          {/* First row */}
          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={editFormData.username}
                onChange={handleEditFormChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="text"
                name="email"
                value={editFormData.email}
                onChange={handleEditFormChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Input New Password"
                value={editFormData.password}
                onChange={handleEditFormChange}
                className="form-control"
              />
            </div>
            <div className="form-group usertype-input-wrapper">
              <label>Usertype</label>
              <input
                type="text"
                name="usertype"
                value={editFormData.usertype}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditFormData((prev) => ({ ...prev, usertype: value }));
                  setOpenSuggestion("edit-usertype");
                }}
                onFocus={() => setOpenSuggestion("edit-usertype")}
                className="form-control"
                autoComplete="off"
              />
              {openSuggestion === "edit-usertype" && (
                <SuggestionsDropdown
                  options={existingUsertype}
                  filterValue={editFormData.usertype}
                  onSelect={(val) => {
                    setEditFormData((prev) => ({ ...prev, usertype: val }));
                    setOpenSuggestion(null);
                  }}
                />
              )}
            </div>
          </div>

          {/* Second row */}
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstname"
                value={editFormData.firstname}
                onChange={handleEditFormChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastname"
                value={editFormData.lastname}
                onChange={handleEditFormChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Birthdate</label>
              <input
                type="date"
                name="birthdate"
                value={editFormData.birthdate}
                onChange={handleEditFormChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Contact</label>
              <input
                type="text"
                name="contact"
                value={editFormData.contact}
                onChange={handleEditFormChange}
                className="form-control"
              />
            </div>
          </div>

          {/* Third row */}
          <div className="form-row">
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={editFormData.address}
                onChange={handleEditFormChange}
                className="form-control"
              />
            </div>

            <div className="form-group usertype-input-wrapper">
              <label>Gender</label>
              <input
                type="text"
                name="gender"
                placeholder="Select Gender"
                value={editFormData.gender}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditFormData((prev) => ({ ...prev, gender: value }));
                  setOpenSuggestion("edit-gender");
                }}
                onFocus={() => setOpenSuggestion("edit-gender")}
                className="form-control"
                autoComplete="off"
              />
              {openSuggestion === "edit-gender" && (
                <SuggestionsDropdown
                  options={existingGender}
                  filterValue={editFormData.gender}
                  onSelect={(val) => {
                    setEditFormData((prev) => ({ ...prev, gender: val }));
                    setOpenSuggestion(null);
                  }}
                />
              )}
            </div>

            <div className="form-group">
              <label>Allergies</label>
              <input
                type="text"
                name="allergies"
                value={editFormData.allergies}
                onChange={handleEditFormChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Medical History</label>
              <input
                type="text"
                name="medicalhistory"
                value={editFormData.medicalhistory}
                onChange={handleEditFormChange}
                className="form-control"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
