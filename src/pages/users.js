import React, { useState, useEffect } from 'react';
import '../design/users.css';
import axios from 'axios';

const Users = () => {
    const baseUrl = 'https://toothpix-backend.onrender.com/api/app/users';
    const columns = ['idusers', 'fullname', 'usertype'];
    const [users, setUsers] = useState([]);
    const [visibleColumn, setVisibleColumn] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
        const [isEditing, setIsEditing] = useState(false);  // To toggle edit mode
        const [editingUser, setEditingUser] = useState(null);  // Holds the user being edited
             const [openSuggestion, setOpenSuggestion] = useState(null); // can be 'patient', 'dentist', or null
             const existingGender = [
                "female","male"
              ];
        useEffect(() => {
              const handleClickOutside = (e) => {
                if (!e.target.closest('.usertype-input-wrapper')) {
                  setOpenSuggestion(null);
                }
              };
              document.addEventListener('click', handleClickOutside);
              return () => document.removeEventListener('click', handleClickOutside);
            }, []);
        const [showSuggestions, setShowSuggestions] = useState(false);
              useEffect(() => {
                  const handleClickOutside = (e) => {
                    if (!e.target.closest('.form-group')) {
                      setShowSuggestions(false);
                    }
                  };
                  document.addEventListener('click', handleClickOutside);
                  return () => document.removeEventListener('click', handleClickOutside);
                }, []);
                
        const [editFormData, setEditFormData] = useState({  username: '',email: '', password: '',
            usertype: '',
            firstname: '',
            lastname: '',
            birthdate: '',
            contact: '',
            address: '', 
            gender: '',
            allergies: '',   
            medicalhistory: '', });  // Holds the form data
    
    const [isLoading, setIsLoading] = useState(true);
        const [sortKey, setSortKey] = useState(' '); // default sort by idusers
        const existingUsertype = [...new Set(users.map(user => user.usertype).filter(Boolean))];
    const [isAdding, setIsAdding] = React.useState(false);
      const [message, setMessage] = useState('');
        const [messageType, setMessageType] = useState(''); // 'success' or 'error'
          const [filterUsertype, setFilterUsertype] = useState('all');
          const [sortDirection, setSortDirection] = useState('asc');
              const [confirmDeleteId, setConfirmDeleteId] = useState(null); // holds id to delete
              const [confirmMessage, setConfirmMessage] = useState('');
              const [showModal, setShowModal] = useState(false);
             
            const [showModal2, setShowModal2] = useState(false);
    const [addFormData, setAddFormData] = React.useState({
        username: '',
        email:'',
        password: '',
        usertype: '',
        firstname: '',
        lastname: '',
        birthdate: '',
        contact: '',
        address: '', 
        gender: '',
        allergies: '',   
        medicalhistory: '',
         });
         
          useEffect(() => {
                 fetchUsers();
             }, []);

             const fetchUsers = async () => {
                try {
                  const token = localStorage.getItem('jwt_token');
                  console.log('Token:', token);
                  const response = await axios.get(baseUrl, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  console.log('API Response:', response);
                  console.log('Data:', response.data);
                  setUsers(response.data.records);
            
                } catch (error) {
                  console.error('Error fetching users:', error.response || error.message);
                } finally {
                  setIsLoading(false);
                }
              };
              

           
    const handleSortKeyChange = (e) => {
        const selectedKey = e.target.value;
        setSortKey(selectedKey);
        if (selectedKey === '') {
        setVisibleColumn('all');
        } else {
        setVisibleColumn(selectedKey);
        }
    };

    const handleSortDirectionChange = (e) => {
        setSortDirection(e.target.value);
    };
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        if (!term) {
        setVisibleColumn('all');
        return;
        }

        let matchedColumn = null;

        for (let col of columns) {
        const matchFound = users.some(user =>
            String(user[col] || '').toLowerCase().includes(term)
        );
        if (matchFound) {
            if (matchedColumn) {
            matchedColumn = 'all'; // More than one match found, show all
            break;
            } else {
            matchedColumn = col;
            }
        }
        }

        setVisibleColumn(matchedColumn || 'all');
    };
    const getSortedData = (data) => {
        if (!sortKey) return data;
      
        return [...data].sort((a, b) => {
          let aVal = sortKey === 'fullname' ? `${a.firstname} ${a.lastname}` : a[sortKey];
          let bVal = sortKey === 'fullname' ? `${b.firstname} ${b.lastname}` : b[sortKey];
      
          if (typeof aVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
          } else {
            return sortDirection === 'asc'
              ? String(aVal).localeCompare(String(bVal))
              : String(bVal).localeCompare(String(aVal));
          }
        });
      };
      
            const handleAddFormChange = (e) => {
                const { name, value } = e.target;
                setAddFormData((prevData) => ({
                  ...prevData,
                  [name]: value,
                }));
              };

              const handleDelete = (id) => {
                setConfirmDeleteId(id);
                setMessageType('error');
                setConfirmMessage("Are you sure you want to delete this user?");
                setShowModal(true);
            };    

             const confirmDeletion = async () => {
        try {
        const response = await fetch(`${baseUrl}/${confirmDeleteId}`, {
            method: 'DELETE',
        });
    
        if (!response.ok) {
            const error = await response.json();
            showTemporaryModal(error.message || 'Failed to delete user.', 'error');
            return;
        }
    
        setUsers(prevUsers =>
            prevUsers.filter(user => user.idusers !== confirmDeleteId)
        );
        showTemporaryModal('User deleted successfully.', 'success');
        } catch (error) {
        console.error("Error deleting user:", error);
        showTemporaryModal('An error occurred while deleting the user.', 'error');
        } finally {
        setConfirmDeleteId(null);
            setShowModal(false);
        }
    };
    const filteredUsers = users.filter((user) => {
        // Filter by usertype if filterUsertype is not 'all'
        if (filterUsertype !== 'all' && user.usertype !== filterUsertype) {
          return false;
        }
      
        // Normalize search term
        const search = searchTerm.toLowerCase();
      
        return columns.some((col) => {
          if (col === 'fullname') {
            const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
            return fullName.includes(search);
          }
          return String(user[col] || '').toLowerCase().includes(search);
        });
      });
      
    const sortedFilteredUsers = getSortedData(filteredUsers);
    const handleColumnClick = (column) => {
        setVisibleColumn(column);
    };
    const handleEdit = (user) => {
        const sanitize = (value) => (typeof value === 'string' ? value : value === null || value === undefined ? '' : String(value));
      
        setEditingUser(user);
        setEditFormData({
          username: sanitize(user.username),
          email: sanitize(user.email),
          password: '',
          usertype: sanitize(user.usertype),
          firstname: sanitize(user.firstname),
          lastname: sanitize(user.lastname),
          birthdate: sanitize(user.birthdate),
          contact: sanitize(user.contact),
          address: sanitize(user.address),
          gender: sanitize(user.gender),
          allergies: sanitize(user.allergies),
          medicalhistory: sanitize(user.medicalhistory),
        });
        setIsEditing(true);
      };
      
     
      
      const handleEditSubmit = async (e) => {
        e.preventDefault();
      
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z][a-zA-Z0-9._]{5,19}$/;
        const nameRegex = /^[a-zA-ZÀ-ÿ]+([ '-][a-zA-ZÀ-ÿ]+)*$/;
        const phoneRegex = /^09\d{9}$/;
      
        // Username
        if (!editFormData.username.trim()) {
          showTemporaryModal('Username is required.', 'error');
          return;
        }
        if (!usernameRegex.test(editFormData.username.trim())) {
          showTemporaryModal('Username must be 6–20 characters and start with a letter. Only letters, numbers, underscores, or dots allowed.', 'error');
          return;
        }
      
        // Email
        if (!editFormData.email.trim()) {
          showTemporaryModal('Email is required.', 'error');
          return;
        }
        if (!emailRegex.test(editFormData.email.trim())) {
          showTemporaryModal('Invalid email format.', 'error');
          return;
        }
      
       
    // Password (optional – only required if user wants to change it)
if (editFormData.password.trim() && editFormData.password.trim().length < 6) {
    showTemporaryModal('Password must be at least 6 characters long.', 'error');
    return;
  }
  
      
        // Usertype
        if (!editFormData.usertype.trim()) {
            showTemporaryModal('Usertype is required.', 'error');
            return;
          }

          const allowedUsertypes = ['patient', 'dentist','admin'];
  if (!allowedUsertypes.includes(editFormData.usertype.trim().toLowerCase())) {
    showTemporaryModal('Usertype must be either "patient", "dentist" or "admin".', 'error');
    return;
  }
      
        // Firstname
        if (!editFormData.firstname.trim()) {
          showTemporaryModal('Firstname is required.', 'error');
          return;
        }
        if (!nameRegex.test(editFormData.firstname.trim())) {
          showTemporaryModal('Firstname must contain only letters and valid characters (spaces, hyphens, apostrophes).', 'error');
          return;
        }
      
        // Lastname
        if (!editFormData.lastname.trim()) {
          showTemporaryModal('Lastname is required.', 'error');
          return;
        }
        if (!nameRegex.test(editFormData.lastname.trim())) {
          showTemporaryModal('Lastname must contain only letters and valid characters (spaces, hyphens, apostrophes).', 'error');
          return;
        }
      
        // Birthdate (optional but validate if provided)
        if (editFormData.birthdate.trim()) {
          const birthdate = new Date(editFormData.birthdate.trim());
          if (isNaN(birthdate.getTime())) {
            showTemporaryModal('Birthdate must be a valid date.', 'error');
            return;
          }
      
          const today = new Date();
          let age = today.getFullYear() - birthdate.getFullYear();
          const m = today.getMonth() - birthdate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
            age--;
          }
      
          if (age < 1) {
            showTemporaryModal('User must be at least 1 year old.', 'error');
            return;
          }
        }
      
        // Contact
        if (!editFormData.contact.trim()) {
          showTemporaryModal('Contact is required.', 'error');
          return;
        }
        if (!phoneRegex.test(editFormData.contact.trim())) {
          showTemporaryModal('Contact must be a valid Philippine mobile number starting with 09 and 11 digits long.', 'error');
          return;
        }
      
        // Address
        if (!editFormData.address.trim()) {
          showTemporaryModal('Address is required.', 'error');
          return;
        }
      
        // Gender (optional but validate if provided)
        if (editFormData.gender.trim()) {
          const allowedGenders = ['female', 'male'];
          if (!allowedGenders.includes(editFormData.gender.trim().toLowerCase())) {
            showTemporaryModal('Gender must be either "female" or "male" if provided.', 'error');
            return;
          }
        }
      
        const updatedUser = {
          username: editFormData.username.trim(),
          email: editFormData.email.trim(),
          password: editFormData.password.trim(),
          usertype: editFormData.usertype.trim(),
          firstname: editFormData.firstname.trim(),
          lastname: editFormData.lastname.trim(),
          birthdate: editFormData.birthdate.trim(),
          contact: editFormData.contact.trim(),
          address: editFormData.address.trim(),
          gender: editFormData.gender.trim(),
          allergies: editFormData.allergies.trim(),
          medicalhistory: editFormData.medicalhistory.trim(),
        };
      
        try {
          const response = await axios.put(
            `${baseUrl}/${editingUser.idusers}`,
            updatedUser,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
              },
            }
          );
      
          if (response.status === 200) {
            setUsers((prevUsers) =>
              prevUsers.map((user) =>
                user.idusers === editingUser.idusers
                  ? { ...user, ...updatedUser }
                  : user
              )
            );
            showTemporaryModal('User updated successfully.', 'success');
            setIsEditing(false);
        }
        } catch (error) {
          console.error('Error updating user:', error);
          if (error.response) {
            const status = error.response.status;
            const serverMessage = error.response.data.message;
            if (status === 409) {
              showTemporaryModal(serverMessage || 'Username or email already exists.', 'error');
            } else if (status === 400) {
              showTemporaryModal(serverMessage || 'Missing or invalid input fields.', 'error');
            } else if (status === 500) {
              showTemporaryModal(serverMessage || 'Internal server error occurred.', 'error');
            } else {
              showTemporaryModal(serverMessage || 'Unexpected error occurred.', 'error');
            }
          } else {
            showTemporaryModal('Could not connect to server. Please try again later.', 'error');
          }
        } 
      };
      
      const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      };
      

      const handleAddSubmit = async (e) => {
        e.preventDefault();
      
        // Regex for basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
        // Validation
        if (!addFormData.username.trim()) {
          showTemporaryModal('Username is required.', 'error');
          return;
        }

        const usernameRegex = /^[a-zA-Z][a-zA-Z0-9._]{5,19}$/;

if (!usernameRegex.test(addFormData.username.trim())) {
  showTemporaryModal('Username must be 6–20 characters and can only contain letters, numbers, underscores, or dots. It must start with a letter.', 'error');
  return;
}

      
        if (!addFormData.email.trim()) {
          showTemporaryModal('Email is required.', 'error');
          return;
        }
        if (!emailRegex.test(addFormData.email.trim())) {
          showTemporaryModal('Invalid email format.', 'error');
          return;
        }
      
        if (!String(addFormData.password).trim()) {
            showTemporaryModal('Password is required.', 'error');
            return;
          }

          if (!String(addFormData.password).trim() || addFormData.password.trim().length < 6) {
            showTemporaryModal('Password must be at least 6 characters long.', 'error');
            return;
          }
          
      
        if (!addFormData.usertype.trim()) {
          showTemporaryModal('Usertype is required.', 'error');
          return;
        }
        const allowedUsertypes = ['patient', 'dentist','admin'];
if (!allowedUsertypes.includes(addFormData.usertype.trim().toLowerCase())) {
  showTemporaryModal('Usertype must be either "patient", "dentist" or "admin".', 'error');
  return;
}

        const nameRegex = /^[a-zA-ZÀ-ÿ]+([ '-][a-zA-ZÀ-ÿ]+)*$/;

if (!addFormData.firstname.trim()) {
  showTemporaryModal('Firstname is required.', 'error');
  return;
}
if (!nameRegex.test(addFormData.firstname.trim())) {
  showTemporaryModal('Firstname must contain only letters and valid characters (spaces, hyphens, apostrophes).', 'error');
  return;
}

if (!addFormData.lastname.trim()) {
  showTemporaryModal('Lastname is required.', 'error');
  return;
}
if (!nameRegex.test(addFormData.lastname.trim())) {
  showTemporaryModal('Lastname must contain only letters and valid characters (spaces, hyphens, apostrophes).', 'error');
  return;
}
if (editFormData.birthdate && String(editFormData.birthdate).trim()) {
    const birthdate = new Date(addFormData.birthdate.trim());
    if (isNaN(birthdate.getTime())) {
      showTemporaryModal('Birthdate must be a valid date.', 'error');
      return;
    }
  
    // Calculate age in years
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const m = today.getMonth() - birthdate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }
  
    if (age < 1) {
      showTemporaryModal('User must be at least 1 year old.', 'error');
      return;
    }
  }
  
  
  if (!addFormData.contact.trim()) {
    showTemporaryModal('Contact is required.', 'error');
    return;
  }
  
  const phoneRegex = /^09\d{9}$/;
  if (!phoneRegex.test(addFormData.contact.trim())) {
    showTemporaryModal('Contact must be a valid Philippine mobile number starting with 09 and 11 digits long.', 'error');
    return;
  }
  

        if (!addFormData.address.trim()) {
          showTemporaryModal('Address is required.', 'error');
          return;
        }
        if (addFormData.gender.trim()) {
            const allowedGenders = ['female', 'male'];
            if (!allowedGenders.includes(addFormData.gender.trim().toLowerCase())) {
              showTemporaryModal('Gender must be either "female" or "male" if provided.', 'error');
              return;
            }
          }
          
      
        const newUser = {
          username: addFormData.username.trim(),
          email: addFormData.email.trim(),
          password: addFormData.password.trim(),
          usertype: addFormData.usertype.trim(),
          firstname: addFormData.firstname.trim(),
          lastname: addFormData.lastname.trim(),
          birthdate: addFormData.birthdate.trim(),
          contact: addFormData.contact.trim(),
          address: addFormData.address.trim(),
          gender: addFormData.gender.trim(),
          allergies: addFormData.allergies.trim(),
          medicalhistory: addFormData.medicalhistory.trim(),
        };
      
        try {
          const response = await axios.post(baseUrl, newUser, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
            },
          });
      
          if (response.status === 201) {
            setUsers((prevUsers) => [...prevUsers, response.data.user]);
            showTemporaryModal('User added successfully.', 'success');
            setIsAdding(false);
            setAddFormData({
              username: '', email: '', password: '', usertype: '',
              firstname: '', lastname: '', birthdate: '',
              contact: '', address: '', gender: '', allergies: '', medicalhistory: ''
            });
          }
        } catch (error) {
            if (error.response) {
              const status = error.response.status;
              const serverMessage = error.response.data.message;
          
              if (status === 409) {
                showTemporaryModal(serverMessage || 'Username or email already exists.', 'error');
              } else if (status === 400) {
                showTemporaryModal(serverMessage || 'Missing or invalid input fields.', 'error');
              } else if (status === 500) {
                showTemporaryModal(serverMessage || 'Internal server error occurred.', 'error');
              } else {
                showTemporaryModal(serverMessage || 'Unexpected error occurred.', 'error');
              }
            } else {
              // Network or other error not from server
              showTemporaryModal('Could not connect to server. Please try again later.', 'error');
            }
          }
          
      };
      
  const showTemporaryModal = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setShowModal2(true);
    setTimeout(() => {
      setShowModal2(false);
      setMessage('');
      setMessageType('');
    }, 2000);
  };
  
  return (
    <div className="container py-4">

   {/* Title and Add user side by side */}
   <div className="d-flex align-items-center mb-3 gap-4">
    <h2 className="m-0">User Management</h2>
    <button className="add-user-btn" onClick={() => setIsAdding(true)}
    >
</button>


  </div>

  {isAdding && (
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
            type="text"
            name="password"
             placeholder="Input Password"
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
                setAddFormData(prev => ({ ...prev, usertype: value }));
                setOpenSuggestion('usertype');
              }}
            onFocus={() => setOpenSuggestion('usertype')}
            className="form-control"
              autoComplete="off"
          />
            {openSuggestion === 'usertype' && (
    <ul className="suggestions-list">
      {existingUsertype
        .filter(cat =>
          cat.toLowerCase().includes(addFormData.usertype.toLowerCase())
        )
        .map((cat, index) => (
          <li
            key={index}
            className="suggestion-item"
            onClick={() => {
              setAddFormData(prev => ({ ...prev, usertype: cat }));
              setOpenSuggestion(null);
            }}
          >
            {cat}
          </li>
        ))}
    </ul>
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
                setAddFormData(prev => ({ ...prev, gender: value }));
                setOpenSuggestion("gender");
                }}
            className="form-control"
             autoComplete="off"
            onFocus={() => setOpenSuggestion("gender")}
          />
          {openSuggestion === "gender" && (
        <ul className="suggestions-list">
        {existingGender
            .filter(t =>
            t.toLowerCase().includes(addFormData.gender.toLowerCase())
            )
            .map((t, index) => (
            <li
                key={index}
                className="suggestion-item"
                onClick={() => {
                setAddFormData(prev => ({ ...prev, gender: t }));
                setOpenSuggestion(null);
                }}
            >
                {t}
            </li>
            ))}
        </ul>
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
)}


  
{isLoading ? (
  <div className="loading-text">Loading...</div>
) : (
  <>
    {/* Search, Sort, and Filter Controls */}
    <div className="filter-controls">
      <input
        type="text"
        className="form-control search-input search-margin-top"
        placeholder="Search users..."
        value={searchTerm}
        onChange={handleSearch}
      />

      <select
        className="form-select sort-select"
        value={sortKey}
        onChange={handleSortKeyChange}
      >
        <option value="">Sort By</option>
        {columns.map((col) => (
          <option key={col} value={col}>
            {col.charAt(0).toUpperCase() + col.slice(1)}
          </option>
        ))}
      </select>

      <select
        className="form-select sort-direction"
        value={sortDirection}
        onChange={handleSortDirectionChange}
      >
        <option value="asc">Asc</option>
        <option value="desc">Desc</option>
      </select>

      <div className="filter-container" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '3px' }}>
  <label htmlFor="usertypeFilter" style={{ margin: 0, fontWeight: '500', whiteSpace: 'nowrap' }}>
    Filter by Usertype:
  </label>
  <select
    id="usertypeFilter"
    value={filterUsertype}
    onChange={(e) => setFilterUsertype(e.target.value)}
    className="form-select"
    style={{ minWidth: '150px' }}
  >
    <option value="all">All</option>
    {existingUsertype.map((cat, index) => (
      <option key={index} value={cat}>{cat}</option>
    ))}
  </select>
</div>


      <button
        className="btn btn-secondary show-all-btn"
        onClick={() => setVisibleColumn('all')}
      >
        Show All
      </button>
    </div>

    {/* Users Table */}
    <table className="table table-bordered users-table">
      <thead>
        <tr>
          {visibleColumn === 'all'
            ? columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleColumnClick(col)}
                  className={!sortKey ? 'clickable-column' : ''}
                >
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                </th>
              ))
            : (
              <th key={visibleColumn}>
                {visibleColumn.charAt(0).toUpperCase() + visibleColumn.slice(1)}
              </th>
            )}
          <th className="actions-column"> </th>
        </tr>
      </thead>

      <tbody>
  {sortedFilteredUsers.map((user) => (
    <tr key={user.idusers}>
      {visibleColumn === 'all'
        ? columns.map((col) => (
            <td key={col}>
              {col === 'fullname'
                ? `${user.firstname} ${user.lastname}`
                : user[col]
              }
            </td>
          ))
        : (
          <td>
            {visibleColumn === 'fullname'
              ? `${user.firstname} ${user.lastname}`
              : user[visibleColumn]
            }
          </td>
        )}
      <td className="actions-column">
        <button className="btn-edit me-2"onClick={() => handleEdit(user)}>
          ✏️ Edit
        </button>
        <button className="btn-delete" onClick={() => handleDelete(user.idusers)}>
          🗑️ Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>


    </table>
  </>
)}
 
 {isEditing && (
  <div className="modal-overlay">
    <div className="modal-box">
      <h2>Edit User</h2>
      <form onSubmit={handleEditSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>username</label>
          <input
            type="text"
            name="username"
            value={editFormData.username}
            onChange={handleEditFormChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>email</label>
          <input
            type="text"
            name="email"
            value={editFormData.email}
            onChange={handleEditFormChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>password</label>
          <input
            type="password"
            name="password"
            value={editFormData.password}
            onChange={handleEditFormChange}
            className="form-control"
          />
        </div>
        <div className="form-group usertype-input-wrapper">
          <label>usertype</label>
          <input
            type="text"
            name="usertype"
            value={editFormData.usertype}
            onChange={(e) => {
                const value = e.target.value;
                setEditFormData(prev => ({ ...prev, usertype: value }));
                setShowSuggestions(true);
              }}
            onFocus={() => setShowSuggestions(true)}
            className="form-control"
              autoComplete="off"
          />
            {showSuggestions && (
    <ul className="suggestions-list">
      {existingUsertype
        .filter(cat =>
          cat.toLowerCase().includes(editFormData.usertype.toLowerCase())
        )
        .map((cat, index) => (
          <li
            key={index}
            className="suggestion-item"
            onClick={() => {
              setEditFormData(prev => ({ ...prev, usertype: cat }));
              setShowSuggestions(false);
            }}
          >
            {cat}
          </li>
        ))}
    </ul>
  )}
        </div>

        </div>
        <div className="form-row">
        <div className="form-group">
          <label>firstname</label>
          <input
            type="text"
            name="firstname"
            value={editFormData.firstname}
            onChange={handleEditFormChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>lastname</label>
          <input
            type="text"
            name="lastname"
            value={editFormData.lastname}
            onChange={handleEditFormChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>birthdate</label>
          <input
            type="date"
            name="birthdate"
            value={editFormData.birthdate}
            onChange={handleEditFormChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>contact</label>
          <input
            type="text"
            name="contact"
            value={editFormData.contact}
            onChange={handleEditFormChange}
            className="form-control"
          />
        </div>
        </div>
        <div className="form-row">
        <div className="form-group">
          <label>address</label>
          <input
            type="text"
            name="address"
            value={editFormData.address}
            onChange={handleEditFormChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>gender</label>
          <input
            type="text"
            name="gender"
            value={editFormData.gender}
            onChange={handleEditFormChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>allergies</label>
          <input
            type="text"
            name="allergies"
            value={editFormData.allergies}
            onChange={handleEditFormChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>medicalhistory</label>
          <input
            type="text"
            name="medicalhistory"
            value={editFormData.medicalhistory}
            onChange={handleEditFormChange}
            className="form-control"
          />
        </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Save Changes</button>
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
)}
{showModal2 && (
  <div className="modal-overlay">
    <div className={`modal-box ${messageType}`}>
      <p>{message}</p>
    </div>
  </div>
)}
     {showModal && (
    <div className="modal-overlay">
        <div className={`modal-box ${messageType}`}>
        <p>{confirmDeleteId ? confirmMessage : message}</p>
        {confirmDeleteId ? (
            <div style={{ marginTop: '1rem' }}>
            <button className="btn btn-danger me-2" onClick={confirmDeletion}>Yes</button>
            <button className="btn btn-secondary" onClick={() => {
                setShowModal(false);
                setConfirmDeleteId(null);
            }}>Cancel</button>
            </div>
        ) : null}
        </div>
    </div>
    )}
    </div>
  );

  
};

export default Users;
