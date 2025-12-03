import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditUserModal from './EditUserModal';
import UsersReportExport from './UsersReportExport'; // adjust path as needed
import { BASE_URL } from '../../config';

import AddChoice from '../../Components/AddChoice/AddChoice';
import AddModal from '../../Components/AddModal/AddModal';
import {fieldTemplates} from '../../data/FieldTemplates/users';
import {useAdminAuth} from '../../Hooks/Auth/useAdminAuth';
import Table from '../../Components/Table/Table.jsx';
import { formatDateTime } from '../../utils/formatDateTime.jsx';
import { showInfoFields } from '../../data/ShowInfoField/users.js';
import MessageModal from '../../Components/MessageModal/MessageModal.jsx';

const Users = () => {
  const choices = ["Admin", "Dentist" ,"Patient"];
  const [selected, setSelected] = useState(""); // stores selected choice
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { token, adminId } = useAdminAuth(); // get token from context
  const [users, setUsers] = useState([]);
  const column = [
    { header: "Name", accessor: "fullname" },
    { header: "Type of User", accessor: "usertype" },
    { header: "Date Created", accessor: "dateCreated" } // new column
  ];
  const tabledata = users.map(user => {
    const firstname = user.firstname?.trim();
    const lastname  = user.lastname?.trim();

    const fullname = firstname && lastname ? `${firstname} ${lastname}` : "Unknown";

    const dateCreated = user.created_at ? formatDateTime(user.created_at) : "Unknown";

    return {
      ...user,
      fullname,
      usertype: user.usertype,
      dateCreated, // formatted as MM/DD/YYYY hh:mm AM/PM using utility

      // ACTION BUTTON HANDLERS
      onEdit: () => handleEdit(user),
      onDelete: () => handleDelete(user.idusers),
    };
  });



  const [isEditing, setIsEditing] = useState(false);  // To toggle edit mode
  const [editingUser, setEditingUser] = useState(null);  // Holds the user being edited
  const [openSuggestion, setOpenSuggestion] = useState(null); // can be 'patient', 'dentist', or null
  const existingGender = ["female","male"];
  const [editFormData, setEditFormData] = useState({  username: '',email: '', password: '',usertype: '',firstname: '',lastname: '', birthdate: '', contact: '',address: '',   gender: '', allergies: '', medicalhistory: '', });  // Holds the form data
 

  useEffect(() => {
                 fetchUsers();
             }, []);

    useEffect(() => 
      {
       const handleClickOutside = (e) => 
        { 
          if (!e.target.closest('.usertype-input-wrapper')) 
            { 
              setOpenSuggestion(null); 
            } 
          };
          document.addEventListener('click', handleClickOutside);
          return () => document.removeEventListener('click',handleClickOutside);
        }
        , []);
        
        useEffect(() => 
          {
            const handleClickOutside = (e) => 
              {
                if (!e.target.closest('.form-group')) 
                  {
                    setOpenSuggestion(false);
                  }
              };
              
              document.addEventListener('click', handleClickOutside);
              return () => document.removeEventListener('click', handleClickOutside);
            }
            ,[]);
                
const [isLoading, setIsLoading] = useState(true);
const existingUsertype = ["patient", "dentist","admin"];
      const [message, setMessage] = useState('');
        const [messageType, setMessageType] = useState(''); // 'success' or 'error'
              const [confirmDeleteId, setConfirmDeleteId] = useState(null); // holds id to delete
              const [confirmMessage, setConfirmMessage] = useState('');
              const [showModal, setShowModal] = useState(false);
                     
   const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${BASE_URL}/api/website/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('API Response:', response);
    console.log('Data:', response.data);

    const usersData = response.data.records || [];
    setUsers(usersData);

    return { success: true, data: usersData }; // ✅ return object
  } catch (error) {
    console.error('Error fetching users:', error.response || error.message);
    return { success: false, data: [] }; // ✅ return default object
  } finally {
    setIsLoading(false);
  }
};

        

const handleDelete = (id) => {
  setConfirmDeleteId(id);
  setMessageType('error');
  setConfirmMessage("Are you sure you want to delete this user?");
  setShowModal(true);
};    

const confirmDeletion = async () => {
  const adminId = localStorage.getItem('adminId'); // make sure you have this stored

  try {
    const response = await fetch(`${BASE_URL}/api/website/users/${confirmDeleteId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ adminId }) // send adminId here
    });

    if (!response.ok) {
      const error = await response.json();
      setMessage({ type: 'error', text: error.message || 'Failed to delete user.' });
      return;
    }

    setUsers(prevUsers =>
      prevUsers.filter(user => user.idusers !== confirmDeleteId)
    );
    setMessage({ type: 'success', text: 'User deleted successfully.' });

  } catch (error) {
    console.error("Error deleting user:", error);
    setMessage({ type: 'error', text: 'An error occurred while deleting the user.' });
  } finally {
    setConfirmDeleteId(null);
    setShowModal(false);
  }
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
  setMessage({ type: 'error', text: 'Username is required.' });
  return;
}
if (!usernameRegex.test(editFormData.username.trim())) {
  setMessage({ type: 'error', text: 'Username must be 6–20 characters and start with a letter. Only letters, numbers, underscores, or dots allowed.' });
  return;
}

// Email
if (!editFormData.email.trim()) {
  setMessage({ type: 'error', text: 'Email is required.' });
  return;
}
if (!emailRegex.test(editFormData.email.trim())) {
  setMessage({ type: 'error', text: 'Invalid email format.' });
  return;
}
 // Password (optional – only required if user wants to change it)
if (editFormData.password.trim() && editFormData.password.trim().length < 6) {
  setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
  return;
}

// Usertype
if (!editFormData.usertype.trim()) {
  setMessage({ type: 'error', text: 'Usertype is required.' });
  return;
}

const allowedUsertypes = ['patient', 'dentist', 'admin'];
if (!allowedUsertypes.includes(editFormData.usertype.trim().toLowerCase())) {
  setMessage({ type: 'error', text: 'Usertype must be either "patient", "dentist" or "admin".' });
  return;
}

// Firstname
if (!editFormData.firstname.trim()) {
  setMessage({ type: 'error', text: 'Firstname is required.' });
  return;
}
if (!nameRegex.test(editFormData.firstname.trim())) {
  setMessage({ type: 'error', text: 'Firstname must contain only letters and valid characters (spaces, hyphens, apostrophes).' });
  return;
}
     // Lastname
if (!editFormData.lastname.trim()) {
  setMessage({ type: 'error', text: 'Lastname is required.' });
  return;
}
if (!nameRegex.test(editFormData.lastname.trim())) {
  setMessage({ type: 'error', text: 'Lastname must contain only letters and valid characters (spaces, hyphens, apostrophes).' });
  return;
}

// Birthdate (optional but validate if provided)
if (editFormData.birthdate.trim()) {
  const birthdate = new Date(editFormData.birthdate.trim());
  if (isNaN(birthdate.getTime())) {
    setMessage({ type: 'error', text: 'Birthdate must be a valid date.' });
    return;
  }

  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const m = today.getMonth() - birthdate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }

  if (age < 1) {
    setMessage({ type: 'error', text: 'User must be at least 1 year old.' });
    return;
  }
}

// Contact
if (!editFormData.contact.trim()) {
  setMessage({ type: 'error', text: 'Contact is required.' });
  return;
}
if (!phoneRegex.test(editFormData.contact.trim())) {
  setMessage({ type: 'error', text: 'Contact must be a valid Philippine mobile number starting with 09 and 11 digits long.' });
  return;
}
     // Address
if (!editFormData.address.trim()) {
  setMessage({ type: 'error', text: 'Address is required.' });
  return;
}

// Gender (optional but validate if provided)
if (editFormData.gender.trim()) {
  const allowedGenders = ['female', 'male'];
  if (!allowedGenders.includes(editFormData.gender.trim().toLowerCase())) {
    setMessage({ type: 'error', text: 'Gender must be either "female" or "male" if provided.' });
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
            `${BASE_URL}/api/website/users/${editingUser.idusers}`,
            updatedUser,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
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
setMessage({ type: 'success', text: 'User updated successfully.' });
            setIsEditing(false);
        }
        } catch (error) {
          console.error('Error updating user:', error);
     if (error.response) {
  const status = error.response.status;
  const serverMessage = error.response.data.message;

  if (status === 409) {
    setMessage({ type: 'error', text: serverMessage || 'Username or email already exists.' });
  } else if (status === 400) {
    setMessage({ type: 'error', text: serverMessage || 'Missing or invalid input fields.' });
  } else if (status === 500) {
    setMessage({ type: 'error', text: serverMessage || 'Internal server error occurred.' });
  } else {
    setMessage({ type: 'error', text: serverMessage || 'Unexpected error occurred.' });
  }
} else {
  setMessage({ type: 'error', text: 'Could not connect to server. Please try again later.' });
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
    
      
       const handleSelect = (choice) => {
    setSelected(choice);
    setOpen(false);
    setModalOpen(true);
  };

  
const handleAdd = async (formValues) => { 
  if (!token || !adminId) {
    setMessage({ type: "error", text: "You must be logged in as admin." });
    return;
  }

  try {
    console.log("📝 Original Form Values:", formValues);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("adminId", adminId);

    Object.entries(formValues).forEach(([key, value]) => {
      if (value !== null && value !== "" && value !== undefined) {
        if (key === "profile_image" && value instanceof File) {
          formData.append(key, value, value.name);
        } else {
          formData.append(key, value);
        }
      }
    });

    console.log("🧹 FormData ready:", [...formData.entries()]);

    // Send request to API
    const response = await axios.post(`${BASE_URL}/api/website/users`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 201) {
      await fetchUsers();
      setMessage({ type: "success", text: `✅ ${formValues.usertype} added successfully!` });

      // Close modal after message auto-dismiss
      setTimeout(() => {
        setModalOpen(false);
        setMessage(null);
      }, 2000);

    } else {
      setMessage({ type: "error", text: response.data?.message || "Something went wrong." });
    }

  } catch (error) {
    console.error("handleAdd error:", error);

    let errorMessage = "Could not connect to server. Please try again later.";
    if (error.response) {
      const { status, data } = error.response;
      if (status === 409) errorMessage = "Username or email already exists.";
      else if (status === 400) errorMessage = "Missing or invalid input fields.";
      else if (status === 500) errorMessage = "Internal server error occurred.";
      else errorMessage = data?.message || errorMessage;
    }

    setMessage({ type: "error", text: errorMessage });
  }
};

  return (
    <div className="container py-4">

  {/* Title, Add user, and Export buttons in the same row */}
<div className="d-flex align-items-center justify-content-between mb-3">
  {/* Left side: Title and Add User */}
  <div className="d-flex align-items-center gap-3">
   <div className="same-row">
<h1>User Management</h1>
 <div style={{ position: "relative" }}>
          <button className="btn-add" onClick={() => setOpen((prev) => !prev)}>
            +
          </button>
          {open && <AddChoice choices={choices} onSelect={handleSelect} />}
        </div>
   {/* Right side: Export buttons */}
    <div className="report-section">
  <UsersReportExport users={users} />
  </div>
  </div>
  </div>


 
</div>
  
{isLoading ? (
  <div className="loading-text">Loading...</div>
) : (
  <>
<Table  
  columns={column} 
  data={tabledata} 
  showInfoFields={showInfoFields}
  fieldColumn="usertype" // ← use the usertype property
/>

  </>
)}
 
 {isEditing && (
  <EditUserModal
    editFormData={editFormData}
    handleEditFormChange={handleEditFormChange}
    handleEditSubmit={handleEditSubmit}
    setIsEditing={setIsEditing}
    openSuggestion={openSuggestion}
    setOpenSuggestion={setOpenSuggestion}
    existingUsertype={existingUsertype}
    existingGender={existingGender}
    setEditFormData={setEditFormData}
  />
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

     {modalOpen && (
        <AddModal
         datatype="usertype"
          selected={selected}
          choices={choices}
          fields={fieldTemplates}       // <-- pass all user fields
          onClose={() => setModalOpen(false)}
          onSubmit={handleAdd}      // <-- receives validated formValues
        />
      )}

 {message && (
        <MessageModal
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}

    </div>
  );

  
};

export default Users;
