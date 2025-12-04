import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { exportAllPatientWaivers } from '../../Report/exportAllWaivers.js';
import EditModal from '../../Components/AddModal/EditModal.jsx';

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
    dateCreated,

    // ACTION BUTTON HANDLERS
    // onEdit: () => handleEdit(user),
    onEdit: () => handleEditClick(user),
    onDelete: () => handleDelete(user.idusers),
  };
});

 const handleEditClick = (user) => {
    setEditingUser(user); // open modal with this user's data
  };




  const [editingUser, setEditingUser] = useState(null);  // Holds the user being edited
 

  useEffect(() => {
                 fetchUsers();
             }, []);

    useEffect(() => 
      {
       const handleClickOutside = (e) => 
        { 
          if (!e.target.closest('.usertype-input-wrapper')) 
            { 
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
                  }
              };
              
              document.addEventListener('click', handleClickOutside);
              return () => document.removeEventListener('click', handleClickOutside);
            }
            ,[]);
                
const [isLoading, setIsLoading] = useState(true);
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
  
const handleEdit = async (userId, formValues) => {
  if (!token || !adminId) {
    setMessage({ type: "error", text: "You must be logged in as admin." });
    return;
  }

  try {
    console.log("📝 Original Form Values (Edit):", formValues);

    const formData = new FormData();
    formData.append("admin_id", adminId);

 Object.entries(formValues).forEach(([key, value]) => {
  if (value !== null && value !== "" && value !== undefined) {
    if (key === "profile_image" && value instanceof File) {
      formData.append(key, value, value.name);
    } else {
      formData.append(key, value);
    }
  }
});

// 👇 Add this after the loop
if (formValues.remove_image === true) {
  formData.append("remove_image", "true");
}


    console.log("🧹 FormData ready for edit:", [...formData.entries()]);

    // ✅ use userId, not formData.idusers
    const response = await axios.put(
      `${BASE_URL}/api/website/users/${userId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status === 200) {
      await fetchUsers();
      setMessage({
        type: "success",
        text: `✏️ ${formValues.usertype} updated successfully!`,
      });

      setTimeout(() => {
        setEditingUser(null);
        setMessage(null);
      }, 2000);
    } else {
      setMessage({
        type: "error",
        text: response.data?.message || "Something went wrong.",
      });
    }
  } catch (error) {
    console.error("handleEdit error:", error);

    let errorMessage = "Could not connect to server. Please try again later.";
    if (error.response) {
      const { status, data } = error.response;
      if (status === 409) errorMessage = "Username or email already exists.";
      else if (status === 400) errorMessage = "Missing or invalid input fields.";
      else if (status === 404) errorMessage = "User not found.";
      else if (status === 500) errorMessage = "Internal server error occurred.";
      else errorMessage = data?.message || errorMessage;
    }

    setMessage({ type: "error", text: errorMessage });
  }
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

         {/* ✅ New bulk export button */}
  <button
    className="btn-pdf-all"
    onClick={() =>
      exportAllPatientWaivers(users.filter((u) => u.usertype === "patient"))
    }
  >
    Export All Patient Waivers
  </button>
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
 


{editingUser && (
<EditModal
  datatype="usertype"
  selected={editingUser.usertype}
  choices={choices}
  fields={fieldTemplates}
  row={editingUser}
  onClose={() => setEditingUser(null)}
  onSubmit={(formValues) => handleEdit(editingUser.idusers, formValues)}
/>
)}

      
{showModal && (
    <div className="modal-overlay">
        <div className={`modal-box ${messageType}`}>
        <p>{confirmDeleteId ? confirmMessage : message}</p>
        {confirmDeleteId ? (
            <div className="action-buttons" style={{ marginTop: '1rem' }}>
    
            <button className="btn-submit" onClick={confirmDeletion}>Yes</button>
            <button className="btn-cancel" onClick={() => {
             
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
