import './service.css';
import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { BASE_URL } from '../../config';
import ServicesReportExport from './ServicesReportExport';

import AddModal from '../../Components/AddModal/AddModal.jsx';
import { fieldTemplates } from '../../data/FieldTemplates/services.js';
import {useAdminAuth} from '../../Hooks/Auth/useAdminAuth';
import Table from '../../Components/Table/Table.jsx';
import { showInfoFields } from '../../data/ShowInfoField/services.js';
import MessageModal from '../../Components/MessageModal/MessageModal.jsx';

const Services = () => {

const [modalOpen, setModalOpen] = useState(false); // modal open/close
const { token, adminId } = useAdminAuth(); // get token from context
const column = [
  { header: "Service Name", accessor: "name" },
  { header: "Price", accessor: "price" },
  { header: "Category", accessor: "category" } // new column
];
const [services, setServices] = useState([]);
const tabledata = services.map((service) => ({
  ...service, // spread the individual service object, not the whole array

  // ACTION BUTTON HANDLERS
  onEdit: () => handleEdit(service),
  onDelete: () => handleDelete(service.id), // adjust if your service ID field is different
}));

const [isLoading, setIsLoading] = useState(true);
const [message, setMessage] = useState('');
const [messageType, setMessageType] = useState(''); // 'success' or 'error'
const [showModal, setShowModal] = useState(false);
const [showModal2, setShowModal2] = useState(false);
const [confirmDeleteId, setConfirmDeleteId] = useState(null); // holds id to delete
const [confirmMessage, setConfirmMessage] = useState('');
const [editingService, setEditingService] = useState(null);  // Holds the service being edited
const [editFormData, setEditFormData] = useState({ name: '', description: '', price: '' });  // Holds the form data
const [isEditing, setIsEditing] = useState(false);  // To toggle edit mode
const [isAdding, setIsAdding] = React.useState(false);
const [addFormData, setAddFormData] = React.useState({
  name: '',
  description: '',
  price: '',
  category: '',
});


const existingCategories = [...new Set(services.map(service => service.category).filter(Boolean))];

const fieldsWithCategories = {
  ...fieldTemplates,
  Services: fieldTemplates.Services.map(field =>
    field.name === "category"
      ? {
          ...field,
          options: existingCategories.map(cat => ({ label: cat, value: cat }))
        }
      : field
  )
};

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
  

useEffect(() => {
    fetchServices();
}, []);

const fetchServices = async () => {
    try {
    const token = localStorage.getItem('jwt_token');
    const response = await axios.get(`${BASE_URL}/api/website/services`, {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    });
    setServices(response.data.services);
    } catch (error) {
    console.error('Error fetching services:', error);
    } finally {
    setIsLoading(false);
    }
};

const handleAddFormChange = (e) => {
  const { name, value } = e.target;
  setAddFormData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
};

const handleAddSubmit = async (e) => {
    e.preventDefault();
  
    // Validation
    if (!addFormData.name.trim()) {
      showTemporaryModal('Service Name is required.', 'error');
      return;
    }
  
    // Check for duplicate service name (case insensitive)
    const isDuplicate = services.some(
      (service) => service.name.toLowerCase() === addFormData.name.trim().toLowerCase()
    );
    if (isDuplicate) {
      showTemporaryModal('Service name already exists. Please choose a different name.', 'error');
      return;
    }
  
    if (!addFormData.price || isNaN(addFormData.price)) {
      showTemporaryModal('Valid Service Price is required.', 'error');
      return;
    }
    if (!addFormData.category.trim()) {
      showTemporaryModal('Category is required.', 'error');
      return;
    }
  
    const newService = {
      name: addFormData.name.trim(),
      description: addFormData.description.trim(),
      price: parseFloat(addFormData.price),
      category: addFormData.category.trim(),
    };
  
    try {
      const response = await axios.post(`${BASE_URL}/api/website/services`, newService, {
        headers: {
Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });

      if (response.status === 201) {
        // Add the newly created service to your list
        setServices((prevServices) => [...prevServices, response.data.service]);

        showTemporaryModal('Service added successfully.', 'success');
        setIsAdding(false);
        setAddFormData({ name: '', description: '', price: '', category: '' });
      }
    } catch (error) {
      console.error('Error adding service:', error);
      showTemporaryModal('Error adding service.', 'error');
    }
  };

const handleDelete = (id) => {
  setConfirmDeleteId(id);
  setMessageType("error");
  setConfirmMessage("Are you sure you want to delete this service?");
  setShowModal(true);
};

const confirmDeletion = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/website/services/${confirmDeleteId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      setMessage(error.message || "Failed to delete service.");
      setMessageType("error");
      return;
    }

    // remove from UI
    setServices((prev) =>
      prev.filter((s) => s.idservice !== confirmDeleteId)
    );

    setMessage("Service deleted successfully.");
    setMessageType("success");

    // keep modal open for a moment to show message
    setTimeout(() => {
      setShowModal(false);
      setConfirmDeleteId(null);
    }, 1500);
  } catch (error) {
    console.error("Error deleting service:", error);
    setMessage("An error occurred while deleting the service.");
    setMessageType("error");
  }
};

const handleEdit = (service) => {
    setEditingService(service); // Set the service to be edited
    setEditFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      category: service.category
    });
    setIsEditing(true); // Open the editing modal
  };
  
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
  
    // Validation: Check if name or price is empty or null
    if (!editFormData.name.trim()) {
      showTemporaryModal('Service Name is required.', 'error');
      return; // Prevent form submission
    }
    if (!editFormData.price || isNaN(editFormData.price)) {
      showTemporaryModal('Valid Service Price is required.', 'error');
      return; // Prevent form submission
    }
    if (!editFormData.category.trim()) {
      showTemporaryModal('Service Category is required.', 'error');
      return; // Prevent form submission
    }
  
    // Duplicate name check excluding the service currently being edited
    const isDuplicate = services.some(
      (service) =>
        service.name.toLowerCase() === editFormData.name.trim().toLowerCase() &&
        service.idservice !== editingService.idservice
    );
    if (isDuplicate) {
      showTemporaryModal('Service name already exists. Please choose a different name.', 'error');
      return;
    }
  
    const updatedService = {
      name: editFormData.name.trim(),
      description: editFormData.description.trim(),
      price: parseFloat(editFormData.price),
      category: editFormData.category.trim(),
    };
  
    try {
      const response = await axios.put(
        `${BASE_URL}/api/website/services/${editingService.idservice}`,
        updatedService,
        {
headers: {
  Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
},
        }
      );
  
      if (response.status === 200) {
        // Update the services state with the updated service
        setServices((prevServices) =>
prevServices.map((service) =>
  service.idservice === editingService.idservice
? { ...service, ...updatedService }
: service
)
        );
  
        showTemporaryModal('Service updated successfully.', 'success');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      showTemporaryModal('Error updating service.', 'error');
    } finally {
      setIsEditing(false);
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
      if (
        value !== null &&
        value !== "" &&
        value !== undefined &&
        !(key === "Services" && value === "services") // skip this specific field/value
      ) {
        formData.append(key, value);
      }
    });

    console.log("🧹 FormData ready:", [...formData.entries()]); // log FormData entries

    // Send request to API
    const response = await axios.post(`${BASE_URL}/api/website/services`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 201) {
      // Refresh services
      await fetchServices();
      setMessage({ type: "success", text: `✅ Service added successfully!` });
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
      if (status === 409) errorMessage = "Service Name already exists.";
      else if (status === 400) errorMessage = "Missing or invalid input fields.";
      else if (status === 500) errorMessage = "Internal server error occurred.";
      else errorMessage = data?.message || errorMessage;
    }

    setMessage({ type: "error", text: errorMessage });
  }
};

return (
    
    <div className="container py-4">
  {/* Title, Add Service, and Export buttons in the same row */}
<div className="d-flex align-items-center justify-content-between mb-3">
  {/* Left side: Title and Add Service button */}
  <div className="d-flex align-items-center gap-3">
     <div className="same-row">
<h1>Dental Services</h1>
<button className="btn-add" onClick={() => setModalOpen(true)}>+</button>
  
<div className="report-section">
  {/* Right side: Export buttons */}
  <ServicesReportExport services={services}/>
  </div>
  </div>
</div>
</div>
  {isEditing && (
  <div className="modal-overlay">
<div className="modal-box">
  <h2>Edit Service</h2>
  <form onSubmit={handleEditSubmit}>
    <div className="form-row">
      <div className="form-group">
        <label>Name</label>
        <input
type="text"
name="name"
value={editFormData.name}
onChange={handleEditFormChange}
className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <input
type="text"
name="description"
value={editFormData.description}
onChange={handleEditFormChange}
className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Price</label>
        <input
type="number"
name="price"
value={editFormData.price}
onChange={handleEditFormChange}
className="form-control"
step="0.01"
        />
      </div>

      {/* Category input with suggestions for editing */}
      <div className="form-group category-input-wrapper">
        <label>Category</label>
        <input
type="text"
name="category"
value={editFormData.category}
onChange={(e) => {
  const value = e.target.value;
  setEditFormData(prev => ({ ...prev, category: value }));
  setShowSuggestions(true);
}}
onFocus={() => setShowSuggestions(true)}
className="form-control"
autoComplete="off"
        />
        {showSuggestions && (
<ul className="suggestions-list-edit">
  {existingCategories
.filter(cat =>
  cat.toLowerCase().includes(editFormData.category.toLowerCase())
)
.map((cat, index) => (
  <li
    key={index}
    className="suggestion-item"
    onClick={() => {
      setEditFormData(prev => ({ ...prev, category: cat }));
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

{isAdding && (
  <div className="modal-overlay">
<div className="modal-box">
  <h2>Add New Service</h2>
  <form onSubmit={handleAddSubmit}>
    <div className="form-row">
    <div className="form-group">
      <input
        type="text"
        placeholder='Input Service Name'
        name="name"
        value={addFormData.name}
        onChange={handleAddFormChange}
        className="form-control"
      />
    </div>
    <div className="form-group">
      <input
        type="text"
        name="description"
        placeholder='Input Service Description (Optional)'
        value={addFormData.description}
        onChange={handleAddFormChange}
        className="form-control"
      />
    </div>
    <div className="form-group">
      <input
        type="number"
        name="price"
        placeholder='Input Service Price'
        value={addFormData.price}
        onChange={handleAddFormChange}
        className="form-control"
        step="0.01"
      />
    </div>
    <div className="form-group category-input-wrapper">
  <input
type="text"
name="category"
value={addFormData.category}
placeholder='Input Service Category'
onChange={(e) => {
  const value = e.target.value;
  setAddFormData(prev => ({ ...prev, category: value }));
  setShowSuggestions(true);
}}
onFocus={() => setShowSuggestions(true)}
className="form-control"
autoComplete="off"
  />
  {showSuggestions && (
<ul className="suggestions-list">
  {existingCategories
    .filter(cat =>
      cat.toLowerCase().includes(addFormData.category.toLowerCase())
    )
    .map((cat, index) => (
      <li
        key={index}
        className="suggestion-item"
        onClick={() => {
setAddFormData(prev => ({ ...prev, category: cat }));
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
    <div className="form-actions">
      <button type="submit" className="btn btn-primary">
        Add Service
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
{modalOpen && (
  <AddModal
    datatype="Services"             // for submission data
    choices={["Services"]}       // minimal default choice
    selected="Services"           // default active type
    fields={fieldsWithCategories}      // object: { Default: [...] }
    onClose={() => setModalOpen(false)}
    onSubmit={handleAdd}
  />
)}



  {showModal2 && (
  <div className="modal-overlay">
<div className={`modal-box ${messageType}`}>
  <p>{message}</p>
</div>
  </div>
)}






{isLoading ? (
  <div className="loading-text">Loading...</div>
) : (
  <>

<Table
  columns={column}   // your columns for service table
  data={tabledata}           // mapped service data with edit/delete
  showInfoFields={showInfoFields}
  fieldColumn="Services"     // selects which fields to show in modal
/>
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
    
 {message && (
        <MessageModal
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}

  </>
)}

    </div>
);
};

export default Services;
