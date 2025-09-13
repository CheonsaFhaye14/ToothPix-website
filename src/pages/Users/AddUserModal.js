import React from "react";

const SuggestionsDropdown = ({ options, filterValue, onSelect }) => {
  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(filterValue.toLowerCase())
  );

  return (
    <ul className="suggestions-list">
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

export default function AddUserModal({
  addFormData,
  handleAddFormChange,
  handleAddSubmit,
  setIsAdding,
  openSuggestion,
  setOpenSuggestion,
  existingUsertype,
  existingGender,
  setAddFormData,
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Add New User</h2>
        <form onSubmit={handleAddSubmit}>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Input Username"
                value={addFormData.username}
                onChange={handleAddFormChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="email"
                placeholder="Input Email"
                value={addFormData.email}
                onChange={handleAddFormChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Input Password"
                autoComplete="new-password"
                value={addFormData.password}
                onChange={handleAddFormChange}
                className="form-control"
              />
            </div>
            <div className="form-group usertype-input-wrapper">
              <input
                type="text"
                name="usertype"
                placeholder="Select Usertype"
                value={addFormData.usertype}
                onChange={(e) => {
                  const value = e.target.value;
                  setAddFormData((prev) => ({ ...prev, usertype: value }));
                  setOpenSuggestion("usertype");
                }}
                onFocus={() => setOpenSuggestion("usertype")}
                className="form-control"
                autoComplete="off"
              />
              {openSuggestion === "usertype" && (
                <SuggestionsDropdown
                  options={existingUsertype}
                  filterValue={addFormData.usertype}
                  onSelect={(val) => {
                    setAddFormData((prev) => ({ ...prev, usertype: val }));
                    setOpenSuggestion(null);
                  }}
                />
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="firstname"
                placeholder="Input First Name"
                value={addFormData.firstname}
                onChange={handleAddFormChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="lastname"
                placeholder="Input Last Name"
                value={addFormData.lastname}
                onChange={handleAddFormChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <input
                type="date"
                name="birthdate"
                value={addFormData.birthdate}
                onChange={handleAddFormChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="contact"
                placeholder="Input Contact"
                value={addFormData.contact}
                onChange={handleAddFormChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="address"
                placeholder="Input Address"
                value={addFormData.address}
                onChange={handleAddFormChange}
                className="form-control"
              />
            </div>
            <div className="form-group usertype-input-wrapper">
              <input
                type="text"
                name="gender"
                placeholder="Select Gender"
                value={addFormData.gender}
                onChange={(e) => {
                  const value = e.target.value;
                  setAddFormData((prev) => ({ ...prev, gender: value }));
                  setOpenSuggestion("gender");
                }}
                onFocus={() => setOpenSuggestion("gender")}
                className="form-control"
                autoComplete="off"
              />
              {openSuggestion === "gender" && (
                <SuggestionsDropdown
                  options={existingGender}
                  filterValue={addFormData.gender}
                  onSelect={(val) => {
                    setAddFormData((prev) => ({ ...prev, gender: val }));
                    setOpenSuggestion(null);
                  }}
                />
              )}
            </div>
            <div className="form-group">
              <input
                type="text"
                name="allergies"
                placeholder="Input Allergies"
                value={addFormData.allergies}
                onChange={handleAddFormChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="medicalhistory"
                placeholder="Input Medical History"
                value={addFormData.medicalhistory}
                onChange={handleAddFormChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Add User
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
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
