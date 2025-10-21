    import React, { useState, useEffect } from 'react';
    import axios from 'axios';
    import '../../design/service.css';
    import { BASE_URL } from '../../config';
import ServicesReportExport from './ServicesReportExport';
    const Services = () => {
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
 const [sortKey, setSortKey] = useState(''); // default sort by name
const [sortDirection, setSortDirection] = useState('asc');
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
    const [filterCategory, setFilterCategory] = useState('all');
    const [addFormData, setAddFormData] = React.useState({
      name: '',
      description: '',
      price: '',
      category: '',
    });
   
    const existingCategories = [...new Set(services.map(service => service.category).filter(Boolean))];

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
      
    
    const handleSearch = (e) => {
  const term = e.target.value.toLowerCase();
  setSearchTerm(term);
};


    const handleDelete = (id) => {
        setConfirmDeleteId(id);
        setMessageType('error');
        setConfirmMessage("Are you sure you want to delete this service?");
        setShowModal(true);
    };
   const confirmDeletion = async () => {
        try {
        const response = await fetch(`${BASE_URL}/api/website/services/${confirmDeleteId}`, {
            method: 'DELETE',
        });
    
        if (!response.ok) {
            const error = await response.json();
            showTemporaryModal(error.message || 'Failed to delete service.', 'error');
            return;
        }
    
        setServices(prevServices =>
            prevServices.filter(service => service.idservice !== confirmDeleteId)
        );
        showTemporaryModal('Service deleted successfully.', 'success');
        } catch (error) {
        console.error("Error deleting service:", error);
        showTemporaryModal('An error occurred while deleting the service.', 'error');
        } finally {
        setConfirmDeleteId(null);
            setShowModal(false);
        }
    };
    
    


  const handleSortKeyChange = (e) => {
  setSortKey(e.target.value);
};

const handleSortDirectionChange = (e) => {
  setSortDirection(e.target.value);
};


   

   const getSortedData = (data) => {
  if (!sortKey) return data;

  return [...data].sort((a, b) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    if (sortKey === 'price') {
      aVal = parseFloat(aVal);
      bVal = parseFloat(bVal);
    }

    if (typeof aVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    } else {
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    }
  });
};

const handleShowAll = () => {
  setSearchTerm('');
  setFilterCategory('all');
  setSortKey('');
  setSortDirection('asc');
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
      
            
  const filteredServices = services.filter((service) => {
  // Filter by category if needed
  if (filterCategory !== 'all' && service.category !== filterCategory) {
    return false;
  }

  // Filter by search term only on service name
  return service.name.toLowerCase().includes(searchTerm);
});

      
    const sortedFilteredServices = getSortedData(filteredServices);

    return (
        
        <div className="container py-4">
  {/* Title, Add Service, and Export buttons in the same row */}
<div className="d-flex align-items-center justify-content-between mb-3">
  {/* Left side: Title and Add Service button */}
  <div className="d-flex align-items-center gap-3">
    <h2 className="m-0">Dental Services</h2>
    <button className="add-service-btn" onClick={() => setIsAdding(true)}></button>
  </div>

  {/* Right side: Export buttons */}
  <ServicesReportExport services={services} />
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
    {/* Search, Sort, and Filter Controls */}
    <div className="filter-controls">
      <input
        type="text"
        className="form-control search-input search-margin-top"
        placeholder="Search service..."
        value={searchTerm}
        onChange={handleSearch}
      />

     <select
  className="form-select sort-select"
  value={sortKey}
  onChange={handleSortKeyChange}
>
  <option value="">Sort By</option>
  {/* Only name and price as options */}
  <option value="name">Name</option>
  <option value="price">Price</option>
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
  <label htmlFor="categoryFilter" style={{ margin: 0, fontWeight: '500', whiteSpace: 'nowrap' }}>
    Filter by Category:
  </label>
  <select
    id="categoryFilter"
    value={filterCategory}
    onChange={(e) => setFilterCategory(e.target.value)}
    className="form-select"
    style={{ minWidth: '150px' }}
  >
    <option value="all">All</option>
    {existingCategories.map((cat, index) => (
      <option key={index} value={cat}>{cat}</option>
    ))}
  </select>
</div>


     <button
  className="btn btn-secondary show-all-btn"
  onClick={handleShowAll}
>
  Show All
</button>

    </div>

    {/* Services Table */}
  <table className="table table-bordered services-table">
  <thead>
    <tr>
      <th>Service Name</th>
      <th>Description</th>
      <th>Price</th>
      <th>Category</th>
      <th className="actions-column"> </th>
    </tr>
  </thead>
  <tbody>
    {sortedFilteredServices.length === 0 ? (
      <tr>
        <td colSpan="5" className="text-center">No services found</td>
      </tr>
    ) : (
      sortedFilteredServices.map((service) => (
        <tr key={service.idservice}>
          <td>{service.name}</td>
          <td>{service.description}</td>
          <td>₱{parseFloat(service.price).toFixed(2)}</td>
          <td>{service.category}</td>
          <td className="actions-column">
            <button className="btn-edit me-2" onClick={() => handleEdit(service)}>✏️ Edit</button>
            <button className="btn-delete" onClick={() => handleDelete(service.idservice)}>🗑️ Delete</button>
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>

  </>
)}

        </div>
    );
    };

    export default Services;
